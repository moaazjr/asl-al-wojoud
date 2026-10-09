export const GA_MEASUREMENT_ID = "AW-18489544942";
export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-XXXXXXXXXX";

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
  window.gtag("event", eventName, {
    send_to: GA4_MEASUREMENT_ID,
    ...parameters,
  });
}

export function trackPageView(url: string) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    send_to: GA4_MEASUREMENT_ID,
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  });
}
