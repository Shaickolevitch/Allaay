export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-sm leading-relaxed" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">תנאי שימוש – אלאay</h1>
      <p className="mb-4 text-gray-500">עדכון אחרון: מאי 2026</p>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">קבלת התנאים</h2>
        <p>
          השימוש באלאay מהווה הסכמה לתנאים אלו. אם אינכם מסכימים, אנא הפסיקו
          להשתמש בשירות.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">השירות</h2>
        <p>
          אלאay היא פלטפורמת המלצות מבוססת-אמון המאפשרת לכם לגלות עסקים דרך
          אנשים שאתם מכירים ומאמינים בהם. השירות מיועד לשימוש אישי בלבד.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">התנהגות משתמשים</h2>
        <p className="mb-2">אתם מתחייבים לא:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>לפרסם תוכן שקרי, מטעה, או פוגעני</li>
          <li>להתחזות לאדם אחר</li>
          <li>להשתמש בשירות למטרות מסחריות ללא אישור</li>
          <li>לנסות לפגוע בתפקוד המערכת</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">תוכן שלכם</h2>
        <p>
          אתם הבעלים של התוכן שאתם מפרסמים. על ידי פרסומו אתם מעניקים לנו
          רישיון להציגו בפני משתמשים אחרים בהתאם להגדרות הפרטיות שלכם.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">הגבלת אחריות</h2>
        <p>
          השירות מסופק "כפי שהוא". אנחנו לא אחראים לנזקים הנובעים משימוש בשירות
          או מהסתמכות על המלצות המופיעות בו.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">שינויים בתנאים</h2>
        <p>
          אנחנו עשויים לעדכן תנאים אלו מעת לעת. המשך השימוש בשירות לאחר שינוי
          מהווה הסכמה לתנאים המעודכנים.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">יצירת קשר</h2>
        <p>
          לשאלות:{' '}
          <a href="mailto:shaigian1@gmail.com" className="underline">
            shaigian1@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
