import { HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Aide() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centre d'aide</h1>
        <p className="text-muted-foreground">
          Trouvez des réponses à vos questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Questions fréquentes
          </CardTitle>
          <CardDescription>
            Les réponses aux questions les plus courantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Comment changer d'entreprise ?</h3>
            <p className="text-muted-foreground text-sm">
              Utilisez le sélecteur d'entreprise en haut du menu latéral pour basculer entre vos différentes entreprises.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Comment modifier mes paramètres ?</h3>
            <p className="text-muted-foreground text-sm">
              Accédez aux paramètres via le menu utilisateur en bas du menu latéral.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Je n'ai pas accès à certaines sections</h3>
            <p className="text-muted-foreground text-sm">
              L'accès aux sections est géré par les administrateurs de votre entreprise. Contactez-les pour modifier vos permissions.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Nous contacter
          </CardTitle>
          <CardDescription>
            Besoin d'aide supplémentaire ?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>support@exemple.com</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
