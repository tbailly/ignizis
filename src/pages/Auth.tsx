import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const emailSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});

type EmailFormData = z.infer<typeof emailSchema>;

// Check if auto-confirm mode is enabled (for development/testing)
const isAutoConfirmEnabled = import.meta.env.VITE_AUTOCONFIRM !== 'false';

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleAutoLogin = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('auto-login', {
        body: { email },
      });

      if (error) {
        console.error('Auto-login function error:', error);
        return false;
      }

      if (data.error) {
        if (data.code === 'USER_NOT_FOUND') {
          toast.error('Utilisateur non trouvé');
        } else {
          console.error('Auto-login error:', data.error);
        }
        return false;
      }

      // Use the OTP code to verify
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: data.otp,
        type: 'email',
      });

      if (verifyError) {
        console.error('OTP verification error:', verifyError);
        return false;
      }

      toast.success('Connexion réussie !');
      return true;
    } catch (error) {
      console.error('Auto-login error:', error);
      return false;
    }
  };

  const onSubmit = async (data: EmailFormData) => {
    try {
      setLoading(true);

      // If auto-confirm is enabled, try instant login
      if (isAutoConfirmEnabled) {
        const success = await handleAutoLogin(data.email);
        if (success) {
          return; // Successfully logged in
        }
        // If auto-login fails (user not found, etc.), fall back to magic link
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        // Don't reveal if user exists or not
        console.error('Auth error:', error);
      }

      // Always show success message (security: don't reveal if email exists)
      setEmailSent(true);
      toast.success('Email envoyé !');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            {emailSent
              ? 'Vérifiez votre boîte de réception'
              : isAutoConfirmEnabled
                ? 'Entrez votre email pour vous connecter instantanément'
                : 'Entrez votre email pour recevoir un lien de connexion'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Si un compte existe avec cette adresse email, vous recevrez un lien de connexion dans quelques instants.
              </p>
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="mt-4"
              >
                Essayer une autre adresse
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="votre@email.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAutoConfirmEnabled ? 'Se connecter' : 'Envoyer le lien de connexion'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
