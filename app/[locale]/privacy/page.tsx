export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-sm leading-relaxed" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">מדיניות פרטיות – אלאay</h1>
      <p className="mb-4 text-gray-500">עדכון אחרון: מאי 2026</p>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">מה אנחנו אוספים</h2>
        <p>
          כאשר אתם נרשמים לאלאay אנחנו אוספים את המידע שאתם בוחרים לספק: שם,
          תמונת פרופיל, מספר טלפון (לאימות), וקישורים שאתם מוסיפים לפרופיל שלכם.
          אם נכנסתם דרך Google או Facebook, אנחנו מקבלים את המידע הבסיסי שהספק
          שולח (שם, כתובת דוא"ל, תמונה).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">איך אנחנו משתמשים במידע</h2>
        <p>
          המידע משמש אך ורק להפעלת השירות: הצגת הפרופיל שלכם לחברים, חיבור
          גרף ההמלצות, ושליחת התראות רלוונטיות. אנחנו לא מוכרים מידע לצד שלישי
          ולא משתמשים בו לפרסום.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">שיתוף מידע</h2>
        <p>
          המידע הציבורי בפרופיל שלכם (שם, תמונה, קישורים) גלוי למשתמשים אחרים
          באפליקציה. מידע שסימנתם כפרטי נשמר פרטי. אנחנו משתמשים ב-Supabase
          לאחסון מאובטח של הנתונים.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">מחיקת חשבון</h2>
        <p>
          תוכלו למחוק את חשבונכם בכל עת דרך הגדרות האפליקציה. מחיקת חשבון
          מסירה את כל הנתונים האישיים שלכם מהמערכת.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">יצירת קשר</h2>
        <p>
          לשאלות בנוגע לפרטיות פנו אלינו בדוא"ל:{' '}
          <a href="mailto:shaigian1@gmail.com" className="underline">
            shaigian1@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
