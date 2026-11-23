'use client';

import { useState } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { AdminPage, Toggle, panel, smallBtn, useContent, type Doc } from '@/components/admin';
import { FormMessage, inputClass } from '@/components/forms';
import { slugify } from '@/lib/image';
import { content } from '@/lib/content-client';

export default function CategoriesAdmin() {
  return <AdminGuard><Categories /></AdminGuard>;
}

function Categories() {
  const collections = useContent('collections');
  const categories = useContent('categories');
  const products = useContent('products');
  const [msg, setMsg] = useState({ error: '', success: '' });
  const count = (catId: string) => (products.items ?? []).filter((p) => p.categoryId === catId).length;

  const save = async (type: 'collections' | 'categories', d: Doc, success: string) => {
    try { await content.put(type, d.id, d); setMsg({ error: '', success }); await Promise.all([collections.reload(), categories.reload()]); }
    catch (e) { setMsg({ error: (e as Error).message, success: '' }); }
  };
  const remove = async (type: 'collections' | 'categories', id: string) => {
    try { await content.remove(type, id); setMsg({ error: '', success: 'Deleted.' }); await Promise.all([collections.reload(), categories.reload()]); }
    catch (e) { setMsg({ error: (e as Error).message, success: '' }); }
  };

  const cols = [...(collections.items ?? [])].sort((a, b) => a.order - b.order);
  return (
    <AdminPage title="Collections & categories" crumb="Categories">
      <p className="text-muted">These build the Shop menu and the ☰ menu automatically. Order: lower numbers show first.</p>
      <div className="mt-4"><FormMessage error={msg.error || collections.error} success={msg.success} /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {cols.map((col) => (
          <section key={col.id} className={`${panel} p-5`}>
            <Row doc={col} kind="collections" onSave={(d) => save('collections', d, 'Collection saved.')} onDelete={() => remove('collections', col.id)} big />
            <ul className="mt-3 space-y-2 border-l-2 border-brand-gold pl-4">
              {(categories.items ?? []).filter((c) => c.collectionId === col.id).sort((a, b) => a.order - b.order).map((cat) => (
                <li key={cat.id}><Row doc={cat} kind="categories" note={`${count(cat.id)} products`} onSave={(d) => save('categories', d, 'Category saved.')} onDelete={() => remove('categories', cat.id)} /></li>
              ))}
            </ul>
            <AddForm label="Add category" onAdd={(name) => save('categories', { id: slugify(name), name, collectionId: col.id, order: 99, hidden: false }, `Category “${name}” added.`)} />
          </section>
        ))}
        <section className={`${panel} p-5`}>
          <h2 className="text-2xl font-semibold text-brand-plum">New collection</h2>
          <AddForm label="Add collection" onAdd={(name) => save('collections', { id: slugify(name), name, description: '', order: 99, hidden: false }, `Collection “${name}” added.`)} />
        </section>
      </div>
    </AdminPage>
  );
}

function Row({ doc, kind, note, big, onSave, onDelete }: { doc: Doc; kind: string; note?: string; big?: boolean; onSave: (d: Doc) => void; onDelete: () => void }) {
  const [d, setD] = useState(doc);
  const [confirm, setConfirm] = useState(false);
  const dirty = JSON.stringify(d) !== JSON.stringify(doc);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input aria-label={`${kind} name`} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className={`${inputClass} !w-auto flex-1 ${big ? 'font-heading text-xl font-semibold text-brand-plum' : '!py-1.5 text-sm'}`} />
      <input aria-label="Order" type="number" value={d.order} onChange={(e) => setD({ ...d, order: Number(e.target.value) })} className={`${inputClass} !w-16 !py-1.5 text-sm`} />
      <Toggle label="Hide" checked={!!d.hidden} onChange={(v) => setD({ ...d, hidden: v })} />
      {note && <span className="text-xs text-muted">{note}</span>}
      {dirty && <button type="button" className="btn btn-primary !px-3 !py-1.5 text-sm" onClick={() => onSave(d)}>Save</button>}
      {confirm
        ? <><button type="button" className="rounded bg-brand-magenta px-2 py-1 text-sm font-semibold text-white" onClick={() => { setConfirm(false); onDelete(); }}>Delete</button><button type="button" className="text-sm" onClick={() => setConfirm(false)}>Cancel</button></>
        : <button type="button" className={`${smallBtn} text-brand-magenta`} onClick={() => setConfirm(true)} aria-label={`Delete ${d.name}`}>×</button>}
    </div>
  );
}

function AddForm({ label, onAdd }: { label: string; onAdd: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onAdd(name.trim()); setName(''); } }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" aria-label={label} className={`${inputClass} !py-1.5 text-sm`} />
      <button type="submit" className="btn btn-outline !px-3 !py-1.5 text-sm">{label}</button>
    </form>
  );
}
