import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCheck, Pencil, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/i18n/useTranslation';
import { OfficerFormDialog } from '@/components/admin/OfficerFormDialog';
import { DeleteOfficerDialog } from '@/components/admin/DeleteOfficerDialog';

interface OfficerWithCompany {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  position: string;
  company_id: string;
  company_name: string;
}

function isoToDisplay(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function AdminOfficers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingOfficer, setEditingOfficer] = useState<OfficerWithCompany | null>(null);
  const [deletingOfficer, setDeletingOfficer] = useState<OfficerWithCompany | null>(null);

  const { data: officers = [], isLoading } = useQuery({
    queryKey: ['admin-officers'],
    queryFn: async () => {
      const { data: officersData, error: officersError } = await supabase
        .from('company_officers')
        .select('id, first_name, last_name, date_of_birth, position, company_id')
        .order('last_name');

      if (officersError) throw officersError;

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');

      if (companiesError) throw companiesError;

      const companiesById = new Map(companiesData.map(c => [c.id, c.name]));

      return (officersData || []).map(o => ({
        ...o,
        company_name: companiesById.get(o.company_id) || '—',
      })) as OfficerWithCompany[];
    },
  });

  const filtered = officers.filter(o => {
    const term = search.toLowerCase();
    const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
    return (
      fullName.includes(term) ||
      o.position.toLowerCase().includes(term) ||
      o.company_name.toLowerCase().includes(term)
    );
  });

  const handleSuccess = () => {
    setEditingOfficer(null);
    queryClient.invalidateQueries({ queryKey: ['admin-officers'] });
  };

  const handleDeleteSuccess = () => {
    setDeletingOfficer(null);
    queryClient.invalidateQueries({ queryKey: ['admin-officers'] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          {t('admin.officers.title')}
        </h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('admin.officers.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.officers.fullName')}</TableHead>
              <TableHead>{t('admin.officers.company')}</TableHead>
              <TableHead>{t('admin.officers.dateOfBirth')}</TableHead>
              <TableHead>{t('admin.officers.position')}</TableHead>
              <TableHead className="w-[100px]">{t('admin.officers.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t('admin.officers.noOfficers')}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((officer) => (
                <TableRow key={officer.id}>
                  <TableCell className="font-medium">
                    {officer.first_name} {officer.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {officer.company_name}
                    </Badge>
                  </TableCell>
                  <TableCell>{isoToDisplay(officer.date_of_birth)}</TableCell>
                  <TableCell>{officer.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingOfficer(officer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingOfficer(officer)}>
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

      {editingOfficer && (
        <OfficerFormDialog
          officer={editingOfficer}
          onClose={() => setEditingOfficer(null)}
          onSuccess={handleSuccess}
        />
      )}

      {deletingOfficer && (
        <DeleteOfficerDialog
          officer={deletingOfficer}
          onClose={() => setDeletingOfficer(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
