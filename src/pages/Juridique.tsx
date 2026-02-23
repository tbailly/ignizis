import { useState } from 'react';
import { Scale, Lock } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useTranslation } from '@/i18n/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';

export default function Juridique() {
  const { currentCompany, hasPermission, refreshCompanies } = useCompany();
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleActivate = async () => {
    if (!currentCompany?.company?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ perm_legal: true })
        .eq('id', currentCompany.company.id);
      if (error) throw error;
      toast.success(t('legal.activateSuccess'));
      setConfirmOpen(false);
      setChecked(false);
      refreshCompanies();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t('common.saving'));
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission('legal')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('legal.title')}</h1>
          <p className="text-muted-foreground">{currentCompany?.company.name}</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
          <Lock className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">{t('common.lockedTitle')}</h2>
          <p className="text-muted-foreground text-center max-w-md mt-2">{t('common.lockedDescription')}</p>
          <Button className="mt-6" onClick={() => { setChecked(false); setConfirmOpen(true); }}>
            {t('legal.activateButton')}
          </Button>
        </div>

        <Dialog open={confirmOpen} onOpenChange={(o) => { if (!o) { setConfirmOpen(false); setChecked(false); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('legal.activateTitle')}</DialogTitle>
              <DialogDescription>{t('legal.activateDescription')}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">{t('legal.activateDisclaimer')}</p>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="legal-confirm"
                  checked={checked}
                  onCheckedChange={(v) => setChecked(v === true)}
                />
                <label htmlFor="legal-confirm" className="text-sm leading-tight cursor-pointer">
                  {t('legal.activateCheckbox')}
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setConfirmOpen(false); setChecked(false); }} disabled={saving}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleActivate} disabled={!checked || saving}>
                {saving ? t('common.saving') : t('legal.activateConfirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('legal.title')}</h1>
        <p className="text-muted-foreground">{currentCompany?.company.name}</p>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
        <Scale className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">{t('legal.sectionTitle')}</h2>
        <p className="text-muted-foreground text-center max-w-md mt-2">{t('legal.sectionDescription')}</p>
      </div>
    </div>
  );
}
