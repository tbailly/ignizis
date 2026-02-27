import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DateMaskInput } from '@/components/ui/date-mask-input';
import { CompanySelect } from '@/components/admin/CompanySelect';
import { X } from 'lucide-react';

function isoToDisplay(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function displayToIso(display: string): string | null {
  if (!display || display.length !== 10) return null;
  const [d, m, y] = display.split('/');
  return `${y}-${m}-${d}`;
}

interface DocumentData {
  id: string;
  display_name: string;
  document_type: 'contract' | 'invoice' | 'other' | 'legal' | 'passport' | 'secondary_id' | 'power_of_attorney';
  original_filename: string;
  expires_at: string | null;
  company_id: string | null;
  tags: { id: string; name: string }[];
}

interface DocumentEditDialogProps {
  document: DocumentData;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentEditDialog({ document, onClose, onSuccess }: DocumentEditDialogProps) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(document.display_name);
  const [documentType, setDocumentType] = useState(document.document_type);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(document.tags.map(t => t.id));
  const [companyId, setCompanyId] = useState<string | null>(document.company_id);
  const [expiresAt, setExpiresAt] = useState(isoToDisplay(document.expires_at));
  const [saving, setSaving] = useState(false);

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

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          display_name: displayName.trim(),
          document_type: documentType,
          expires_at: displayToIso(expiresAt),
          company_id: companyId,
        } as any)
        .eq('id', document.id);

      if (updateError) throw updateError;

      // Sync tags: delete all then re-insert
      const { error: deleteTagsError } = await supabase
        .from('document_tag_assignments')
        .delete()
        .eq('document_id', document.id);

      if (deleteTagsError) throw deleteTagsError;

      if (selectedTagIds.length > 0) {
        const { error: insertTagsError } = await supabase
          .from('document_tag_assignments')
          .insert(
            selectedTagIds.map(tagId => ({
              document_id: document.id,
              tag_id: tagId,
            }))
          );

        if (insertTagsError) throw insertTagsError;
      }

      toast.success(t('admin.documents.saveSuccess'));
      onSuccess();
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast.error(error.message || t('settings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.documents.edit')}</DialogTitle>
          <DialogDescription>{t('admin.documents.editDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t('admin.documents.originalFile')}</Label>
            <Input value={document.original_filename} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-display-name">{t('admin.documents.displayName')}</Label>
            <Input
              id="doc-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('admin.documents.documentType')}</Label>
            <Select
              value={documentType}
              onValueChange={(v) => setDocumentType(v as DocumentData['document_type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">{t('admin.documents.typeContract')}</SelectItem>
                <SelectItem value="invoice">{t('admin.documents.typeInvoice')}</SelectItem>
                <SelectItem value="legal">{t('admin.documents.typeLegal')}</SelectItem>
                <SelectItem value="passport">{t('admin.documents.typePassport')}</SelectItem>
                <SelectItem value="secondary_id">{t('admin.documents.typeSecondaryId')}</SelectItem>
                <SelectItem value="power_of_attorney">{t('admin.documents.typePowerOfAttorney')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.documents.expiresAt')}</Label>
            <div className="flex items-center gap-2">
              <DateMaskInput
                value={expiresAt}
                onChange={setExpiresAt}
                className="flex-1"
              />
              {expiresAt && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setExpiresAt('')}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.documents.company')}</Label>
            <CompanySelect
              companies={companies}
              value={companyId}
              onChange={setCompanyId}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('admin.documents.tags')}</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={selected ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || !displayName.trim()}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
