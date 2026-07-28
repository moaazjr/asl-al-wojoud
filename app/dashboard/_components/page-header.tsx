export function PageHeader({
  title,
  desc,
}: {
  title: string;
  desc?: string;
}) {
  return (
    <div>
      <h1 className="font-kufi text-2xl font-bold text-ink">{title}</h1>
      {desc && <p className="font-kufi text-sm text-ink-faint">{desc}</p>}
    </div>
  );
}
