export const GA_MEASUREMENT_ID = "AW-18489544942";
export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, unknown>,
    ) => void;
  }
}

export function trackEvent(
  eventName: string,
  parameters?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, { send_to: GA_MEASUREMENT_ID, ...parameters });
  if (GA4_MEASUREMENT_ID) {
    window.gtag("event", eventName, {
      send_to: GA4_MEASUREMENT_ID,
      ...parameters,
    });
  }
}
