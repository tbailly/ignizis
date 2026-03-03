import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n/useTranslation';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  Link as LinkIcon, List, ListOrdered, Save, Loader2,
} from 'lucide-react';

const PAGE_IDS = ['legal-notice', 'privacy', 'terms'] as const;
type PageId = typeof PAGE_IDS[number];

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 border-b p-2 bg-muted/30 rounded-t-md">
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <div className="w-px bg-border mx-1" />
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <div className="w-px bg-border mx-1" />
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <div className="w-px bg-border mx-1" />
      <Toggle size="sm" pressed={editor.isActive('link')} onPressedChange={setLink}>
        <LinkIcon className="h-4 w-4" />
      </Toggle>
    </div>
  );
}

function LegalPageEditor({ pageId, label }: { pageId: PageId; label: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none dark:prose-invert',
      },
    },
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('legal_pages')
        .select('content_html')
        .eq('id', pageId)
        .single();
      if (data && editor) {
        editor.commands.setContent(data.content_html || '');
      }
      setLoading(false);
    })();
  }, [pageId, editor]);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setSaving(true);
    const { error } = await supabase
      .from('legal_pages')
      .update({ content_html: editor.getHTML() })
      .eq('id', pageId);
    setSaving(false);
    if (error) {
      toast({ title: t('common.saving'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('adminLegal.saveSuccess') });
    }
  }, [editor, pageId, toast, t]);

  if (loading) return <Skeleton className="h-[400px] w-full" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{label}</CardTitle>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {t('common.save')}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <EditorToolbar editor={editor} />
        <div className="border rounded-b-md">
          <EditorContent editor={editor} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminLegalPages() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('adminLegal.title')}</h1>
        <p className="text-muted-foreground">{t('adminLegal.description')}</p>
      </div>

      <Tabs defaultValue="legal-notice">
        <TabsList>
          <TabsTrigger value="legal-notice">{t('sidebar.legalNotice')}</TabsTrigger>
          <TabsTrigger value="privacy">{t('sidebar.privacyPolicy')}</TabsTrigger>
          <TabsTrigger value="terms">{t('sidebar.terms')}</TabsTrigger>
        </TabsList>
        {PAGE_IDS.map((id) => (
          <TabsContent key={id} value={id}>
            <LegalPageEditor
              pageId={id}
              label={id === 'legal-notice' ? t('sidebar.legalNotice') : id === 'privacy' ? t('sidebar.privacyPolicy') : t('sidebar.terms')}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
