'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useCallback, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildEmailContentCss } from '@/lib/email/email-content-html'
import { emailTheme } from '@/components/emails/email-theme'

export interface TemplateEditorRef {
  insertAtCursor: (text: string) => void
}

// Las mismas reglas que se aplican inline en el email y en la vista previa,
// para que lo que se escribe sea lo que se ve (viñetas incluidas).
const EDITOR_CONTENT_CSS = buildEmailContentCss('.email-content')

interface TemplateEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

const TemplateEditor = forwardRef<TemplateEditorRef, TemplateEditorProps>(
  function TemplateEditor({ content, onChange, placeholder = 'Escribe el contenido del email...' }, ref) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'email-content min-h-[200px] p-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useImperativeHandle(ref, () => ({
    insertAtCursor: (text: string) => {
      if (editor) {
        editor.chain().focus().insertContent(text).run()
      }
    },
  }), [editor])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL del enlace:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return (
      <div className="border rounded-md min-h-[250px] bg-muted animate-pulse" />
    )
  }

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <style dangerouslySetInnerHTML={{ __html: EDITOR_CONTENT_CSS }} />
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-muted')}
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-muted')}
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-muted')}
          title="Lista con viñetas"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') && 'bg-muted')}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={cn(editor.isActive('link') && 'bg-muted')}
          title="Insertar enlace"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        {editor.isActive('link') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Quitar enlace"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        )}
      </div>
      {/* Fondo blanco como el del email: el contenido usa los colores del email */}
      <div style={{ backgroundColor: emailTheme.colors.background }}>
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <div
            className="absolute top-[52px] left-3 pointer-events-none"
            style={{ color: emailTheme.colors.mutedForeground }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
})

export default TemplateEditor
