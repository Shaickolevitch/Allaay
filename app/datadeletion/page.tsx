export default function DataDeletionPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-sm leading-relaxed" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">מחיקת נתונים – אלאay</h1>
      <p className="mb-4 text-gray-500">עדכון אחרון: מאי 2026</p>

      <section className="mb-6">
        <h2 className="font-semibold text-base mb-2">כיצד למחוק את הנתונים שלכם</h2>
        <p className="mb-3">
          אם נכנסתם לאלאay דרך Facebook ותרצו למחוק את הנתונים שלכם, יש לכם שתי אפשרויות:
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">אפשרות 1 — מחיקה עצמית מתוך האפליקציה</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>היכנסו לאפליקציה בכתובת allaay.vercel.app</li>
            <li>עברו להגדרות (⚙️ בפינה)</li>
            <li>לחצו על "מחק חשבון"</li>
            <li>אשרו את המחיקה</li>
          </ol>
          <p className="mt-2 text-gray-500">הנתונים שלכם יימחקו לצמיתות תוך 30 יום.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">אפשרות 2 — בקשה ידנית</h3>
          <p className="text-gray-700">
            שלחו דוא"ל לכתובת{' '}
            <a href="mailto:shaigian1@gmail.com" className="underline">
              shaigian1@gmail.com
            </a>{' '}
            עם הנושא "בקשת מחיקת נתונים". נטפל בבקשה תוך 7 ימי עסקים.
          </p>
        </div>
      </section>
    </main>
  );
}
