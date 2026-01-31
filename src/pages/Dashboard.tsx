import { useCompany } from '@/contexts/CompanyContext';
import { Building2, FileText, Scale, Calculator, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const sections = [
  { title: 'Entreprise', url: '/entreprise', icon: Building2, permission: 'entreprise' as const, description: 'Informations et documents de l\'entreprise' },
  { title: 'Contrats et factures', url: '/contrats', icon: FileText, permission: 'contrats' as const, description: 'Vos contrats et factures' },
  { title: 'Juridique', url: '/juridique', icon: Scale, permission: 'juridique' as const, description: 'Documents juridiques' },
  { title: 'Comptabilité', url: '/comptabilite', icon: Calculator, permission: 'comptabilite' as const, description: 'Documents comptables' },
  { title: 'Finance', url: '/finance', icon: TrendingUp, permission: 'finance' as const, description: 'Informations financières' },
];

export default function Dashboard() {
  const { currentCompany, hasPermission, companies } = useCompany();

  const visibleSections = sections.filter(s => hasPermission(s.permission));

  if (!currentCompany) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenue</h1>
          <p className="text-muted-foreground">
            Vous n'êtes associé à aucune entreprise pour le moment.
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            Aucune entreprise
          </h2>
          <p className="text-muted-foreground text-center max-w-md mt-2">
            Contactez un administrateur pour être ajouté à une entreprise.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {currentCompany.company.name}
        </h1>
        <p className="text-muted-foreground">
          Accédez aux différentes sections de votre entreprise
        </p>
      </div>

      {visibleSections.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleSections.map((section) => (
            <NavLink key={section.url} to={section.url}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </NavLink>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            Aucune section accessible
          </h2>
          <p className="text-muted-foreground text-center max-w-md mt-2">
            Vous n'avez pas de permissions pour accéder aux sections de cette entreprise.
            Contactez un administrateur pour modifier vos accès.
          </p>
        </div>
      )}
    </div>
  );
}
