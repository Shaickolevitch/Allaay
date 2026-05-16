import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import '@/app/globals.css';

const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--font-heebo', display: 'swap' });

export const metadata: Metadata = { title: 'מחיקת נתונים | אלאay' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans bg-white text-gray-900">{children}</body>
    </html>
  );
}
