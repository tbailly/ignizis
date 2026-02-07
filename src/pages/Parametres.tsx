import { useState } from 'react';
import { Settings, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';

export default function Parametres() {
  const { profile, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;
      toast.success(t('settings.nameUpdated'));
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error(t('settings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const themeOptions = [
    { value: 'light' as const, label: t('settings.themeLight'), icon: Sun },
    { value: 'dark' as const, label: t('settings.themeDark'), icon: Moon },
    { value: 'system' as const, label: t('settings.themeSystem'), icon: Monitor },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('settings.profile')}
          </CardTitle>
          <CardDescription>
            {t('settings.personalInfo')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('settings.email')}</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t('settings.name')}</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('settings.namePlaceholder')}
              />
              <Button onClick={handleSaveName} disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearance')}</CardTitle>
          <CardDescription>
            {t('settings.appearanceDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                  theme === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <option.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
