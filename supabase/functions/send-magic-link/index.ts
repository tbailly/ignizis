import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from "https://esm.sh/react@18.3.1";
import { render } from "https://esm.sh/@react-email/render@0.0.12";
import { MagicLinkEmail } from "./_templates/magic-link.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    // Verify webhook signature
    const wh = new Webhook(hookSecret);
    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };

    console.log(`Sending magic link email to ${user.email}`);

    // Render the React Email template
    const emailComponent = MagicLinkEmail({
      supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
      token_hash,
      redirect_to,
      email_action_type,
    });

    const html = render(emailComponent);

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: "Portail Entreprises <noreply@liste-naissance.thomasbs.fr>",
      to: [user.email],
      subject: "Votre lien de connexion - Portail Entreprises",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log(`Magic link email sent successfully to ${user.email}`);

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in send-magic-link function:", error);
    const err = error as { code?: number; message?: string };
    return new Response(
      JSON.stringify({
        error: {
          http_code: err.code || 500,
          message: err.message || "Internal server error",
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
