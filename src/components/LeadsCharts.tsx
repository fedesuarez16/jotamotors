"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayStat, SourceStat, StatusStat } from "@/app/graficos/page";

const SOURCE_COLORS = ["#3b82f6", "#10b981"];
const STATUS_COLOR = "#6366f1";

interface Props {
  dayStats: DayStat[];
  sourceStats: SourceStat[];
  statusStats: StatusStat[];
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function LeadsCharts({ dayStats, sourceStats, statusStats }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Leads por día — ocupa toda la fila */}
      <div className="lg:col-span-2">
        <ChartCard title="Leads por día — últimos 30 días">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={dayStats}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-zinc-200 dark:stroke-zinc-800"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={4}
                className="fill-zinc-500"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                className="fill-zinc-500"
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e4e4e7",
                }}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                iconType="square"
              />
              <Bar
                dataKey="meta_ads"
                name="Meta Ads"
                stackId="a"
                fill="#3b82f6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="organic"
                name="Orgánicos"
                stackId="a"
                fill="#10b981"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Leads por fuente */}
      <ChartCard title="Fuente de leads">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sourceStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name ?? ""} ${(((percent as number | undefined) ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {sourceStats.map((_, i) => (
                  <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e4e4e7",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4">
          {sourceStats.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: SOURCE_COLORS[i] }}
              />
              {s.name}: <strong>{s.value}</strong>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Leads por estado */}
      <ChartCard title="Estado de leads">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={statusStats}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-zinc-200 dark:stroke-zinc-800"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              className="fill-zinc-500"
            />
            <YAxis
              type="category"
              dataKey="status"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={80}
              className="fill-zinc-600"
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e4e4e7",
              }}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="total" name="Leads" fill={STATUS_COLOR} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
