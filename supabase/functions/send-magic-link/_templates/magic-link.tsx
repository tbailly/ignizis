import React from "https://esm.sh/react@18.3.1";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Hr,
  Section,
} from "https://esm.sh/@react-email/components@0.0.22";

interface MagicLinkEmailProps {
  supabase_url: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
}

export const MagicLinkEmail = ({
  supabase_url,
  token_hash,
  redirect_to,
  email_action_type,
}: MagicLinkEmailProps) => {
  const magicLinkUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

  return (
    React.createElement(Html, null,
      React.createElement(Head, null),
      React.createElement(Preview, null, "Votre lien de connexion sécurisé"),
      React.createElement(Body, { style: main },
        React.createElement(Container, { style: container },
          React.createElement(Section, { style: logoSection },
            React.createElement(Heading, { style: h1 }, "Portail Entreprises")
          ),
          
          React.createElement(Heading, { style: h2 }, "Connexion à votre compte"),
          
          React.createElement(Text, { style: text },
            "Vous avez demandé un lien de connexion pour accéder à votre espace. Cliquez sur le bouton ci-dessous pour vous connecter :"
          ),
          
          React.createElement(Section, { style: buttonSection },
            React.createElement(Link, { href: magicLinkUrl, style: button }, "Se connecter")
          ),
          
          React.createElement(Text, { style: textSmall },
            "Ou copiez et collez ce lien dans votre navigateur :"
          ),
          React.createElement(Text, { style: linkText }, magicLinkUrl),
          
          React.createElement(Hr, { style: hr }),
          
          React.createElement(Text, { style: footer },
            "Ce lien expire dans 1 heure. Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité."
          ),
          
          React.createElement(Text, { style: footer },
            `© ${new Date().getFullYear()} Portail Entreprises. Tous droits réservés.`
          )
        )
      )
    )
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  maxWidth: '560px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const h1 = {
  color: '#1a1a2e',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1a1a2e',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const textSmall = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 8px',
  textAlign: 'center' as const,
};

const linkText = {
  color: '#525f7f',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  wordBreak: 'break-all' as const,
};

const buttonSection = {
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#1a1a2e',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

export default MagicLinkEmail;
