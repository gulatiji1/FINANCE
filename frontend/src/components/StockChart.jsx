import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function StockChart({ data }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Market Data</h3>
        <p>Price and volume trend</p>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(48, 72, 89, 0.24)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={22} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
            <YAxis yAxisId="right" orientation="right" hide />
            <Tooltip />
            <Bar yAxisId="right" dataKey="volume" fill="rgba(0, 153, 123, 0.22)" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="close"
              stroke="#005f73"
              strokeWidth={2.4}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default StockChart;

