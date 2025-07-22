"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import MenuBar from "./menu-bar";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  error?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  className = "",
  error = false,
}: RichTextEditorProps) {
  const lastHtml = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `min-h-[156px] border rounded-md bg-white py-2 px-3 focus:outline-none ${
          error ? "border-red-500" : "border-slate-300"
        } prose prose-sm max-w-none`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== lastHtml.current) {
        lastHtml.current = html;
        onChange(html);
      }
    },
    onBlur: onBlur,
  });

  // Sync external value updates (e.g. reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
      lastHtml.current = value;
    }
  }, [editor, value]);

  return (
    <div className={className}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
