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
import { useTranslation } from '@/i18n/useTranslation';

type EmailFormData = { email: string };

// Check if auto-confirm mode is enabled (for development/testing)
const isAutoConfirmEnabled = import.meta.env.VITE_AUTOCONFIRM !== 'false';

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t } = useTranslation();

  const emailSchema = z.object({
    email: z.string().email(t('auth.emailInvalid')),
  });

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
          toast.error(t('auth.userNotFound'));
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

      toast.success(t('auth.loginSuccess'));
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
          return;
        }
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Auth error:', error);
      }

      setEmailSent(true);
      toast.success(t('auth.emailSent'));
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(t('auth.unexpectedError'));
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
          <CardTitle className="text-2xl">{t('auth.title')}</CardTitle>
          <CardDescription>
            {emailSent
              ? t('auth.checkInbox')
              : isAutoConfirmEnabled
                ? t('auth.description')
                : t('auth.descriptionMagicLink')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                {t('auth.emailSentMessage')}
              </p>
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="mt-4"
              >
                {t('auth.tryAnotherEmail')}
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
                      <FormLabel>{t('auth.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('auth.emailPlaceholder')}
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
                  {isAutoConfirmEnabled ? t('auth.submit') : t('auth.submitMagicLink')}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
