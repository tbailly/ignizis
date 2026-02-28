import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/useTranslation';

type EmailFormData = { email: string };

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
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const onSubmit = async (data: EmailFormData) => {
    try {
      setLoading(true);
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-user-exists', {
        body: { email: data.email },
      });
      if (checkError) console.error('Check user error:', checkError);

      if (checkData?.exists) {
        const { error } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) console.error('Auth error:', error);
      } else {
        console.log(`Login attempt for non-existent email: ${data.email}`);
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-4">
      {/* Gradient orb background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            IGNIZIS
          </h1>
          <p className="mt-1 text-sm font-light tracking-[0.3em] text-white/60">
            LAUNCH GLOBAL GROW LIMITLESS
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">{t('auth.title')}</h2>
            <p className="mt-1 text-sm text-white/50">
              {emailSent ? t('auth.checkInbox') : t('auth.descriptionMagicLink')}
            </p>
          </div>

          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-white/60 text-sm">{t('auth.emailSentMessage')}</p>
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="mt-4 border-white/20 text-white hover:bg-white/10"
              >
                {t('auth.tryAnotherEmail')}
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">{t('auth.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('auth.emailPlaceholder')}
                          autoComplete="email"
                          className="border-white/15 bg-white/5 text-white placeholder:text-white/30 focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('auth.submitMagicLink')}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
