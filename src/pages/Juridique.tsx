import { Scale } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

export default function Juridique() {
  const { currentCompany } = useCompany();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Juridique</h1>
        <p className="text-muted-foreground">
          {currentCompany?.company.name}
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
        <Scale className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          Section Juridique
        </h2>
        <p className="text-muted-foreground text-center max-w-md mt-2">
          Cette section contiendra les documents et informations juridiques.
        </p>
      </div>
    </div>
  );
}
