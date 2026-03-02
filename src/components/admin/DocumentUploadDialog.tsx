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
import { X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateMaskInput } from '@/components/ui/date-mask-input';
import { EntitySelect } from '@/components/admin/EntitySelect';

function displayToIso(display: string): string | null {
  if (!display || display.length !== 10) return null;
  const [d, m, y] = display.split('/');
  return `${y}-${m}-${d}`;
}

type DocumentType = 'contract' | 'invoice' | 'legal' | 'passport' | 'secondary_id' | 'power_of_attorney' | '';

interface FileEntry {
  file: File;
  displayName: string;
  documentType: DocumentType;
  expiresAt: string;
  linkedType: 'company' | 'officer' | null;
  linkedId: string | null;
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
  const [isDragging, setIsDragging] = useState(false);

  const { data: availableTags = [] } = useQuery({
    queryKey: ['document-tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('active_document_tags' as any).select('id, name').order('name');
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('active_companies' as any).select('id, name, status').order('name');
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const { data: officers = [] } = useQuery({
    queryKey: ['officers-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_company_officers' as any)
        .select('id, first_name, last_name')
        .order('last_name');
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const addFiles = (files: File[]) => {
    const newEntries: FileEntry[] = files.map(file => ({
      file,
      displayName: file.name.replace(/\.[^/.]+$/, ''),
      documentType: '',
      expiresAt: '',
      linkedType: null,
      linkedId: null,
      selectedTagIds: [],
    }));
    setEntries(prev => [...prev, ...newEntries]);
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
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

  const handleEntityChange = (index: number, newLinkedType: 'company' | 'officer' | null, newLinkedId: string | null) => {
    const currentEntry = entries[index];
    const typeChanged = currentEntry.linkedType !== newLinkedType;
    updateEntry(index, {
      linkedType: newLinkedType,
      linkedId: newLinkedId,
      ...(typeChanged ? { documentType: '' } : {}),
    });
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

        const docType = entry.documentType || 'legal';

        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            display_name: entry.displayName,
            document_type: docType,
            storage_path: storagePath,
            original_filename: entry.file.name,
            file_size: entry.file.size,
            mime_type: entry.file.type || null,
            uploaded_by: profile.id,
            expires_at: displayToIso(entry.expiresAt),
            company_id: entry.linkedType === 'company' ? entry.linkedId : null,
          } as any)
          .select('id')
          .single();

        if (docError) throw docError;

        // If linked to officer, update the officer's document field
        if (entry.linkedType === 'officer' && entry.linkedId && docData?.id) {
          const fieldMap: Record<string, string> = {
            passport: 'passport_document_id',
            secondary_id: 'secondary_id_document_id',
            power_of_attorney: 'power_of_attorney_document_id',
          };
          const field = fieldMap[entry.documentType];
          if (field) {
            const { error: officerError } = await supabase
              .from('company_officers')
              .update({ [field]: docData.id } as any)
              .eq('id', entry.linkedId);
            if (officerError) throw officerError;
          }
        }

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
      <DialogContent className="sm:max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {t('admin.documents.import')}
            {entries.length > 0 && (
              <Badge variant="secondary" className="ml-2 align-middle">
                {t('admin.documents.documentCount').replace('{count}', String(entries.length))}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0 px-1">
          <div className="space-y-4 py-2">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">{t('admin.documents.dropzoneText')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('admin.documents.dropzoneHint')}</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
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
                  <Label>{t('admin.documents.companyOrOfficer')}</Label>
                  <EntitySelect
                    companies={companies}
                    officers={officers}
                    linkedType={entry.linkedType}
                    linkedId={entry.linkedId}
                    onChange={(type, id) => handleEntityChange(index, type, id)}
                  />
                </div>

                {entry.linkedType && (
                  <div className="space-y-2">
                    <Label>{t('admin.documents.documentType')}</Label>
                    <Select
                      value={entry.documentType}
                      onValueChange={(v) => updateEntry(index, { documentType: v as DocumentType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder=" " />
                      </SelectTrigger>
                      <SelectContent>
                        {entry.linkedType === 'company' ? (
                          <>
                            <SelectItem value="contract">{t('admin.documents.typeContract')}</SelectItem>
                            <SelectItem value="invoice">{t('admin.documents.typeInvoice')}</SelectItem>
                            <SelectItem value="legal">{t('admin.documents.typeLegal')}</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="passport">{t('admin.documents.typePassport')}</SelectItem>
                            <SelectItem value="secondary_id">{t('admin.documents.typeSecondaryId')}</SelectItem>
                            <SelectItem value="power_of_attorney">{t('admin.documents.typePowerOfAttorney')}</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{t('admin.documents.expiresAt')}</Label>
                  <DateMaskInput
                    value={entry.expiresAt}
                    onChange={(v) => updateEntry(index, { expiresAt: v })}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleUpload} disabled={saving || entries.length === 0 || entries.some(e => !e.linkedId || !e.documentType)}>
            {saving ? t('common.saving') : t('admin.documents.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
