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
import { memo, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function StockChart({ history, mode, stock }) {
  const [chartHistory, setChartHistory] = useState();
  const historyRef = useRef(history);
  const isFirstRender = useRef(true);
  const navigate = useNavigate();

  const isUp = stock.price >= stock.prevClose;

  const lineColor = mode === 'realtime' ? (isUp ? '#ff3b30' : '#2f6df6') : '#6cd948';
  const areaColor =
    mode === 'realtime' ? (isUp ? 'rgba(255,59,48,0.15)' : 'rgba(47,109,246,0.15)') : '#bfe7b1';

  useEffect(() => {
    // history 갱신시 ref 업데이트
    historyRef.current = history;
    // console.log('업데이트히스', historyRef.current);

    //처음 로드시에만
    if (history?.length > 2 && isFirstRender.current) {
      isFirstRender.current = false;
      //console.log('초기값 넣을시 history=', historyRef.current);
      setChartHistory(history);
    }
  }, [history]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartHistory(historyRef.current);
      //console.log('ref로 넣을시 history값', historyRef.current);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // const next = historyRef.current;
    // const last = next[next.length - 1];

    // if (mode === 'daily' && typeof last.time !== 'string') return;
    // if (mode === 'realtime' && typeof last.time === 'string') return;

    setChartHistory(history);
  }, [mode]);

  //useEffect 안의 함수는 랜더 시점의 값을 가지고 있어서
  //history 값이 당시의 값으로만 고정 됨, [100] 이런식으로
  //의존성 배열에 charHistory를 넣으면 interval이 돌다가 history와 같은 값을 가지게 될 경우
  //다시 useEffect를 재랜더하지 않는 경우가 있어 보통 interval은 한 번만 호출
  //

  const limitedData = chartHistory?.slice(-300) || [];
  const data = limitedData
    .filter((h) => {
      if (mode === 'daily') return typeof h.time === 'string';
      if (mode === 'realtime') return typeof h.time === 'number';
      return true;
    })
    .map((h) => ({
      price: h.price,
      time:
        mode === 'realtime'
          ? new Date(h.time)
              .toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
              })
              .slice(0, -3)
          : h.time.slice(5),
    }));
  console.log('data snapshot', JSON.parse(JSON.stringify(data)));
  // const data = limitedData.map((item) => ({
  //   time: new Date(item.time).toLocaleTimeString(),
  //   price: item.price,
  // }));
  //slice는 (begin,end) 두 가지 인자를 받으며
  //arr = [0,1,2,3,4]
  //arr.slice(1,3) 이면 두번째부터 세번때 요소까지만 => 1,2
  //arr.slice(-2) 이면 뒤에서 2개까지만 (3,4)
  //arr.slice(-4,-1) 이면 뒤 -4번째 ~ 뒤 1번째 전까지만

  //console.log('차트데이터', limitedData);
  // () 가 { index, price } 를 감쏴고 있어 암시적 리턴
  // 명시적 리턴이면 =>
  // {
  //     return {index, price}
  // }
  // {index, price}  괄호로 감싸는 이유는 쉼표가 있을 경우 (index, price) 로 인식하고
  // 마지막 값만 리턴하므로 index를 계산해버리고 price를 반환함 (쉼표 연산자 문제)

  const maxPrice = Math.max(...data.map((d) => d.price));
  const label = Math.floor(maxPrice).toLocaleString() + '원';

  const dynamicWidth = label.length * 7 + 9;

  return (
    <div className="stock-chart-wrapper">
      <ResponsiveContainer width="100%">
        <AreaChart data={data}>
          {/* <LineChart data={data}> */}
          <XAxis
            dataKey="time"
            interval="30"
            tick={{
              fontSize: 12,
            }}
          />
          <YAxis
            //domain={['dataMin - 40', 'dataMax + 40']}
            width={dynamicWidth}
            domain={[
              (a) => Math.min(a * 0.98, stock.prevClose * 0.92),
              (b) => Math.max(b * 1.02, stock.prevClose * 1.08),
            ]}
            //domain
            tickCount={4}
            tick={{
              fontSize: 12,
            }}
            tickFormatter={(v) => Math.floor(v).toLocaleString() + '원'}
          />
          <Tooltip
            // labelFormatter={(label) => `시간 : ${label}`}
            formatter={(v) => `${Math.floor(v).toLocaleString()}원`}
          />
          {mode === 'realtime' && (
            <ReferenceLine
              y={stock.prevClose}
              stroke="#ff0000"
              strokeDasharray="3 3"
              label={{
                value: `전일 종가: ${stock.prevClose.toLocaleString()}원`,
                position: 'bottom',
                fill: '#333',
                fontSize: '14px',
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            fill={areaColor}
            fillOpacity={1}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
          {/* <Line
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            dot={false}
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-out"
          /> */}
          {/* </LineChart> */}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(StockChart);
