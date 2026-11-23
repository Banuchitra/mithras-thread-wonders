'use client';

import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { content } from '@/lib/content-client';
import { useAuth } from '../AuthProvider';

// "Edit page" state: what's saved (from the site's content), what she has changed but not saved yet, and the
// actions. Everything editable on a page reads its value from here, so edits show instantly where she made them.

export type SettingsField = 'brandName' | 'tagline' | 'announcement' | 'aboutText';
export interface Saved {
  texts: Record<string, string>;
  images: Record<string, string>;
  links: Record<string, string>;
  fields: Partial<Record<SettingsField, string>>;
}
interface Staged extends Saved {}
const empty = (): Staged => ({ texts: {}, images: {}, links: {}, fields: {} });

interface EditApi {
  /** Signed-in staff on a public page. */
  canEdit: boolean;
  editing: boolean;
  setEditing(v: boolean): void;
  text(k: string, fallback: string): string;
  image(k: string, fallback: string): string;
  link(k: string, fallback: string): string;
  field(f: SettingsField, fallback: string): string;
  stage(kind: 'texts' | 'images' | 'links', k: string, v: string): void;
  stageField(f: SettingsField, v: string): void;
  count: number;
  save(): Promise<void>;
  discard(): void;
  status: { kind: 'idle' | 'saving' | 'saved' | 'error'; message?: string };
}

const Ctx = createContext<EditApi | null>(null);
export const useEdit = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useEdit must be used inside EditProvider');
  return c;
};

export function EditProvider({ saved: initial, children }: { saved: Saved; children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname() ?? '';
  const [saved, setSaved] = useState<Saved>(initial);
  const [staged, setStaged] = useState<Staged>(empty);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<EditApi['status']>({ kind: 'idle' });
  const canEdit = !!user && !user.mustChangePassword && (user.role === 'admin' || user.role === 'editor') && !pathname.startsWith('/admin');

  const pick = useCallback((kind: 'texts' | 'images' | 'links', k: string, fallback: string) =>
    staged[kind][k] ?? saved[kind][k] ?? fallback, [saved, staged]);

  const count = Object.keys(staged.texts).length + Object.keys(staged.images).length + Object.keys(staged.links).length + Object.keys(staged.fields).length;

  const save = useCallback(async () => {
    if (!count) return;
    setStatus({ kind: 'saving' });
    try {
      const current = await content.getSettings();
      const next = {
        ...current,
        ...staged.fields,
        texts: { ...(current.texts ?? {}), ...staged.texts },
        images: { ...(current.images ?? {}), ...staged.images },
        links: { ...(current.links ?? {}), ...staged.links },
      };
      await content.putSettings(next);
      setSaved((s) => ({
        texts: { ...s.texts, ...staged.texts }, images: { ...s.images, ...staged.images },
        links: { ...s.links, ...staged.links }, fields: { ...s.fields, ...staged.fields },
      }));
      setStaged(empty());
      setStatus({ kind: 'saved', message: 'Saved ✓ — live on the website in about a minute' });
    } catch (e) {
      setStatus({ kind: 'error', message: (e as Error).message });
    }
  }, [count, staged]);

  const api = useMemo<EditApi>(() => ({
    canEdit,
    editing: canEdit && editing,
    setEditing: (v) => { setEditing(v); if (!v) setStatus({ kind: 'idle' }); },
    text: (k, f) => pick('texts', k, f),
    image: (k, f) => pick('images', k, f),
    link: (k, f) => pick('links', k, f),
    field: (f, fallback) => staged.fields[f] ?? saved.fields[f] ?? fallback,
    stage: (kind, k, v) => { setStaged((s) => ({ ...s, [kind]: { ...s[kind], [k]: v } })); setStatus({ kind: 'idle' }); },
    stageField: (f, v) => { setStaged((s) => ({ ...s, fields: { ...s.fields, [f]: v } })); setStatus({ kind: 'idle' }); },
    count,
    save,
    discard: () => { setStaged(empty()); setStatus({ kind: 'idle' }); },
    status,
  }), [canEdit, editing, pick, staged, saved, count, save, status]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
