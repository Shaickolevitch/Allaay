interface ScoreAgg {
  professionalism: number;
  initiative: number;
  speed: number;
  communication: number;
  quality: number;
  count: number;
}

const LABELS: [keyof Omit<ScoreAgg, 'count'>, string, string][] = [
  ['professionalism', 'מקצועיות', '🎯'],
  ['initiative', 'יוזמה', '💡'],
  ['speed', 'מהירות', '⚡'],
  ['communication', 'תקשורת', '💬'],
  ['quality', 'איכות', '⭐'],
];

export function ScoreDisplay({ agg }: { agg: ScoreAgg | null }) {
  if (!agg || agg.count === 0) return null;

  const overall =
    (agg.professionalism + agg.initiative + agg.speed + agg.communication + agg.quality) / 5;

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-bold text-allay-dark">ציונים</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-allay-blue">
            {overall.toFixed(1)}
          </span>
          <span className="text-xs text-allay-muted">/ 5 ({agg.count} דירוגים)</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {LABELS.map(([key, label, emoji]) => {
          const val = agg[key];
          const pct = (val / 5) * 100;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm w-5">{emoji}</span>
              <span className="text-xs text-allay-muted w-16 shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden" dir="rtl">
                <div
                  className="h-full bg-allay-blue rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-allay-dark w-6 text-end">
                {val.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
