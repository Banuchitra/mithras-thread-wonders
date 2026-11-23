'use client';

import { EditableText } from './edit/Editable';
import { useEdit } from './edit/EditProvider';

export function AnnouncementBar({ text }: { text?: string }) {
  const e = useEdit();
  const value = e.field('announcement', text ?? '');
  if (!value.trim() && !e.editing) return null;
  return (
    <div className="heritage text-center text-xs font-semibold tracking-wide text-brand-gold-light sm:text-sm">
      <p className="mx-auto max-w-[88rem] px-4 py-2"><EditableText field="announcement" label="Announcement bar" flag>{value}</EditableText></p>
    </div>
  );
}
