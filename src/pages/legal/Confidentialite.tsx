import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Confidentialite() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Politique de confidentialité</h1>
        <p className="text-muted-foreground">
          Comment nous protégeons vos données personnelles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Collecte des données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Nous collectons les données suivantes lors de votre utilisation du service :
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Adresse email (pour l'authentification)</li>
            <li>Nom (optionnel, pour personnaliser l'expérience)</li>
            <li>Préférences d'affichage (thème clair/sombre)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisation des données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Vos données sont utilisées exclusivement pour :
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Vous authentifier sur la plateforme</li>
            <li>Personnaliser votre expérience utilisateur</li>
            <li>Gérer vos accès aux différentes entreprises</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conservation des données</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Vos données sont conservées pendant toute la durée de votre utilisation du service. 
            Vous pouvez demander la suppression de votre compte et de vos données à tout moment.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vos droits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition</li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, contactez-nous à : [email@exemple.com]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
