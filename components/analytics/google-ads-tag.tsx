import Script from "next/script";
import { GA_MEASUREMENT_ID, GA4_MEASUREMENT_ID } from "@/lib/gtag";

export { GA_MEASUREMENT_ID };

export function GoogleAdsTag() {
  const ga4Config = GA4_MEASUREMENT_ID
    ? `\n            gtag('config', ${JSON.stringify(GA4_MEASUREMENT_ID)});`
    : "";
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-ads-gtag"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');${ga4Config}
          `,
        }}
      />
    </>
  );
}
