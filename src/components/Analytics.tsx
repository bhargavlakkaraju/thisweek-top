import Script from "next/script";

/**
 * GA4 and DataFast. Both are env-gated: with no id set, nothing is injected and
 * no request is made, so a missing key costs nothing and leaks nothing.
 *
 * Vercel Web Analytics and Speed Insights are mounted separately in layout.tsx
 * because they need no configuration at all.
 */
export function Analytics({ domain }: { domain: string }) {
  const ga = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const datafast = process.env.NEXT_PUBLIC_DATAFAST_ID?.trim();

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${ga}', { send_page_view: true });`}
          </Script>
        </>
      ) : null}

      {datafast ? (
        <Script
          src="https://datafa.st/js/script.js"
          data-website-id={datafast}
          data-domain={domain}
          strategy="afterInteractive"
          defer
        />
      ) : null}
    </>
  );
}
