import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/i18n/useTranslation';
import { CompanyFormDialog } from '@/components/admin/CompanyFormDialog';
import { DeleteCompanyDialog } from '@/components/admin/DeleteCompanyDialog';

interface CompanyWithUsers {
  id: string;
  name: string;
  slug: string;
  status: string;
  company_number: string | null;
  address: string | null;
  country: string | null;
  perm_legal: boolean;
  perm_accounting: boolean;
  perm_finance: boolean;
  accounting_software_url: string | null;
  users: { id: string; email: string; name: string | null }[];
}

export default function AdminCompanies() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyWithUsers | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<CompanyWithUsers | null>(null);
  const PAGE_SIZE = 10;

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data: companiesData, error: companiesError } = await supabase
        .from('active_companies' as any)
        .select('id, name, slug, status, company_number, address, country, perm_legal, perm_accounting, perm_finance, accounting_software_url')
        .order('name');

      if (companiesError) throw companiesError;

      const { data: ucData, error: ucError } = await supabase
        .from('user_companies')
        .select('company_id, user_id');

      if (ucError) throw ucError;

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name');

      if (usersError) throw usersError;

      const usersById = new Map(usersData.map(u => [u.id, u]));

      return ((companiesData as any[]) || []).map((c: any) => {
        const companyUserIds = (ucData || [])
          .filter((uc: any) => uc.company_id === c.id)
          .map((uc: any) => uc.user_id);
        const users = companyUserIds
          .map((uid: string) => usersById.get(uid))
          .filter(Boolean) as { id: string; email: string; name: string | null }[];
        return { ...c, users } as CompanyWithUsers;
      });
    },
  });

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (company: CompanyWithUsers) => {
    setEditingCompany(company);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCompany(null);
  };

  const handleSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
  };

  const handleDeleteSuccess = () => {
    setDeletingCompany(null);
    queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            {t('admin.companies.title')}
          </h1>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.companies.create')}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('admin.companies.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.companies.name')}</TableHead>
              <TableHead>{t('admin.companies.users')}</TableHead>
              <TableHead>{t('admin.companies.status')}</TableHead>
              <TableHead className="w-[100px]">{t('admin.companies.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {t('admin.companies.noCompanies')}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {company.users.length === 0 ? (
                        <span className="text-muted-foreground text-sm">—</span>
                      ) : (
                        company.users.map(u => (
                          <Badge key={u.id} variant="secondary" className="text-xs">
                            {u.name || u.email}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.status === 'active' ? 'default' : 'outline'}>
                      {t(`admin.companies.${company.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(company)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingCompany(company)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            ←
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            →
          </Button>
        </div>
      )}

      <CompanyFormDialog
        open={formOpen}
        company={editingCompany}
        onClose={handleFormClose}
        onSuccess={handleSuccess}
      />

      {deletingCompany && (
        <DeleteCompanyDialog
          company={deletingCompany}
          onClose={() => setDeletingCompany(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
