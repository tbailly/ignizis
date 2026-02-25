import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Download, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface DocumentsSectionProps {
  companyId: string | undefined;
}

export default function DocumentsSection({ companyId }: DocumentsSectionProps) {
  const { t } = useTranslation();
  const [previewDoc, setPreviewDoc] = useState<DocRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['company-all-documents', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('id, display_name, document_type, storage_path, original_filename, mime_type, created_at')
        .eq('company_id', companyId)
        .eq('document_type', 'legal')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DocRow[];
    },
    enabled: !!companyId,
  });

  const documentIds = documents.map(d => d.id);

  const { data: tagMap = {} } = useQuery({
    queryKey: ['company-document-tags', documentIds],
    queryFn: async () => {
      if (documentIds.length === 0) return {};
      const { data, error } = await (supabase
        .from('document_tag_assignments' as any)
        .select('document_id, document_tags(name)')
        .in('document_id', documentIds) as any);
      if (error) {
        console.error('Error fetching tags:', error);
        return {};
      }
      const map: Record<string, string[]> = {};
      for (const row of data || []) {
        const docId = row.document_id as string;
        const tagName = (row.document_tags as any)?.name as string | undefined;
        if (tagName) {
          if (!map[docId]) map[docId] = [];
          map[docId].push(tagName);
        }
      }
      return map;
    },
    enabled: documentIds.length > 0,
  });

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

  return (
    <>
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            {t('company.documents')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('company.noDocuments')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 border rounded-lg space-y-2">
                  <p className="text-sm font-medium truncate" title={doc.display_name}>
                    {doc.display_name}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(tagMap[doc.id] || []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</span>
                    <div className="flex items-center gap-1">
                      {isPdf(doc) && (
                        <Button variant="ghost" size="icon" onClick={() => handlePreview(doc)} title={t('company.documentPreview')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title={t('company.documentDownload')}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </>
  );
}
