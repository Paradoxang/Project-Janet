"use client";

import { useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface PuntoVentas {
  etiqueta: string;
  etiquetaLarga: string;
  actual: number;
  anterior: number;
}

const usd0 = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/**
 * Ventas por día: el periodo actual en el color de la marca y el anterior en gris punteado (énfasis:
 * una serie importa, la otra es contexto). Leyenda siempre visible; los valores también van en la tabla.
 */
export function GraficoVentas({ datos }: { datos: PuntoVentas[] }) {
  const t = useTranslations("panel");
  return (
    <div className="grid gap-3">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-ink" aria-label={t("grafico")}>
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-brand" aria-hidden="true" />
          {t("actual")}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-0 w-6 border-t-2 border-dashed border-[#9aa3b2]" aria-hidden="true" />
          {t("anterior")}
        </li>
      </ul>
      <div className="h-64 w-full md:h-72" data-testid="grafico-ventas">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#e3e6eb" strokeWidth={1} />
            <XAxis
              dataKey="etiqueta"
              tickLine={false}
              axisLine={{ stroke: "#e3e6eb" }}
              tick={{ fontSize: 11, fill: "#5a6478" }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#5a6478" }}
              tickFormatter={usd0}
              width={52}
            />
            <Tooltip
              cursor={{ stroke: "#5a6478", strokeWidth: 1 }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.etiquetaLarga ?? ""}
              formatter={(valor, clave) => [usd0(Number(valor ?? 0)), clave === "actual" ? t("actual") : t("anterior")]}
              contentStyle={{ borderRadius: 10, border: "1px solid #e3e6eb", fontSize: 13 }}
            />
            <Line
              type="monotone"
              dataKey="anterior"
              stroke="#9aa3b2"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--m-brand)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "var(--m-brand)" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer font-bold text-link">{t("verTabla")}</summary>
        <div className="mt-2 max-h-72 overflow-y-auto rounded-md border">
          <table className="w-full text-left text-[13px] tabular-nums">
            <thead className="sticky top-0 bg-surface">
              <tr>
                <th className="px-3 py-1.5">{t("dia")}</th>
                <th className="px-3 py-1.5 text-right">{t("actual")}</th>
                <th className="px-3 py-1.5 text-right">{t("anterior")}</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => (
                <tr key={d.etiquetaLarga} className="border-t">
                  <td className="px-3 py-1">{d.etiquetaLarga}</td>
                  <td className="px-3 py-1 text-right">{usd0(d.actual)}</td>
                  <td className="px-3 py-1 text-right">{usd0(d.anterior)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
