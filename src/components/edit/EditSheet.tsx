'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Bottom sheet for editing on a phone: slides up, keyboard-friendly, big buttons.
export function EditSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-brand-plum/40 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl border-t-4 border-brand-gold bg-white p-5 shadow-2xl sm:rounded-3xl sm:border-4">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line sm:hidden" />
        <h2 className="font-heading text-2xl font-semibold text-brand-plum">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Text editing inside the sheet. */
export function TextSheet({ title, value, multiline, onSave, onClose }: { title: string; value: string; multiline?: boolean; onSave: (v: string) => void; onClose: () => void }) {
  const [v, setV] = useState(value);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const cls = 'w-full rounded-xl border-2 border-brand-gold bg-white px-4 py-3 text-lg focus:border-brand-violet';
  return (
    <EditSheet title={title} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(v); onClose(); }} className="space-y-4">
        {multiline
          ? <textarea ref={ref} value={v} onChange={(e) => setV(e.target.value)} rows={5} className={cls} />
          : <input ref={ref} value={v} onChange={(e) => setV(e.target.value)} className={cls} />}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="btn btn-outline w-full">Cancel</button>
          <button type="submit" className="btn btn-primary w-full">Done</button>
        </div>
      </form>
    </EditSheet>
  );
}
