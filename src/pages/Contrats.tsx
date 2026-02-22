import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Download, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface DocRow {
  id: string;
  display_name: string;
  document_type: string;
  storage_path: string;
  original_filename: string;
  mime_type: string | null;
  created_at: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Contrats() {
  const { currentCompany } = useCompany();
  const { t } = useTranslation();
  const [previewDoc, setPreviewDoc] = useState<DocRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const companyId = currentCompany?.company.id;

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['company-documents', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('id, display_name, document_type, storage_path, original_filename, mime_type, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DocRow[];
    },
    enabled: !!companyId,
  });

  const invoices = documents.filter(d => d.document_type === 'invoice');
  const contracts = documents.filter(d => d.document_type === 'contract');

  const isPdf = (doc: DocRow) =>
    doc.mime_type === 'application/pdf' || doc.original_filename.toLowerCase().endsWith('.pdf');

  const handlePreview = async (doc: DocRow) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 300);
    if (data?.signedUrl) {
      setPreviewUrl(data.signedUrl);
      setPreviewDoc(doc);
    }
  };

  const handleDownload = async (doc: DocRow) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 300, { download: doc.original_filename });
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const renderTable = (docs: DocRow[], emptyMessage: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('contracts.displayName')}</TableHead>
          <TableHead>{t('contracts.uploadDate')}</TableHead>
          <TableHead className="w-[100px]">{t('contracts.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {docs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          docs.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">{doc.display_name}</TableCell>
              <TableCell>{formatDate(doc.created_at)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {isPdf(doc) && (
                    <Button variant="ghost" size="icon" onClick={() => handlePreview(doc)} title={t('contracts.preview')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title={t('contracts.download')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('contracts.title')}</h1>
          <p className="text-muted-foreground">{currentCompany?.company.name}</p>
        </div>
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('contracts.title')}</h1>
        <p className="text-muted-foreground">{currentCompany?.company.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('contracts.invoices')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderTable(invoices, t('contracts.noInvoices'))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('contracts.contracts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderTable(contracts, t('contracts.noContracts'))}
        </CardContent>
      </Card>

      <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) { setPreviewDoc(null); setPreviewUrl(null); } }}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewDoc?.display_name}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="flex-1 w-full rounded-md border"
              title="PDF Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
