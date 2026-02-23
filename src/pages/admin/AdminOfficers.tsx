import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCheck, Pencil, Trash2, Search, Plus } from 'lucide-react';
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

interface OfficerWithCompanies {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  birth_city: string;
  position: string;
  is_compliant: boolean;
  companies: { id: string; name: string }[];
  passport_document_id: string | null;
  secondary_id_document_id: string | null;
  power_of_attorney_document_id: string | null;
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
  const [creatingOfficer, setCreatingOfficer] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<OfficerWithCompanies | null>(null);
  const [deletingOfficer, setDeletingOfficer] = useState<OfficerWithCompanies | null>(null);

  const { data: officers = [], isLoading } = useQuery({
    queryKey: ['admin-officers'],
    queryFn: async () => {
      const { data: officersData, error: officersError } = await supabase
        .from('company_officers')
        .select('id, first_name, last_name, date_of_birth, birth_city, position, is_compliant, passport_document_id, secondary_id_document_id, power_of_attorney_document_id')
        .order('last_name');

      if (officersError) throw officersError;

      const { data: assignments, error: assignErr } = await (supabase
        .from('officer_company_assignments' as any)
        .select('officer_id, company_id') as any);

      if (assignErr) throw assignErr;

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');

      if (companiesError) throw companiesError;

      const companiesById = new Map(companiesData.map(c => [c.id, c.name]));

      // Group assignments by officer
      const assignmentsByOfficer = new Map<string, { id: string; name: string }[]>();
      for (const a of (assignments || []) as any[]) {
        if (!assignmentsByOfficer.has(a.officer_id)) {
          assignmentsByOfficer.set(a.officer_id, []);
        }
        const name = companiesById.get(a.company_id) || '—';
        assignmentsByOfficer.get(a.officer_id)!.push({ id: a.company_id, name });
      }

      return (officersData || []).map(o => ({
        ...o,
        companies: assignmentsByOfficer.get(o.id) || [],
      })) as OfficerWithCompanies[];
    },
  });

  const filtered = officers.filter(o => {
    const term = search.toLowerCase();
    const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
    const companyNames = o.companies.map(c => c.name.toLowerCase()).join(' ');
    return (
      fullName.includes(term) ||
      o.position.toLowerCase().includes(term) ||
      companyNames.includes(term)
    );
  });

  const handleCreateSuccess = () => {
    setCreatingOfficer(false);
    queryClient.invalidateQueries({ queryKey: ['admin-officers'] });
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          {t('admin.officers.title')}
        </h1>
        <Button onClick={() => setCreatingOfficer(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.officers.create')}
        </Button>
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
              <TableHead>{t('admin.officers.companies')}</TableHead>
              <TableHead>{t('admin.officers.dateOfBirth')}</TableHead>
              <TableHead>{t('admin.officers.birthCity')}</TableHead>
              <TableHead>{t('admin.officers.position')}</TableHead>
              <TableHead>{t('admin.officers.status')}</TableHead>
              <TableHead className="w-[100px]">{t('admin.officers.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                    {officer.companies.length === 0 ? (
                      <span className="text-muted-foreground text-xs">{t('admin.officers.noCompanies')}</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {officer.companies.map(c => (
                          <Badge key={c.id} variant="secondary" className="text-xs">
                            {c.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{isoToDisplay(officer.date_of_birth)}</TableCell>
                  <TableCell>{officer.birth_city?.trim() || '—'}</TableCell>
                  <TableCell>{officer.position}</TableCell>
                  <TableCell>
                    {officer.is_compliant ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {t('admin.officers.compliant')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        {t('admin.officers.nonCompliant')}
                      </Badge>
                    )}
                  </TableCell>
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

      {creatingOfficer && (
        <OfficerFormDialog
          onClose={() => setCreatingOfficer(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

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
