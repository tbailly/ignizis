import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { DateMaskInput } from '@/components/ui/date-mask-input';
import { CompanySelect } from '@/components/admin/CompanySelect';

function displayToIso(display: string): string | null {
  if (!display || display.length !== 10) return null;
  const [d, m, y] = display.split('/');
  return `${y}-${m}-${d}`;
}

interface FileEntry {
  file: File;
  displayName: string;
  documentType: 'contract' | 'invoice' | 'other';
  expiresAt: string;
  companyId: string | null;
  selectedTagIds: string[];
}

interface DocumentUploadDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUploadDialog({ onClose, onSuccess }: DocumentUploadDialogProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: availableTags = [] } = useQuery({
    queryKey: ['document-tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('document_tags').select('id, name').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('id, name').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newEntries: FileEntry[] = files.map(file => ({
      file,
      displayName: file.name.replace(/\.[^/.]+$/, ''),
      documentType: 'other',
      expiresAt: '',
      companyId: null,
      selectedTagIds: [],
    }));
    setEntries(prev => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateEntry = (index: number, updates: Partial<FileEntry>) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, ...updates } : e));
  };

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (index: number, tagId: string) => {
    setEntries(prev => prev.map((e, i) => {
      if (i !== index) return e;
      const has = e.selectedTagIds.includes(tagId);
      return {
        ...e,
        selectedTagIds: has
          ? e.selectedTagIds.filter(id => id !== tagId)
          : [...e.selectedTagIds, tagId],
      };
    }));
  };

  const handleUpload = async () => {
    if (entries.length === 0 || !profile?.id) return;
    setSaving(true);

    try {
      for (const entry of entries) {
        const uuid = crypto.randomUUID();
        const storagePath = `${uuid}_${entry.file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, entry.file);

        if (uploadError) throw uploadError;

        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            display_name: entry.displayName,
            document_type: entry.documentType,
            storage_path: storagePath,
            original_filename: entry.file.name,
            file_size: entry.file.size,
            mime_type: entry.file.type || null,
            uploaded_by: profile.id,
            expires_at: displayToIso(entry.expiresAt),
            company_id: entry.companyId,
          } as any)
          .select('id')
          .single();

        if (docError) throw docError;

        if (entry.selectedTagIds.length > 0) {
          const { error: tagError } = await supabase
            .from('document_tag_assignments')
            .insert(
              entry.selectedTagIds.map(tagId => ({
                document_id: docData.id,
                tag_id: tagId,
              }))
            );

          if (tagError) throw tagError;
        }
      }

      toast.success(t('admin.documents.uploadSuccess'));
      onSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || t('settings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('admin.documents.import')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="cursor-pointer"
            />
          </div>

          {entries.map((entry, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate">{entry.file.name}</span>
                <Button variant="ghost" size="icon" onClick={() => removeEntry(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.documents.displayName')}</Label>
                <Input
                  value={entry.displayName}
                  onChange={(e) => updateEntry(index, { displayName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.documents.documentType')}</Label>
                <Select
                  value={entry.documentType}
                  onValueChange={(v) => updateEntry(index, { documentType: v as FileEntry['documentType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">{t('admin.documents.typeContract')}</SelectItem>
                    <SelectItem value="invoice">{t('admin.documents.typeInvoice')}</SelectItem>
                    <SelectItem value="other">{t('admin.documents.typeOther')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.documents.expiresAt')}</Label>
                <DateMaskInput
                  value={entry.expiresAt}
                  onChange={(v) => updateEntry(index, { expiresAt: v })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.documents.company')}</Label>
                <CompanySelect
                  companies={companies}
                  value={entry.companyId}
                  onChange={(v) => updateEntry(index, { companyId: v })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.documents.tags')}</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => {
                    const selected = entry.selectedTagIds.includes(tag.id);
                    return (
                      <Badge
                        key={tag.id}
                        variant={selected ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(index, tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleUpload} disabled={saving || entries.length === 0}>
            {saving ? t('common.saving') : t('admin.documents.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
