import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const NOTIFICATION_EMAIL = "delivered+legal@resend.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate service role key
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceKey!,
  );

  try {
    // Get pending/failed entries with < 5 attempts
    const { data: queue, error: qError } = await supabaseAdmin
      .from("notification_queue")
      .select("id, request_id")
      .in("status", ["pending", "failed"])
      .lt("attempts", 5)
      .order("created_at", { ascending: true })
      .limit(50);

    if (qError) throw qError;
    if (!queue || queue.length === 0) {
      return new Response(JSON.stringify({ message: "No pending notifications" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY") as string;
    const results: { queue_id: string; success: boolean }[] = [];

    for (const entry of queue) {
      try {
        // Get request + company data
        const { data: request, error: rError } = await supabaseAdmin
          .from("requests")
          .select("request_number, title, description, requester_email, company_id, companies(name)")
          .eq("id", entry.request_id)
          .single();

        if (rError || !request) {
          // Mark as failed if request no longer exists
          await supabaseAdmin.from("notification_queue").update({
            status: "failed",
            attempts: entry.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          }).eq("id", entry.id);
          results.push({ queue_id: entry.id, success: false });
          continue;
        }

        const companyName = (request as any).companies?.name || "";

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Portail Entreprises <noreply@liste-naissance.thomasbs.fr>",
            to: [NOTIFICATION_EMAIL],
            reply_to: request.requester_email || NOTIFICATION_EMAIL,
            template: {
              id: "bb34b22d-bee5-4773-9299-01a4af82ab88",
              variables: {
                REQUESTER_EMAIL: request.requester_email || "Non renseigné",
                REQUEST_ID: String(request.request_number),
                REQUEST_TITLE: request.title || "",
                COMPANY_NAME: companyName,
                REQUEST_MESSAGE: request.description || "Aucune description",
              },
            },
          }),
        });

        if (response.ok) {
          await supabaseAdmin.from("notification_queue").update({
            status: "sent",
            attempts: entry.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          }).eq("id", entry.id);
          results.push({ queue_id: entry.id, success: true });
        } else {
          const errText = await response.text();
          console.error(`Resend error for queue ${entry.id}:`, errText);
          await supabaseAdmin.from("notification_queue").update({
            status: "failed",
            attempts: entry.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          }).eq("id", entry.id);
          results.push({ queue_id: entry.id, success: false });
        }
      } catch (innerErr) {
        console.error(`Error processing queue ${entry.id}:`, innerErr);
        await supabaseAdmin.from("notification_queue").update({
          status: "failed",
          attempts: entry.attempts + 1,
          last_attempt_at: new Date().toISOString(),
        }).eq("id", entry.id);
        results.push({ queue_id: entry.id, success: false });
      }
    }

    console.log("Retry results:", results);
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("retry-failed-notifications error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
