import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// ── Configurable recipient ──
const NOTIFICATION_EMAIL = "delivered+legal@resend.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { request_number, title, description, company_name, requester_email } = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY") as string;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portail Entreprises <noreply@liste-naissance.thomasbs.fr>",
        to: [NOTIFICATION_EMAIL],
        reply_to: requester_email || NOTIFICATION_EMAIL,
        template: {
          id: "bb34b22d-bee5-4773-9299-01a4af82ab88",
          variables: {
            REQUESTER_EMAIL: requester_email || "Non renseigné",
            REQUEST_ID: String(request_number),
            REQUEST_TITLE: title || "",
            COMPANY_NAME: company_name || "",
            REQUEST_MESSAGE: description || "Aucune description",
          },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Resend API error:", err);
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    console.log("Notification email sent:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("notify-new-request error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
