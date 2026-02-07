import { useEffect, useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useTranslation } from '@/i18n/useTranslation';
import { Progress } from '@/components/ui/progress';

export function CompanyTransition() {
  const { switching, currentCompany } = useCompany();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'entering' | 'active' | 'exiting'>('idle');

  useEffect(() => {
    if (switching) {
      setVisible(true);
      setProgress(0);
      setPhase('entering');

      // Show content almost immediately, then animate progress
      const t0 = requestAnimationFrame(() => setPhase('active'));
      const t1 = setTimeout(() => setProgress(30), 50);
      const t2 = setTimeout(() => setProgress(60), 250);
      const t3 = setTimeout(() => setProgress(90), 500);

      return () => {
        cancelAnimationFrame(t0);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else if (visible) {
      setProgress(100);
      setPhase('exiting');
      const exitTimer = setTimeout(() => {
        setVisible(false);
        setPhase('idle');
        setProgress(0);
      }, 300);
      return () => clearTimeout(exitTimer);
    }
  }, [switching]);

  if (!visible) return null;

  const companyName = currentCompany?.company?.name || '';
  const initial = companyName.charAt(0).toUpperCase() || '?';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300 ${
        phase === 'exiting' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Company initial */}
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-3xl font-bold shadow-lg transition-all duration-300 ${
            phase === 'entering' ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {initial}
        </div>

        {/* Company name */}
        <p
          className={`text-lg font-semibold text-foreground transition-all duration-400 ${
            phase === 'entering' ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          {companyName}
        </p>

        {/* Loading text */}
        <p
          className={`text-sm text-muted-foreground transition-all duration-400 ${
            phase === 'entering' ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ transitionDelay: '150ms' }}
        >
          {t('common.switchingCompany')}
        </p>

        {/* Progress bar */}
        <div
          className={`w-48 transition-all duration-400 ${
            phase === 'entering' ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    </div>
  );
}
