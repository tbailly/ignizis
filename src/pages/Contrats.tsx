import { FileText } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

export default function Contrats() {
  const { currentCompany } = useCompany();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes contrats et factures</h1>
        <p className="text-muted-foreground">
          {currentCompany?.company.name}
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          Section Contrats et Factures
        </h2>
        <p className="text-muted-foreground text-center max-w-md mt-2">
          Cette section contiendra vos contrats et factures.
        </p>
      </div>
    </div>
  );
}
