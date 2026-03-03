import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const NOTIFICATION_EMAIL = "legal@idkapital.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const { queue_id, request_number, title, description, company_name, requester_email } = await req.json();

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { error: sendError } = await resend.emails.send({
      to: [NOTIFICATION_EMAIL],
      replyTo: requester_email || NOTIFICATION_EMAIL,
      template: {
        id: "new-request",
        variables: {
          REQUESTER_EMAIL: requester_email || "Non renseigné",
          REQUEST_ID: String(request_number),
          REQUEST_TITLE: title || "",
          COMPANY_NAME: company_name || "",
          REQUEST_MESSAGE: description || "Aucune description",
        },
      },
    });

    let userSendError = null;
    if (!sendError && requester_email) {
      const result = await resend.emails.send({
        to: [requester_email],
        template: { id: "new-request-user" },
      });
      userSendError = result.error;
      if (userSendError) {
        console.error("Resend user email error:", userSendError);
      }
    }

    const anyError = sendError || userSendError;

    if (anyError) {
      console.error("Resend SDK error:", anyError);

      if (queue_id) {
        await supabaseAdmin
          .from("notification_queue")
          .update({
            status: "failed",
            attempts: 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq("id", queue_id);
      }

      return new Response(JSON.stringify({ error: (anyError as any).message || "Send error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Both notification emails sent via Resend SDK");

    if (queue_id) {
      await supabaseAdmin
        .from("notification_queue")
        .update({
          status: "sent",
          attempts: 1,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", queue_id);
    }

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
