import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import '@/app/globals.css';

// Heebo: the best Latin+Hebrew dual-script sans-serif
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Allay',
    default: 'Allay — שש דרגות בינך לבין כל ממליץ',
  },
  description:
    'רשת ההמלצות המבוססת על אמון. ראו בדיוק מי ממליץ וכיצד הוא מחובר אליכם.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) notFound();

  // Load translations
  const messages = await getMessages();

  // Hebrew is RTL; set dir at the html level
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={heebo.variable}>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// Force dynamic rendering — all locale routes use Supabase auth cookies/headers
export const dynamic = 'force-dynamic';
