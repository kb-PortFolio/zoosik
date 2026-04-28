// pages/History.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

import { db } from '../firebase';
import '../style/history.css';

export default function History({ user, stocks }) {
  const [trades, setTrades] = useState([]);
  const navigate = useNavigate();
  const TRADE_TYPE_LABEL = {
    buy: '매수',
    sell: '매도',
  };
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');

  let tradeDateStart, tradeDateEnd;

  if (selectedMonth !== 'all' && selectedMonth) {
    const [year, month] = selectedMonth.split('-');
    //2026-4 =?> ['2026','4']
    tradeDateStart = new Date(Number(year), Number(month - 1), 1);
    tradeDateEnd = new Date(Number(year), Number(month), 1);

    //Date에 날짜를 넣으면 객체로 변화되어 날짜 계산이 가능해짐
    //2026-04-30 을 표현하려면 month를 냅두고 05, day를 1로 하면 된다.
  }

  useEffect(() => {
    console.log('selectedMonth 값', selectedMonth);
  }, [selectedMonth]);

  const filtered =
    selectedMonth === 'all'
      ? trades
      : trades.filter((t) => {
          const tradeDate = new Date(t.createdAt.toDate());
          return tradeDate >= tradeDateStart && tradeDate < tradeDateEnd;
          //const tradeDate = trades.createdAt.
          //
          //   t.createdAt = {
          //   seconds: 1713850000,
          //   nanoseconds: 0
          // }
          // 객체말고 toDate() 같은 함수도 여기에 있음 \
        });
  console.log('파베속성', filtered);
  //new Date()현재 시간을 가진 객체를 생성, new Date().getTime()은 1970부터 현재까지 경과한 시간을 ms로 표현
  //파이어베이스는 createdAt 객체 내부에 toDate()가 있어서 ms 값을 가진 Date() 객체로 동일하게 만들어준다.
  //따라서  new Date(second*1000) 이렇게 곱해줄 필요가 없음

  console.log('year', new Date('2025-03-01'));

  const now = new Date().getTime();
  console.log('시간테스트', now);

  const toggle = (index) => {
    console.log('눌림');
    setOpenIndex((prev) => {
      return prev === index ? null : index;
    });
  };

  const testa = stocks.find((a) => {
    return a.id === 'BearTech';
  }).id;

  const getYearMonthOptions = (data) => {
    return data
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      .reduce((acc, cur) => {
        const date = cur.createdAt.toDate();
        const year = date.getFullYear();
        //년도를 4자리로 뽑아옴
        const month = String(date.getMonth() + 1).padStart(2, '0');
        //월을 뽑아옴 단, 1이 아닌 0부터 시작

        const key = `${year}-${month}`;
        if (!acc.includes(key)) acc.push(key);
        return acc;
      }, []);
  };

  console.log('값ㄴ', getYearMonthOptions(trades));

  useEffect(() => {
    if (!user?.uid) return;

    const fetchTrades = async () => {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'trades'));
      //docs: [doc1, doc2, doc3, ...]
      // doc = {
      //   id: "문서ID",
      //   data: () => ({
      //     stock: "BearTech",
      //     type: "buy",
      //     quantity: 10,
      //     price: 5000,
      //     total:2053,
      //     createdAt: Timestamp
      //   })
      // }

      const list = snapshot.docs.map((doc) => {
        const data = doc.data().stock;
        const find = stocks.find((s) => data === s.id); // undefined 또는 값 리턴
        //data() 함수를 매번 실행하기보다 한 번 선언해놓고 하는게 좋고 혹시 나중에
        //find.type, find.price 도 확장적으로 쓸 경우를 예상해서 함수로 사용

        return {
          id: doc.id,
          ...doc.data(),
          logo: find.logo ?? '',
          // logo: stocks.find((s) => {
          //   // return s.id === doc.data().stock;

          //   return s.id === doc.data().stock;
          // })?.logo,
          //직접 넣는거 보다 위에 함수 선언한게 확장성, 재사용성이 좋긴함
        };
      });
      // .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      //a-b, b-a 상관없이 무조건 결과만 보고 음수면 a를 앞으로 양수면 b를 앞으로
      console.log('리스트', list);
      // console.log('doc.data()', doc.data());
      // const optionList = getYearMonthOptions(list);
      setTrades(list);

      if (selectedMonth) return;
      const sorted = [...list].sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      // list를 그대로 sort하면 원본 배열이 바뀌어서
      // setTrades로 들어간 state(trades)도 같이 영향받을 수 있음

      // [...list]로 복사해서 정렬하면
      // 배열은 새로 만들고, 내부 객체는 그대로 참조 (얕은 복사)
      // → 순서만 바꾸는 경우 안전하게 사용 가능 (물론 객체값은 그대로 참조임 !!!)
      const first = sorted[0];
      if (!first) return;
      const d = first?.createdAt.toDate();
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      setSelectedMonth(value);
    };

    fetchTrades();
  }, [user, stocks]);

  useEffect(() => {
    console.log('트레이더 실행');
  }, [trades]);

  // if (!trades.length) {
  //   return (

  //   );
  // }

  return (
    <div className="history_list">
      <h2>거래 내역</h2>
      {!user ? (
        <div className="guest_area">
          <p className="welcome-desc">로그인 후 다양한 기능을 이용해보세요.</p>
          <button className="btn primary " onClick={() => navigate('/login')}>
            로그인
          </button>
          <p className="welcome-desc">
            계정이 없으신가요?
            <Link to="/signup" className="link_signup">
              회원가입 하기
            </Link>
          </p>
        </div>
      ) : (
        <>
          <ul className="stock-tabs">
            <li className="">
              <span
                onClick={() => {
                  toggle(1);
                }}
              >
                {selectedMonth === 'all' ? '전체' : `${selectedMonth}월`} 내역
              </span>
              <i className="fa fa-angle-down" aria-hidden="true"></i>
              <div className={`option_box ${openIndex === 1 ? 'open' : ''}`}>
                <span
                  onClick={() => {
                    setSelectedMonth('all');
                    toggle(1);
                  }}
                >
                  전체 내역
                </span>
                {getYearMonthOptions(trades).map((s) => (
                  <span
                    onClick={() => {
                      setSelectedMonth(s);
                      toggle(1);
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </li>
          </ul>
          {trades.length > 0 ? (
            <ul className="card_list">
              {filtered.map((t) => {
                return (
                  <li key={t.id}>
                    <Link to={`/stock/${t.stock}`} className="card_link">
                      <div className="left_box">
                        <img src={t.logo}></img>
                      </div>
                      <div className="right_box">
                        <p>
                          {t.stock} ({TRADE_TYPE_LABEL[t.type] ?? t.type})
                        </p>
                        <p>수량: {t.quantity ?? '-'}주</p>
                        <p>가격: {t.price ? t.price.toLocaleString() : '-'}원</p>

                        <p>{t.createdAt.toDate().toLocaleString('ko-KR')}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty-history-txt">
              <p>거래 내역이 없습니다.</p>
              <p>주식을 매수해보세요</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
