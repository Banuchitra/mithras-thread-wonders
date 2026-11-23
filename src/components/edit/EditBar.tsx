'use client';

import { useEdit } from './EditProvider';

// Compact one-line bar for signed-in staff on public pages: "Edit page" → Save (n) / Discard / Finish.
export function EditBar() {
  const e = useEdit();
  if (!e.canEdit) return null;
  const msg = e.status.message;
  const btn = 'rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-60';
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center pl-3 pr-24 sm:px-3" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-brand-plum py-1.5 pl-4 pr-1.5 text-white shadow-2xl ring-2 ring-brand-gold-light">
        {!e.editing ? (
          <button type="button" onClick={() => e.setEditing(true)} className={`${btn} -ml-2.5 bg-brand-gold-light text-brand-plum`}>✏️ Edit page</button>
        ) : (
          <>
            <span className="truncate text-xs sm:text-sm" role="status">
              {msg ?? (e.count ? `${e.count} change${e.count > 1 ? 's' : ''}` : <><span className="sm:hidden">Tap ✏️ or 📷</span><span className="hidden sm:inline">Tap any ✏️ or 📷 to change it</span></>)}
            </span>
            {e.count > 0 && <button type="button" onClick={e.save} disabled={e.status.kind === 'saving'} className={`${btn} bg-brand-gold-light text-brand-plum`}>{e.status.kind === 'saving' ? 'Saving…' : 'Save'}</button>}
            {e.count > 0 && <button type="button" onClick={e.discard} className={`${btn} ring-1 ring-brand-gold-light`}>Discard</button>}
            {e.count === 0 && <button type="button" onClick={() => e.setEditing(false)} className={`${btn} ring-1 ring-brand-gold-light`}>Finish</button>}
          </>
        )}
      </div>
    </div>
  );
}
