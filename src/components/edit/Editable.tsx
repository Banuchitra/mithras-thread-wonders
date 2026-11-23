'use client';

import Link from 'next/link';
import { useState } from 'react';
import { content } from '@/lib/content-client';
import { resizeToWebp } from '@/lib/image';
import { asset } from '@/lib/paths';
import { WithCanadaFlag } from '../CanadaFlag';
import { useEdit, type SettingsField } from './EditProvider';
import { EditSheet, TextSheet } from './EditSheet';

const pencil = (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="M13.5 6.5l4 4" />
  </svg>
);
/** Gold pencil chip shown on everything editable while "Edit page" is on. */
function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} aria-label={label}
      className="mx-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold-light align-middle text-brand-plum shadow-md ring-2 ring-white transition hover:scale-110">
      {pencil}
    </button>
  );
}
const outline = 'rounded-md outline-2 outline-offset-4 outline-dashed outline-brand-gold';

type Tag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';

/** Text she can change in place. `k` = key in site texts, or `field` = a site setting (tagline, about text…). */
export function EditableText({ k, field, children, as: As = 'span', className, multiline, label, flag }: {
  k?: string; field?: SettingsField; children: string; as?: Tag; className?: string; multiline?: boolean; label?: string;
  /** Show the Canada flag image after "Ships within Canada" (when not editing). */
  flag?: boolean;
}) {
  const e = useEdit();
  const [open, setOpen] = useState(false);
  const value = field ? e.field(field, children) : e.text(k!, children);
  if (!e.editing) return <As className={className}>{flag ? <WithCanadaFlag text={value} /> : value}</As>;
  return (
    <>
      <As className={`${className ?? ''} ${outline} cursor-text`} onClick={() => setOpen(true)}>
        {value || <em className="opacity-60">Tap to add text</em>}<Chip label={`Edit: ${label ?? value.slice(0, 40)}`} onClick={() => setOpen(true)} />
      </As>
      {open && <TextSheet title={label ?? 'Edit text'} value={value} multiline={multiline ?? value.length > 60}
        onClose={() => setOpen(false)} onSave={(v) => (field ? e.stageField(field, v) : e.stage('texts', k!, v))} />}
    </>
  );
}

/** Photo she can replace from her phone. */
export function EditableImage({ k, src, alt, className, label }: { k: string; src: string; alt: string; className?: string; label?: string }) {
  const e = useEdit();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const value = e.image(k, src);
  const img = <img src={asset(value)} alt={alt} className={className} />;
  if (!e.editing) return img;
  async function replace(file?: File) {
    if (!file) return;
    setBusy(true); setError('');
    try { e.stage('images', k, await content.upload('site', k.replace(/\./g, '-'), await resizeToWebp(file, 1600))); }
    catch (err) { setError((err as Error).message); }
    setBusy(false);
  }
  return (
    <span className={`relative block ${outline}`}>
      {img}
      <label className="absolute bottom-3 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-brand-gold-light px-4 py-2 text-sm font-bold text-brand-plum shadow-lg ring-2 ring-white">
        <input type="file" accept="image/*" className="sr-only" onChange={(ev) => { replace(ev.target.files?.[0]); ev.target.value = ''; }} />
        📷 {busy ? 'Uploading…' : `Replace ${label ?? 'photo'}`}
      </label>
      {error && <span className="absolute inset-x-2 top-2 rounded bg-white/95 p-2 text-xs text-brand-magenta">{error}</span>}
    </span>
  );
}

/** Button/link whose wording and destination she can change. */
export function EditableLink({ k, href, children, className, external }: { k: string; href: string; children: string; className?: string; external?: boolean }) {
  const e = useEdit();
  const [open, setOpen] = useState(false);
  const label = e.text(`${k}.label`, children);
  const to = e.link(k, href);
  const isExternal = external || /^https?:/.test(to);
  if (!e.editing) {
    return isExternal ? <a href={to} target="_blank" rel="noopener" className={className}>{label}</a> : <Link href={to} className={className}>{label}</Link>;
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${className ?? ''} ${outline}`}>{label}<Chip label={`Edit button: ${label}`} onClick={() => setOpen(true)} /></button>
      {open && <LinkSheet label={label} href={to} onClose={() => setOpen(false)} onSave={(l, h) => { e.stage('texts', `${k}.label`, l); e.stage('links', k, h); }} />}
    </>
  );
}

function LinkSheet({ label, href, onSave, onClose }: { label: string; href: string; onSave: (l: string, h: string) => void; onClose: () => void }) {
  const [l, setL] = useState(label);
  const [h, setH] = useState(href);
  const cls = 'w-full rounded-xl border-2 border-brand-gold bg-white px-4 py-3 text-lg focus:border-brand-violet';
  return (
    <EditSheet title="Edit button" onClose={onClose}>
      <form onSubmit={(ev) => { ev.preventDefault(); onSave(l, h); onClose(); }} className="space-y-4">
        <label className="block text-sm font-semibold">Button text<input value={l} onChange={(ev) => setL(ev.target.value)} className={`${cls} mt-1`} /></label>
        <label className="block text-sm font-semibold">Goes to
          <input value={h} onChange={(ev) => setH(ev.target.value)} className={`${cls} mt-1`} placeholder="/shop/bangles/  or  https://…" />
          <span className="mt-1 block text-xs font-normal text-muted">A page on this site (starts with /) or a full web address.</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="btn btn-outline w-full">Cancel</button>
          <button type="submit" className="btn btn-primary w-full">Done</button>
        </div>
      </form>
    </EditSheet>
  );
}
