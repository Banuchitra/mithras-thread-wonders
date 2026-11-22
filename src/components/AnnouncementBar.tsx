export function AnnouncementBar({ text }: { text?: string }) {
  if (!text?.trim()) return null;
  return (
    <div className="heritage text-center text-xs font-semibold tracking-wide text-brand-gold-light sm:text-sm">
      <p className="mx-auto max-w-[88rem] px-4 py-2">{text}</p>
    </div>
  );
}
