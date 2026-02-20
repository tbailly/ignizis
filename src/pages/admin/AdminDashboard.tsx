import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, Users, FileText, Kanban } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/i18n/useTranslation';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      title: t('admin.companiesCard'),
      description: t('admin.companiesCardDesc'),
      icon: Building2,
      path: '/admin/companies',
    },
    {
      title: t('admin.usersCard'),
      description: t('admin.usersCardDesc'),
      icon: Users,
      path: '/admin/users',
    },
    {
      title: t('admin.documentsCard'),
      description: t('admin.documentsCardDesc'),
      icon: FileText,
      path: '/admin/documents',
    },
    {
      title: t('admin.requestsCard'),
      description: t('admin.requestsCardDesc'),
      icon: Kanban,
      path: '/admin/requests',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          {t('admin.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('admin.description')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Card
            key={card.path}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(card.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
