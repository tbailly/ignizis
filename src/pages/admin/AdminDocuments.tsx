import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Pencil, Trash2, Search, Upload, Eye, Download, Tags } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/i18n/useTranslation';
import { DocumentUploadDialog } from '@/components/admin/DocumentUploadDialog';
import { DocumentEditDialog } from '@/components/admin/DocumentEditDialog';
import { DeleteDocumentDialog } from '@/components/admin/DeleteDocumentDialog';
import { TagManagementDialog } from '@/components/admin/TagManagementDialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface DocumentRow {
  id: string;
  display_name: string;
  document_type: 'contract' | 'invoice' | 'other' | 'legal' | 'passport' | 'secondary_id' | 'power_of_attorney';
  storage_path: string;
  original_filename: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
  expires_at: string | null;
  company_id: string | null;
  company_name: string | null;
  tags: { id: string; name: string }[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const typeLabels: Record<string, string> = {
  contract: 'Contrat',
  invoice: 'Facture',
  legal: 'Legal',
  passport: 'Passeport',
  secondary_id: 'Secondary ID',
  power_of_attorney: 'Power of Attorney',
  other: 'Autre',
};

export default function AdminDocuments() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRow | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocumentRow | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['admin-documents'],
    queryFn: async () => {
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*, companies:company_id(name)')
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      const { data: assignments, error: assignError } = await supabase
        .from('document_tag_assignments')
        .select('document_id, tag_id');

      if (assignError) throw assignError;

      const { data: tags, error: tagsError } = await supabase
        .from('document_tags')
        .select('id, name');

      if (tagsError) throw tagsError;

      const tagsById = new Map(tags.map(t => [t.id, t.name]));

      return (docs || []).map(doc => ({
        ...doc,
        company_name: (doc as any).companies?.name || null,
        tags: (assignments || [])
          .filter(a => a.document_id === doc.id)
          .map(a => ({ id: a.tag_id, name: tagsById.get(a.tag_id) || '' }))
          .filter(t => t.name),
      })) as DocumentRow[];
    },
  });

  const filtered = documents.filter(d =>
    d.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuccess = () => {
    setShowUpload(false);
    setEditingDoc(null);
    setDeletingDoc(null);
    queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
  };

  const isPdf = (doc: DocumentRow) =>
    doc.mime_type === 'application/pdf' || doc.original_filename.toLowerCase().endsWith('.pdf');

  const handlePreview = async (doc: DocumentRow) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 300);
    if (data?.signedUrl) {
      setPreviewUrl(data.signedUrl);
      setPreviewDoc(doc);
    }
  };

  const handleDownload = async (doc: DocumentRow) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 300, { download: doc.original_filename });
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          {t('admin.documents.title')}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTagManager(true)}>
            <Tags className="h-4 w-4 mr-2" />
            {t('admin.documents.manageTags')}
          </Button>
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            {t('admin.documents.import')}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('admin.documents.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.documents.displayName')}</TableHead>
              <TableHead>{t('admin.documents.documentType')}</TableHead>
              <TableHead>{t('admin.documents.tags')}</TableHead>
              <TableHead>{t('admin.documents.company')}</TableHead>
              <TableHead>{t('admin.documents.uploadDate')}</TableHead>
              <TableHead>{t('admin.documents.expiresAt')}</TableHead>
              <TableHead className="w-[100px]">{t('admin.documents.actions')}</TableHead>
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
                  {t('admin.documents.noDocuments')}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.display_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[doc.document_type] || doc.document_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map(tag => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.company_name ? (
                      <span>{doc.company_name}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>
                    {doc.expires_at ? (
                      <div className="flex items-center gap-2">
                        <span>{formatDate(doc.expires_at)}</span>
                        <Badge variant={new Date(doc.expires_at) < new Date() ? 'destructive' : 'secondary'} className={new Date(doc.expires_at) >= new Date() ? 'bg-green-600 text-white hover:bg-green-700' : ''}>
                          {new Date(doc.expires_at) < new Date() ? t('admin.documents.expired') : t('admin.documents.valid')}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {isPdf(doc) && (
                        <Button variant="ghost" size="icon" onClick={() => handlePreview(doc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingDoc(doc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingDoc(doc)}>
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

      {showUpload && (
        <DocumentUploadDialog
          onClose={() => setShowUpload(false)}
          onSuccess={handleSuccess}
        />
      )}

      {editingDoc && (
        <DocumentEditDialog
          document={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSuccess={handleSuccess}
        />
      )}

      {showTagManager && (
        <TagManagementDialog onClose={() => setShowTagManager(false)} />
      )}

      {deletingDoc && (
        <DeleteDocumentDialog
          document={deletingDoc}
          onClose={() => setDeletingDoc(null)}
          onSuccess={handleSuccess}
        />
      )}

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
