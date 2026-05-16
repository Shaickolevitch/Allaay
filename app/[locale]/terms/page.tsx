import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'תנאי שימוש',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/he/home" className="text-allay-blue text-sm hover:underline">
            ← חזרה
          </Link>
          <h1 className="text-2xl font-bold text-allay-dark mt-4">תנאי שימוש</h1>
          <p className="text-sm text-allay-muted mt-1">עדכון אחרון: מאי 2026</p>
        </div>

        <div className="card space-y-6 text-sm text-allay-dark leading-relaxed">

          <section>
            <h2 className="font-bold text-base mb-2">1. קבלת התנאים</h2>
            <p>
              השימוש בפלטפורמת Allaay («השירות») כפוף לתנאי שימוש אלה.
              בכניסה לשירות, אתם מסכימים לתנאים אלה במלואם.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">2. תיאור השירות</h2>
            <p>
              Allaay היא פלטפורמת המלצות חברתית המאפשרת למשתמשים לשתף המלצות
              על עסקים, לדרג שירותים ולבנות רשת המלצות מבוססת אמון.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">3. חשבון משתמש</h2>
            <ul className="list-disc list-inside space-y-1 text-allay-muted">
              <li>עליכם להיות בני 13 ומעלה כדי להשתמש בשירות</li>
              <li>אתם אחראים לשמירת פרטי הגישה לחשבונכם</li>
              <li>חל איסור לפתוח חשבון עבור אדם אחר ללא הסכמתו</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">4. כללי התנהגות</h2>
            <p>בשימוש בשירות, אתם מתחייבים:</p>
            <ul className="list-disc list-inside space-y-1 text-allay-muted mt-1">
              <li>לא לפרסם תוכן כוזב, מטעה או פוגעני</li>
              <li>לא להטריד משתמשים אחרים</li>
              <li>לא לנסות לגשת למידע של משתמשים אחרים שלא כדין</li>
              <li>לא להשתמש בשירות לצרכים מסחריים ללא אישור</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">5. תוכן משתמשים</h2>
            <p>
              אתם שומרים על הבעלות בתוכן שאתם מפרסמים. בפרסום תוכן,
              אתם מעניקים ל-Allaay רישיון לא-בלעדי להציג אותו במסגרת השירות.
              אנו שומרים לעצמנו את הזכות להסיר תוכן הפוגע בתנאים אלה.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">6. הגבלת אחריות</h2>
            <p>
              השירות ניתן «כמות שהוא». איננו אחראים לנזקים ישירים או עקיפים
              הנובעים מהשימוש בשירות או מחוסר יכולת להשתמש בו.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">7. שינויים בתנאים</h2>
            <p>
              אנו עשויים לעדכן תנאים אלה מעת לעת. שימוש מתמשך בשירות
              לאחר פרסום שינויים מהווה הסכמה לתנאים המעודכנים.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">8. סיום שימוש</h2>
            <p>
              אתם רשאים לסגור את חשבונכם בכל עת דרך הגדרות הפרופיל.
              אנו שומרים לעצמנו את הזכות להשעות חשבונות המפרים תנאים אלה.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">9. יצירת קשר</h2>
            <p>
              לשאלות בנוגע לתנאי שימוש אלה:{' '}
              <strong>legal@allaay.app</strong>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
