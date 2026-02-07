import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/i18n/useTranslation';
import { UserFormDialog } from '@/components/admin/UserFormDialog';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';

interface UserWithCompanies {
  id: string;
  email: string;
  name: string | null;
  companies: { id: string; name: string }[];
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithCompanies | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithCompanies | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name')
        .order('email');

      if (usersError) throw usersError;

      // Fetch admin role IDs to exclude them
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .is('company_id', null);

      if (rolesError) throw rolesError;

      const adminIds = new Set((adminRoles || []).map((r: any) => r.user_id));

      // Fetch all user_companies with company names
      const { data: ucData, error: ucError } = await supabase
        .from('user_companies')
        .select('user_id, company_id');

      if (ucError) throw ucError;

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');

      if (companiesError) throw companiesError;

      const companiesById = new Map(companiesData.map(c => [c.id, c]));

      return (usersData || [])
        .filter(u => !adminIds.has(u.id))
        .map(u => {
          const userCompanyIds = (ucData || [])
            .filter((uc: any) => uc.user_id === u.id)
            .map((uc: any) => uc.company_id);
          const companies = userCompanyIds
            .map((cid: string) => companiesById.get(cid))
            .filter(Boolean) as { id: string; name: string }[];
          return { ...u, companies } as UserWithCompanies;
        });
    },
  });

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: UserWithCompanies) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const handleSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const handleDeleteSuccess = () => {
    setDeletingUser(null);
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            {t('admin.users.title')}
          </h1>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.users.create')}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('admin.users.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.email')}</TableHead>
              <TableHead>{t('admin.users.companies')}</TableHead>
              <TableHead className="w-[100px]">{t('admin.users.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  {t('admin.users.noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.companies.length === 0 ? (
                        <span className="text-muted-foreground text-sm">—</span>
                      ) : (
                        user.companies.map(c => (
                          <Badge key={c.id} variant="secondary" className="text-xs">
                            {c.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingUser(user)}>
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

      <UserFormDialog
        open={formOpen}
        user={editingUser}
        onClose={handleFormClose}
        onSuccess={handleSuccess}
      />

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
