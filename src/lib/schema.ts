// JSON-LD builders. Every page links to the same LocalBusiness by @id.
import { site } from '@/data/site';
import type { Faq } from '@/data/types';

export const BUSINESS_ID = `${site.url}/#business`;

export const localBusiness = () => ({
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Store'],
  '@id': BUSINESS_ID,
  name: site.name,
  url: `${site.url}/`,
  image: `${site.url}/og-image.jpg`,
  logo: `${site.url}/favicon-512.png`,
  telephone: '+79521142350',
  email: site.email,
  priceRange: '₽₽',
  paymentAccepted: 'Наличные, банковская карта, оплата по QR-коду, безналичный расчёт',
  currenciesAccepted: 'RUB',
  foundingDate: String(site.founded),
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${site.address.street}, ${site.address.place}`,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: 'RU',
  },
  geo: { '@type': 'GeoCoordinates', latitude: site.address.lat, longitude: site.address.lng },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '20:00',
    },
  ],
  hasMap: site.yandexMapsOrg,
  sameAs: [site.social.vk, site.social.telegram, site.yandexMapsOrg, site.twoGis, site.avito],
});

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  url: `${site.url}/`,
  name: site.name,
  inLanguage: 'ru-RU',
  publisher: { '@id': BUSINESS_ID },
});

export const breadcrumbs = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${site.url}${it.href === '/' ? '/' : it.href}`,
  })),
});

export const faqPage = (faq: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const service = (args: { name: string; description: string; url: string; lowPrice: number; highPrice?: number; offerCount?: number }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: args.name,
  description: args.description,
  url: `${site.url}${args.url}`,
  areaServed: { '@type': 'City', name: site.address.city },
  provider: { '@id': BUSINESS_ID },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'RUB',
    lowPrice: args.lowPrice,
    ...(args.highPrice ? { highPrice: args.highPrice } : {}),
    ...(args.offerCount ? { offerCount: args.offerCount } : {}),
    availability: 'https://schema.org/InStock',
  },
});
