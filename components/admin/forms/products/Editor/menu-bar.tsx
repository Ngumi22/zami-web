"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const options = [
    {
      icon: <Heading1 className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: <Italic className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    {
      icon: <AlignLeft className="w-4 h-4" />,
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="w-4 h-4" />,
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="w-4 h-4" />,
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <List className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 mb-2 p-1 border rounded-md bg-slate-100">
      {options.map((opt, i) => (
        <Toggle key={i} pressed={opt.isActive} onPressedChange={opt.action}>
          {opt.icon}
        </Toggle>
      ))}
    </div>
  );
}
