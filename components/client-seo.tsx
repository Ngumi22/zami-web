"use client";

import Head from "next/head";

interface ClientSEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export function ClientSEO({
  title,
  description,
  canonical,
  ogImage = "/og-image.jpg",
  ogType = "website",
}: ClientSEOProps) {
  const siteUrl = "https://zami.co.ke";
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : undefined;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={`${siteUrl}${ogImage}`} />}
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && (
        <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      )}
    </Head>
  );
}

export default ClientSEO;
