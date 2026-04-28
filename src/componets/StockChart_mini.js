import {
  XAxis,
  YAxis,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  Area,
  ReferenceLine,
  AreaChart,
} from 'recharts';

function StockChart_mini({ stock, history }) {
  const slicedHistory = history.slice(-20);
  const isUp = stock.price >= stock.prevClose;
  const lineColor = isUp ? '#ff3b30' : '#2f6df6';
  const areaColor = isUp ? 'rgba(255,59,48,0.15)' : 'rgba(47,109,246,0.15)';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={slicedHistory}>
        <Area dataKey="price" stroke={lineColor} fill={areaColor} strokeWidth={2} dot={false} />
        {/* <YAxis hide domain={[(a) => a * 1, (b) => b * 1]} /> */}
        <YAxis hide domain={[(min) => min * 0.98, (max) => max * 1.02]} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default StockChart_mini;
