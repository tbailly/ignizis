import { Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MentionsLegales() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mentions légales</h1>
        <p className="text-muted-foreground">
          Informations légales sur l'éditeur et l'hébergeur
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Éditeur du site
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            <strong className="text-foreground">Raison sociale :</strong> [Nom de l'entreprise]
          </p>
          <p>
            <strong className="text-foreground">Forme juridique :</strong> [Forme juridique]
          </p>
          <p>
            <strong className="text-foreground">Capital social :</strong> [Capital] €
          </p>
          <p>
            <strong className="text-foreground">Siège social :</strong> [Adresse complète]
          </p>
          <p>
            <strong className="text-foreground">RCS :</strong> [Numéro RCS]
          </p>
          <p>
            <strong className="text-foreground">SIRET :</strong> [Numéro SIRET]
          </p>
          <p>
            <strong className="text-foreground">Numéro de TVA :</strong> [Numéro TVA]
          </p>
          <p>
            <strong className="text-foreground">Directeur de publication :</strong> [Nom du directeur]
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hébergeur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            <strong className="text-foreground">Nom :</strong> [Nom de l'hébergeur]
          </p>
          <p>
            <strong className="text-foreground">Adresse :</strong> [Adresse de l'hébergeur]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
