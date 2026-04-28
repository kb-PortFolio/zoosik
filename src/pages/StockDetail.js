import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../style/stock-detail.css';
import StockCharts from '../componets/StockChart';
import {
  doc,
  getDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  collection,
} from 'firebase/firestore';
import { db } from '../firebase';

function StockDetail({ user, setUser, stocks }) {
  const { id } = useParams(); //url name 파라미터 값 추출 (객체 비구조화 할당)
  const navigate = useNavigate();
  const [input, setInput] = useState();
  const [toastMessage, setToastMessage] = useState('');
  // 굳이 '' 를 반환하는 이유는 input이 문자열인걸 명시적으로 정하기 위해
  //<input value={input} onChange={...} /> 이런 경우
  // 초기 값이 없다면 언디파인드 뜨지

  const [chartMode, setChartMode] = useState('realtime');
  const [dailyHistory, setDailyHistory] = useState([]);
  const [tradeMod, setTradeMode] = useState('buy');

  const stock = stocks.find((s) => {
    return s.id === id;
  });

  const params = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    //document.documentElement.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!id || !user) return;
    const fetchDailyHistory = async () => {
      const q = query(
        collection(db, 'users', user.uid, 'prices', id, 'history'),
        orderBy('date', 'desc'),
        limit(30)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        price: doc.data().close,
        time: doc.data().date,
      }));

      setDailyHistory(data.reverse());
    };

    fetchDailyHistory(id);
  }, [id, user]);

  useEffect(() => {
    console.log('stock값 = ', stock);
  }, [stock]);

  console.log('유저스테이트', user);
  const position = user?.stocks?.[id] ?? { qty: 0, totalCost: 0 };
  const qty = position.qty;
  const totalCost = position.totalCost;

  const average_price = totalCost / qty; //평균단가
  const currentValue = stock.price * qty; //현재가 * 보유갯수
  const profit = currentValue - totalCost; //평가 손익 원
  const profitRate = (profit / totalCost) * 100; // 등락비율
  const maxBuy = Math.floor((user?.balance ?? 0) / stock.price);
  const isOver = input !== '' && Number(input) > maxBuy;
  const totalCost_amount = (stock.price ?? 0) * (input ?? 0);
  //input이 공백이 아니면 input과 maxBuy 값을 비교해서 false/true를 반환
  const isNoMoney = maxBuy === 0;

  // null병합연산자 => null/undefined만 체크
  // || 연산자 => false, 0, '', null, undefined, NaN 체크

  //find는 배열에서 조건을 만족하는 첫번째 요소를 리턴 (리턴에서 true가 나오면 그 배열 자체를 반환)
  //조건 만족하는 모든 걸 리턴하려면 filter()

  if (!stock) return <p>해당 종목을 찾을 수 없습니다.</p>;

  //const owned = user?.stocks?.[name] || 0;
  const owned = user?.stocks?.[id]?.qty ?? 0;
  // || 구문 대신 ?? 널 병합 연산자를 쓴 것은
  // or 구문은 0도 fasly로 인식해서 우측 값을 반환함..
  // 널 병합 연산은 undefined 나 null만 falsy로 인식하고

  // 변수값에 괄호를 써야만 출력 된 값으로 속성을 찾는다
  //그냥 name을 쓰면 name 속성값을 찾음
  //옵셔널 체이닝(위와 같이 ?. 같은)은 물론
  //user.stocks[name] 같은 동적 접근도 같은 원리

  const fetchCurrentPrice = async (tickerKeys) => {
    const snap = await getDoc(doc(db, 'users', user.uid, 'prices', tickerKeys));
    //db는 주소를 참조하는 포인터 함수
    //doc(db, 'user', user.id , 'prices', tickerKeys)

    if (snap.exists()) {
      const p = snap.data()?.price;
      // snap.data() 값이 없으면 undefined 반환, 값이 없음을 의미하고
      // 값을 잘못 사용할 때만 자바스크립트는 에러가남.
      //옵셔널 체인지, null 일 경우 undefined 반환(error 처리는 아님)

      return typeof p === 'number' ? p : null;
      // typeof 123 => 'number' , typeof 'hi' => 'string'
    }
    return null;
  };

  const handleBuy = async () => {
    if (!user) return;
    const quantity = parseInt(input, 10);
    //문자열 input을 10진수 숫자로 변환하겠다 (인풋 박스 값은 string으로 가져와짐)

    if (isNaN(quantity) || quantity <= 0) {
      alert('올바른 수량을 입력해주세요.');
      return;
    }
    //조건문에서 || 는 또는 이라는 or를 뜻하고
    //일반 변수 대입이나 리턴에서는 값을 반환
    // name = user.name || "기본값"  (논리 OR 연산자)
    //NaN => Not a Number, 숫자가 아님 뜻
    //quantity = 수량
    const tickerKey = id; //name은 useParams에 추출한 파라미터 값
    // const currentPrice = (await fetchCurrentPrice(tickerKey)) ?? stock.price;
    const currentPrice = stock.price;

    // ??는 null 병합 연산자이고 A가 null/undefined면 B를 반환 아니면 A 반환
    //||는 false, 0 , "" 같은 falsy도 없음으로 인식 (or 논리 연산자)
    // ?? 는 undefined, null 만 아니면 존재한다고 인식 (null 병합 연산자)

    if (typeof currentPrice !== 'number') {
      alert('종목의 가격 정보를 가져오지 못했습니다');
      return;
    }

    const totalPrice = quantity * currentPrice;

    if (typeof user.balance !== 'number' || isNaN(user.balance)) {
      alert('잔액 값이 잘못되어있습니다');
    }

    if (user.balance < totalPrice) {
      alert('잔액이 부족합니다.');
      return; // 단순 중단하기
      // return false 는 아래처럼 이벤트 핸들러 작동하지 않게 쓰임
      //       <form onSubmit={(e) => {
      //   e.preventDefault(); // 이거와 같은 효과
      //   console.log("폼 제출 막음");
      //   return false;
      // }}></form>
    }

    const prevPos = user?.stocks?.[id] ?? { qty: 0, totalCost: 0 };
    //옵셔널체인지하면 접근하는 값이 없어서 undefined가 반환되고 코드는 진행되지만
    //그냥 쓸 경우에는 접근하는 값이 없을 null/undefined인 경우 typeError가 발생한다.
    //이렇게 되면 null 병합 연산자를 하기전에 코드가 중단

    const updatedUser = {
      ...user,
      balance: user.balance - totalPrice,
      stocks: {
        ...(user.stocks ?? {}), // 스프레드는 객체만 펼칠 수 있으므로 null이 아닌 {} 를 리턴해야함
        [id]: {
          qty: prevPos.qty + quantity,
          totalCost: prevPos.totalCost + totalPrice,
        },

        //[]로 name을 감싸주는건 const name 값을 속성 이름을 쓰기 위해
        // 그냥 name 하면 name 으로 속성 이름이 지정됨
        //stocks.name 은 되어도 stocks.[name] 은 틀린 문법
        //stocks[name] 하면 [name] 속성의 값을 출력

        // null 병합 연산자를 쓸 경우 ?.[name] 이 가능
        //  A ?? B 일경우 A가 null 또는 undefined 일 경우 B를 사용해라
        // 0, false, NaN 일 경우는 A를 사용

        // ||(or)가 값 변환 용도로 쓰이는 경우
        //const result = a || b; 이런 경우엔
        //a가 falsy 면 b를 반환, a가 truthy면 a를 반환
      },
      // history: [
      //   ...(user.history || []),
      // {
      //   type: 'buy',
      //   stock: name,
      //   price: stock.price,
      //   quantity: quantity,
      //   date: new Date().toLocaleString(),
      // },
      // ],
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      const tradeCol = collection(db, 'users', user.uid, 'trades');
      const batch = writeBatch(db);
      //writeBatch 함수는 여러개의 쓰기 작업을 한 번에 원자적으로 실행하기 위한 객체

      //매서드랑 함수의 차이 !
      // 독립적으로 작동하는 코드 조각 writeBatch(db) == 함수
      //  객체 안에서 동작하는 함수 batch.set(docRef,data)

      batch.set(
        userRef,
        {
          balance: updatedUser.balance,
          // [`stocks.${name}`]: updatedUser.stocks[name],
          stocks: updatedUser.stocks,
          // stocks: {
          //   [id]: {
          //     qty: updatedUser.stocks[id].qty,
          //     totalCost: updatedUser.stocks[id].totalCost,
          //   },
          // },
          //[] 를 해주는 이유는 key 값을 변수로 표현하겠다 의미
          //stocks.${name} 해주는 이유는 stocks 필드안에 종목명이 있기 때문
          //
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      batch.set(doc(tradeCol), {
        // doc 안에 tradeCol을 하면 collection 인자를 받아먹음
        // doc(db, '컬렉션명', 문서ID, '하위컬렉션명', 자동 생성문서ID)

        // history: [
        //   ...(user.history || []),
        // {
        //   type: 'buy',
        //   stock: name,
        //   price: stock.price,
        //   quantity: quantity,
        //   date: new Date().toLocaleString(),
        // },
        // ],
        type: 'buy',
        stock: id,
        price: currentPrice,
        quantity: quantity, // 키 , 키값이 둘다 똑같은 경우엔 quantity, 이렇게
        //줄여도 상관없음
        total: totalPrice,
        //합산을 따로 키값으로 사용하는 이유는 이 값은 주로 화면에 출력을 하는 값이라
        //따로 이값을 위해 db를 참조하고 또 다시 state 에 넣어야만 쓸 수 있어
        //네트워크 자원이 낭비가 됨, 따라서 아예 필드(속성,컬럼)값을 넣음
        createdAt: serverTimestamp(),
        // createdAt 키명을 보통 직관적이라 실무에서 많이씀
      });

      await batch.commit();
      //writeBatch(db)로 만든 batch 객체 안에 쌓인 모든 작업을 한 번에 실행하는 것
      //batch.set(), batch.update(), batchdelete() 로 내무 메모리 큐에 쌓여있음
      //commit 매서드 자체도 비동기임

      setUser(updatedUser);
      setInput('');
      setToastMessage(`${stock.name} ${quantity}주를 매수했습니다.`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (e) {
      console.log('매수 실패:', e);
      alert('매수 중 오류가 발생했습니다.');
    }

    // navigate('/');
  };

  const handleSell = async () => {
    if (!user) return;

    const quantity = parseInt(input, 10);
    if (isNaN(quantity) || quantity <= 0) {
      //() 값이 NaN인지 , Not a Number 숫자가 아닌지
      alert('올바른 수량을 입력하세요.');
      return;
    }

    if ((user.stocks?.[id]?.qty ?? 0) < quantity) {
      alert('보유 수량이 부족합니다.');
      return;
    }

    const currentPrice = stock.price;

    // const testPromise = async () => {
    //   const nowPrice = await fetchCurrentPrice(name);
    //   alert(nowPrice);
    //   return null; //반환할게 없으면 자동적으로 undefined가 반환되서 굳이 null 안 넣어도됨
    // };

    // testPromise();

    const prevPos = user.stocks?.[id] ?? { qty: 0, totalCost: 0 };
    const avgCost = prevPos.qty > 0 ? prevPos.totalCost / prevPos.qty : 0;

    const updatedUser = {
      ...user,
      balance: user.balance + quantity * currentPrice,
      stocks: {
        ...(user.stocks ?? {}),
        // null 병합 연산자(??)는 null / undefined 일 때만 오른쪽으로 대체(애초에 falsy, truthy  판별이 아님)
        // 0, "", false 같은 값은 "존재하는 값"으로 그대로 사용한다.
        // 반면 OR 연산자(||)는 거짓같은 값은 falsy로 판별함
        [id]: {
          qty: prevPos.qty - quantity,
          totalCost: prevPos.totalCost - quantity * avgCost,
        },
        // [name]: user.stocks?.[name] - input,
      },
      // history: [
      //   ...(user.history || []),
      //   {
      //     type: 'sell',
      //     stock: name,
      //     price: currentPrice,
      //     quantity: quantity,
      //     date: new Date().toLocaleDateString(),
      //   },
      // ],
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      const tradeCol = collection(db, 'users', user.uid, 'trades');
      const batch = writeBatch(db);

      // const userRef = doc(db, 'users', user.uid);
      // const tradeCol = collection(db, 'users', user.uid, 'trades');

      batch.set(
        userRef,
        {
          balance: updatedUser.balance,
          // stocks: {
          //   [id]: {
          //     qty: updatedUser.stocks[id].qty,
          //     totalCost: updatedUser.stocks[id].totalCost,
          //   },
          // },
          stocks: updatedUser.stocks,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      batch.set(doc(tradeCol), {
        type: 'sell',
        price: currentPrice,
        quantity: quantity,
        stock: id,
        total: currentPrice * quantity,
        createdAt: serverTimestamp(),
        //serverTimestamp() 는 파이어베이스 서버에 내장된 현재 시각을 구하는 함수를 호출하는 것
      });

      await batch.commit();

      setUser(updatedUser);
      setInput('');
      setToastMessage(`${stock.name} ${quantity}주를 매도했습니다.`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (e) {
      console.log('에러', e);
    }

    // navigate('/');
  };

  const handlePercent = (percent) => {
    //현재 가진 돈 / 현재 주식 가격
    // const buy_quantity = Math.floor(((user.balance / stock.price) * percent) / 100);
    if (tradeMod === 'buy') {
      //  const maxBuy = Math.floor((user?.balance ?? 0) / stock.price);
      // 1/0 = infinity , 0/1 = 0

      const buyQty = Math.floor(maxBuy * percent);
      setInput(buyQty === 0 ? '' : String(buyQty));
      return;
    }
    if (tradeMod === 'sell') {
      const sellQty = Math.max(1, Math.floor(qty * percent));
      setInput(String(sellQty));
      return;
    }
  };

  // input value는 항상 string이므로 state도 string으로 유지한다.(trim 같은 매소드에서 에러날 수도 있고)
  // (계산할 때만 Number로 변환)
  const normalizeQuantity = (value) => {
    const v = value.trim();
    console.log('결과 처음값', v);

    //공백
    if (v === '') {
      setInput('');
      return;
    }
    //정수만
    if (!/^\d+$/.test(v)) {
      setInput('');
      return;
    }
    //test는 정규식 패턴에 맞다면 ture 반환 , /^\d+$/ 이건 양(0포함)의 정수로만 이뤄져 있는가 확인 정규식

    //0 들어오면 공백
    if (v === '0') {
      setInput('');
      return;
    }

    setInput(v);
  };

  const handleFocus = () => {
    if (input === '0') setInput('');
  };

  const handleIncrease = () => {
    setInput((prev) => {
      const v = String(prev).trim();
      // undefined 나 null이 와도 String 함수가 문자열로 변경함 "undefined" , "null" 이렇게

      if (!/^\d+$/.test(v)) return '1';
      //양수가 아니라면 string 1을 리턴

      const num = Number(v);
      return String(num + 1);
    });
  };

  const handleDecrease = () => {
    setInput((prev) => {
      const v = String(prev).trim();
      console.log('v값', v);

      //들어온 값이 양수가 아닐 경우,
      // test는 문자열 기준으로 검사해서 number로 넣어도 string으로 변경 후 검사
      if (!/^\d+$/.test(v)) {
        return '1';
      }

      //1일 경우
      if (v === '1') {
        console.log('v값 1들어와서 초기화');
        return prev;
      }

      return String(Number(v) - 1);
    });
  };

  return (
    <div className="stock-detail">
      {/* <div className="test1">
        <div>
          1<div>44</div>
          <div>44</div>
        </div>
        <div>
          2<div>44</div>
          <div>44</div>
        </div>
      </div> */}
      {toastMessage && <div className="toast">{toastMessage}</div>}
      {/* 여기서 &&는 그리고의 뜻이 아닌 참이면 다음 것을 랜더링한다 의미  */}
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
          <div className="stockDetail_header">
            <button onClick={() => navigate(-1)} className="back-button">
              <i class="fa fa-chevron-left" aria-hidden="true"></i>
            </button>
            <h2>{stock.name}</h2>
          </div>

          <div className="category-control">
            <button
              onClick={() => setTradeMode('buy')}
              className={`btn ${tradeMod === 'buy' ? 'active_red' : ''}`}
            >
              구매
            </button>
            <button
              onClick={() => setTradeMode('sell')}
              className={`btn ${tradeMod === 'sell' ? 'active_blue' : ''}`}
            >
              판매
            </button>
          </div>
          <div className="quantity-control">
            <div className="box1">
              <label>수량</label>

              <input
                value={input}
                className="quantity_input"
                type="text"
                onChange={(e) => normalizeQuantity(e.target.value)}
                onFocus={handleFocus}
                placeholder={
                  tradeMod === 'buy' ? `최대 ${maxBuy}주 구매 가능` : `최대 ${qty}주 판매 가능`
                }
                // min="0"
              />

              <button className="quantity_btn plus" onClick={handleIncrease}>
                <span>+</span>
              </button>
              <button className="quantity_btn minus" onClick={handleDecrease}>
                <span>-</span>
              </button>
              {/* input에 입력 받는 것은 모두 string으로 받아진다.. 숫자도 마찬가지 */}

              {/* {tradeMod === 'buy' ? (
          input > maxBuy ? (
            <p className="quantity-error">최대 {maxBuy}주까지만 구매 가능 </p>
          ) : (
            ''
          )
        ) : (
          ''
        )} */}
            </div>
            {tradeMod === 'buy' && isOver && (
              <p className="quantity-error">현재 금액에선 최대 {maxBuy}주 구매 가능합니다.</p>
            )}
            {tradeMod == 'sell' && input !== '' && Number(input) > qty && (
              <p className="quantity-error">최대 {qty}주까지만 판매 가능합니다.</p>
            )}
            <div className="box2">
              <div className="percent-buttons">
                <button onClick={() => handlePercent(0.1)}>
                  <span>10%</span>
                </button>
                <button onClick={() => handlePercent(0.25)}>
                  <span>25%</span>
                </button>
                <button onClick={() => handlePercent(0.5)}>
                  <span>50%</span>
                </button>
                <button onClick={() => handlePercent(1)}>최대</button>
              </div>
            </div>
          </div>

          <div className="info_wrap">
            {qty > 0 && (
              <>
                <p>평균단가: {average_price.toLocaleString()}원</p>
                {/* <p>
              평가손익: {profit.toLocaleString()}원 ({profitRate.toFixed(2)}%)
            </p> */}
              </>
            )}

            <p>현재가: {stock.price}원</p>
            <p>보유 수량: {owned}주</p>
            <p>잔액: {user?.balance.toLocaleString('ko-KR')}원</p>
            <p className="totalCost_amount">
              총 주문 금액: {totalCost_amount.toLocaleString('ko-KR')}원
            </p>
          </div>
          <div className="trade-buttons">
            {tradeMod == 'buy' ? (
              <button onClick={handleBuy} className={tradeMod === 'buy' ? 'buy' : ''}>
                <span>
                  주당 <span>{stock.price.toLocaleString('ko-KR')}</span>원 에 구매하기
                </span>
              </button>
            ) : (
              <button onClick={handleSell} className={tradeMod === 'sell' ? 'sell' : ''}>
                <span>
                  주당 <span>{stock.price.toLocaleString('ko-KR')}</span>원 에 판매하기
                </span>
              </button>
            )}
          </div>

          <div class="chart-section">
            <div className="detail-chart">
              <div className="chart-actions">
                <button
                  onClick={() => setChartMode('realtime')}
                  className={chartMode === 'realtime' ? 'active' : ''}
                >
                  실시간
                </button>
                <button
                  onClick={() => setChartMode('daily')}
                  className={chartMode === 'daily' ? 'active' : ''}
                >
                  종가
                </button>
              </div>
            </div>
            <StockCharts
              history={chartMode === 'realtime' ? stock.history : dailyHistory}
              mode={chartMode}
              stock={stock}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default StockDetail;

// 매수하면 아래 형식으로 user 객체가 저장될거야
// const user = {
//   id: 11222,
//   nickname: '11222님',
//   balance: 100000,
//   stocks: {
//     BearTech: 3
//   }
// };
// user는 객체라 부르고
// id ~stocks는 속성(key)
// 11222 같은 값은 값(value)
//stock는 객체안의 객체니까 (중첩)객체라고 불러
// BearTech는 마찬가지로 속성 ~
