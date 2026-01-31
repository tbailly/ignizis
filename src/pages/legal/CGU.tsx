import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CGU() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Article 1 - Objet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation 
            de la plateforme de gestion documentaire multi-entreprises.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Article 2 - Accès au service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            L'accès au service est réservé aux utilisateurs disposant d'un compte valide. 
            L'authentification s'effectue via un lien de connexion envoyé par email (magic link).
          </p>
          <p>
            L'utilisateur s'engage à ne pas partager son accès avec des tiers non autorisés.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Article 3 - Responsabilités</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            <strong className="text-foreground">Responsabilité de l'éditeur :</strong> L'éditeur s'engage 
            à mettre en œuvre tous les moyens nécessaires pour assurer la disponibilité et la sécurité du service.
          </p>
          <p>
            <strong className="text-foreground">Responsabilité de l'utilisateur :</strong> L'utilisateur 
            est responsable de la confidentialité de son accès et des actions effectuées sur son compte.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Article 4 - Propriété intellectuelle</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            L'ensemble des éléments constituant le service (textes, images, logiciels, etc.) 
            sont protégés par le droit de la propriété intellectuelle. Toute reproduction non autorisée 
            est strictement interdite.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Article 5 - Modification des CGU</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. 
            Les utilisateurs seront informés de toute modification significative.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
