import type { AnalyticsHeatmap } from "../../../../hooks/analytics/use-analytics";

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function AnalyticsHeatmap({
  data,
}: {
  data: AnalyticsHeatmap["cells"];
}) {
  const maxRevenue = Math.max(...data.map((cell) => cell.revenue), 1);
  const byPosition = new Map(
    data.map((cell) => [`${cell.weekday}-${cell.hour}`, cell]),
  );

  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-[620px]">
        <div className="mb-2 grid grid-cols-[30px_repeat(24,minmax(18px,1fr))] gap-1">
          <span />
          {Array.from({ length: 24 }, (_, hour) => (
            <span key={hour} className="text-center text-[9px] text-[#879198]">
              {hour % 3 === 0 ? hour : ""}
            </span>
          ))}
        </div>
        <div className="space-y-1">
          {weekdays.map((weekday, weekdayIndex) => (
            <div
              key={weekday}
              className="grid grid-cols-[30px_repeat(24,minmax(18px,1fr))] gap-1"
            >
              <span className="self-center text-[10px] font-semibold text-[#68757c]">
                {weekday}
              </span>
              {Array.from({ length: 24 }, (_, hour) => {
                const cell = byPosition.get(`${weekdayIndex + 1}-${hour}`);
                const ratio = (cell?.revenue || 0) / maxRevenue;
                const level =
                  ratio === 0
                    ? 0
                    : ratio < 0.25
                      ? 1
                      : ratio < 0.5
                        ? 2
                        : ratio < 0.75
                          ? 3
                          : 4;
                const colors = [
                  "bg-[#eef1f2]",
                  "bg-[#c9e4df]",
                  "bg-[#82c0b5]",
                  "bg-[#3f998b]",
                  "bg-[#126f65]",
                ];
                return (
                  <span
                    key={hour}
                    className={`block aspect-square min-h-[18px] rounded-[3px] ${colors[level]}`}
                    title={`${weekday}, ${hour}:00 · ${cell?.orders || 0} đơn · ${(cell?.revenue || 0).toLocaleString("vi-VN")} ₫`}
                    aria-label={`${weekday} lúc ${hour} giờ: ${cell?.orders || 0} đơn`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-[#7b878d]">
          <span>Thấp</span>
          {["#eef1f2", "#c9e4df", "#82c0b5", "#3f998b", "#126f65"].map(
            (color) => (
              <span
                key={color}
                className="h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: color }}
              />
            ),
          )}
          <span>Cao</span>
        </div>
      </div>
    </div>
  );
}
