const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (sec < 60) return rtf.format(-sec, "second");
  if (min < 60) return rtf.format(-min, "minute");
  if (hr < 24) return rtf.format(-hr, "hour");
  if (day < 7) return rtf.format(-day, "day");
  if (day < 30) return rtf.format(-Math.round(day / 7), "week");
  if (day < 365) return rtf.format(-Math.round(day / 30), "month");
  return rtf.format(-Math.round(day / 365), "year");
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}
