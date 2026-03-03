import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

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

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: queue, error: qError } = await supabaseAdmin
      .from("notification_queue")
      .select("id, request_id, attempts")
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

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const results: { queue_id: string; success: boolean }[] = [];

    for (const entry of queue) {
      try {
        const { data: request, error: rError } = await supabaseAdmin
          .from("requests")
          .select("request_number, title, description, requester_email, company_id, companies(name)")
          .eq("id", entry.request_id)
          .single();

        if (rError || !request) {
          await supabaseAdmin.from("notification_queue").update({
            status: "failed",
            attempts: entry.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          }).eq("id", entry.id);
          results.push({ queue_id: entry.id, success: false });
          continue;
        }

        const companyName = (request as any).companies?.name || "";

        const { error: sendError } = await resend.emails.send({
          to: [NOTIFICATION_EMAIL],
          replyTo: request.requester_email || NOTIFICATION_EMAIL,
          template: {
            id: "new-request",
            variables: {
              REQUESTER_EMAIL: request.requester_email || "Non renseigné",
              REQUEST_ID: String(request.request_number),
              REQUEST_TITLE: request.title || "",
              COMPANY_NAME: companyName,
              REQUEST_MESSAGE: request.description || "Aucune description",
            },
          },
        });

        if (!sendError) {
          await supabaseAdmin.from("notification_queue").update({
            status: "sent",
            attempts: entry.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          }).eq("id", entry.id);
          results.push({ queue_id: entry.id, success: true });
        } else {
          console.error(`Resend error for queue ${entry.id}:`, sendError);
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
