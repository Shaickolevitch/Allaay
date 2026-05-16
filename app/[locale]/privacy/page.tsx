import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/he/home" className="text-allay-blue text-sm hover:underline">
            ← חזרה
          </Link>
          <h1 className="text-2xl font-bold text-allay-dark mt-4">מדיניות פרטיות</h1>
          <p className="text-sm text-allay-muted mt-1">עדכון אחרון: מאי 2026</p>
        </div>

        <div className="card space-y-6 text-sm text-allay-dark leading-relaxed">

          <section>
            <h2 className="font-bold text-base mb-2">1. מבוא</h2>
            <p>
              Allaay («אנחנו», «השירות») היא פלטפורמת המלצות חברתית המאפשרת למשתמשים לשתף
              המלצות על עסקים בתוך הרשת החברתית שלהם. מדיניות פרטיות זו מסבירה אילו מידע
              אנו אוספים, כיצד אנו משתמשים בו ואיך אנו מגנים עליו.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">2. מידע שאנו אוספים</h2>
            <ul className="list-disc list-inside space-y-1 text-allay-muted">
              <li>פרטי חשבון: שם, כתובת דואר אלקטרוני, תמונת פרופיל</li>
              <li>נתוני שימוש: המלצות, דירוגים, תגובות ופעולות בפלטפורמה</li>
              <li>נתוני כניסה: ספק OAuth שבחרתם (Google, Apple, Facebook)</li>
              <li>מידע טכני: כתובת IP, סוג דפדפן, זמני גישה</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">3. שימוש במידע</h2>
            <p>אנו משתמשים במידע שנאסף כדי:</p>
            <ul className="list-disc list-inside space-y-1 text-allay-muted mt-1">
              <li>לספק את שירות ההמלצות ולהציג את הרשת החברתית שלכם</li>
              <li>לשלוח התראות על פעילות רלוונטית בחשבונכם</li>
              <li>לשפר ולאבטח את הפלטפורמה</li>
              <li>לעמוד בדרישות חוקיות</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">4. שיתוף מידע</h2>
            <p>
              אנו לא מוכרים או משכירים את המידע האישי שלכם לצדדים שלישיים.
              המידע הציבורי שלכם (שם, המלצות, דירוגים) גלוי למשתמשים אחרים
              ברשת שלכם בהתאם להגדרות הפרטיות שבחרתם.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">5. ספקי צד שלישי</h2>
            <p>
              אנו משתמשים ב-Supabase לניהול נתונים ואימות משתמשים,
              וב-Google/Apple/Facebook לכניסה חברתית. לכל ספק מדיניות פרטיות משלו.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">6. אבטחת מידע</h2>
            <p>
              אנו נוקטים באמצעים טכניים וארגוניים סבירים להגנה על המידע שלכם,
              כולל הצפנה בתעבורה (HTTPS) ואחסון מאובטח.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">7. זכויותיכם</h2>
            <p>
              יש לכם זכות לעיין, לתקן או למחוק את המידע האישי שלכם.
              לבקשות פרטיות, צרו קשר בכתובת: <strong>privacy@allaay.app</strong>
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">8. מחיקת נתונים</h2>
            <p>
              בקשת מחיקת נתונים ניתן לשלוח לכתובת privacy@allaay.app.
              נטפל בבקשה תוך 30 יום.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">9. יצירת קשר</h2>
            <p>
              לשאלות בנוגע למדיניות פרטיות זו, ניתן לפנות אלינו בכתובת:{' '}
              <strong>privacy@allaay.app</strong>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
