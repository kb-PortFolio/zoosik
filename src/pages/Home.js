import { useState, useEffect } from 'react';
import '../style/home.css';
import StockChart_mini from '../componets/StockChart_mini';
import { Link, useNavigate } from 'react-router-dom';
import StockItem from '../pages/StockItem';
import { db, auth } from '../firebase';
import { doc, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import Accounticon from '../componets/icons/AccountIcon';

function Home({ user, stocks, handleShowToast }) {
  //console.log('✅ [Home 컴포넌트 진입] stocks:', stocks);
  //console.log('✅ [Home 컴포넌트 진입] user:', user);

  const [randomStocks, setRandomStocks] = useState([]);
  const [tradeStocks, setTradeStocks] = useState();
  const [viewType, setViewType] = useState('real');
  const showToast = handleShowToast;
  const navigate = useNavigate();

  const ownedStocks = Object.entries(user?.stocks ?? {}).filter(([_, stock]) => stock.qty > 0);
  //[
  //[BearTech,{qty:2, totalCost:14584}]
  //[BearTech,{qty:2, totalCost:14584}]
  //[BearTech,{qty:2, totalCost:14584}]
  //]

  useEffect(() => {
    if (stocks.length > 0) {
      const shuffled = [...stocks].sort(() => 0.5 - Math.random());
      setRandomStocks(shuffled.slice(0, 6).map((s) => s.id));
    }
  }, []);

  useEffect(() => {
    // console.log('스턱스 값:', stocks);
  }, [stocks]);

  // const renderStockItem = (stock, changeClass, change) => (
  //   <>
  //     <div className="stock-info">
  //       {stock.name} -
  //       <StockItem stock={stock} change={change} changeClass={changeClass} />
  //     </div>
  //     <StockChart history={stock.history} />
  //   </>
  // );

  useEffect(() => {
    console.log('🔥 Home user 변화:', user);
  }, [user]);

  //디비 연동
  useEffect(() => {
    if (!user?.uid) {
      setTradeStocks(null);
      return;
    }
    fetchTrades();

    //if (user?.uid) console.log('고정값 uid', user.uid);
    // console.log('user 값 ', user);
    // const aa = Object.values(user?.stocks);
    // console.log('벨류값', aa);
    // console.log('값', aa[0].totalCost);
    // const totalAA = aa.map((a) => {
    //   return a.totalCost;
    // });
    // console.log(totalAA);
    console.log('user값=', user);
  }, [user]);

  const investedAmount = Object.entries(user?.stocks ?? {}).reduce((acc, [, stock]) => {
    //Object.entries, 객체의 키와 값을 가져와서 배열로 만듬
    return acc + stock.totalCost;
  }, 0);

  //[
  //  [BearTech,{qty:2, totalCost:14584}]
  //  [test,{qty:2, totalCost:14584}]
  //  [aaaa,{qty:2, totalCost:14584}]
  //]

  //   stocks = [
  //  { id: "BearTech", name: "비어테크", price: 2222 },
  //  { id: "KoalaSoft", name: "코알라테크", price: ... },
  //  { id: "HamsterCorp", name: "햄스터회사", price: ... },
  //  ...
  // ]
  const totalProfit = Object.entries(user?.stocks ?? {}).reduce((acc, [stockId, holding]) => {
    const marketStock = stocks.find((s) => s.id === stockId);
    const curPrice = marketStock.price;
    const profit = curPrice * holding.qty - holding.totalCost;
    // 마켓가격*주식 구매수 - 주식 총 구매액

    return acc + profit;
  }, 0);

  // 손익금 / 총구매액 *100

  const totalAssets = (investedAmount + totalProfit).toLocaleString('ko-KR', {
    maximumFractiondigits: 0,
    minimumFractionDigits: 0,
  });
  // 투자원금+손익금

  const rate = (totalProfit / investedAmount) * 100;
  const profitRate = isNaN(rate) ? 0 : rate;

  const formattedProfit_global =
    totalProfit > 0
      ? `+${totalProfit.toLocaleString('ko-KR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`
      : totalProfit.toLocaleString('ko-KR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
  //toLocaleString은 string 으로 반환을 하기 때문에 toFixed를 뒤에 못씀, number해도 콤마 때문에 NaN

  const ClassProfit = totalProfit > 0 ? 'profit-plus' : totalProfit < 0 ? 'profit-minus' : '';

  const fetchTrades = async () => {
    try {
      const q = query(
        collection(db, 'users', user.uid, 'trades'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      const trade_list = snap.docs.map((aa) => ({
        stock: aa.data().stock,
        price: aa.data().price,
        quantity: aa.data().quantity,
        created: aa.data().createdAt?.toDate().toLocaleString('ko-KR', {
          year: '2-digit',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        }),
        //toDate로 js의 Date() 객체로 만들어도 형태는 object임
        //jsx에선 toLocaleString으로 문자열로 바꾸고 출력해야함
      }));

      setTradeStocks(trade_list);

      // ()한번더 감싸주는건 표현식으로 인식하고 자동 반환

      //getDocs로 가져온다고해서 바로 배열화가 되는건 아니다
      //querySnapshot 객체 구조로 가져오며 이 값들은 데이터 뿐만 아니라
      //메타 데이터도 가지고 있다, 따라서 배열을 가지고 있는
      // //docs를 가져와야하므로 sanp.docs 가 비로서 배열화 되는 것
      // console.log('작동중', tradeStocks);
    } catch (e) {
      console.log('에러발생: ', e);
    }
  };

  useEffect(() => {
    // console.log(tradeStocks, 'tradeStocks 값');
  }, [tradeStocks]);

  // useEffect(() => {
  //   const user_db = getDoc(db, 'users', userid);
  // }, []);

  // const randomStocks = useMemo(() => {
  //   const shuffled = [...stocks].sort(() => 0.5 - Math.random());

  //   return shuffled.slice(0, 6); // 슬라이스는 뒷 숫자 미만임 6이면 5까지만
  // }, [stocks]);

  //Math.random 은 0 이상 1 미만 숫자 반환
  // 최대값 => 0.5 + 0.999 = -0.5 , 최소값 => 0.5 -0 = 0.5
  // sort는 기본적으로 문자열 오른차순으로 정렬함
  // [3,2,4,1].sort((a,b)=> a-b )
  // sort는 수식이 음수면 a가 앞, 양수면 a가 뒤로 간다

  // 이전 주식 값에 비해 올랏는지 내렸는지 확인
  const getChangeRate = (stock) => {
    if (stock.prevClose == null) return null;
    //const history = stock.history;

    // if (history.length < 2) return null; //[3, 5] 2

    // const prev = history[history.length - 2]; //3
    // const curr = history[history.length - 1]; //5

    // const diff = curr - prev; // 현재가 5, 이전이 3이라는 가정하에
    const diff = stock.prevClose - stock.price;
    //const rate = ((diff / prev) * 100).toFixed(2); // 2/3*100 은 66.66에서
    // 소수점 2자리에서 반올림 => 66.67

    return {
      //자바스크립트에선 리터럴로 쓴다, jsx 는  return()
      diff,
      isUp: diff < 0,
      isSame: diff === 0,
    };

    //{} 리터럴로 속성과 키값들이 있는 경우가 객체 리터럴 이라 부름
  };

  // const handleShowToast = (msg) => {
  //   setToastMessage(msg);
  //   setShowToast(true);
  //   setTimeout(() => {
  //     setShowToast(false);
  //   }, 2000);
  // };

  //truthy 로 간주되는 값들 => "문자열("false" 도 됨)", [] , {} , function(){}, Infinity, -1 1 3.14 등 숫자
  //falsy 로 간주되는 값들 => false, 0, -0, On, "", null, undefined, NaN

  const allStock_avgRate =
    stocks.reduce((acc, cur) => {
      if (cur.prevClose <= 0) return acc;
      //reduce는 계산을 하는 함수라 return 만 쓰면 undefined가 리턴되 오류가 날 수 잇음
      const rate = ((cur.price - cur.prevClose) / cur.price) * 100;
      return acc + rate;
      //100 - 120 /100
      // return acc + (cur.price ?? 0);
    }, 0) / stocks.length;

  //reduce 인자는 누적값/현재요소/인덱스/원본배열 , 그리고 마지막에 시작값(0)
  //reduce는 []빈 배열로 시작될 경우 콜백 함수 자체가 아예 안돌아감, length 가 0 이라

  const allAvg_displayRate = Number(allStock_avgRate.toFixed(1));
  const formatRate = (s) => (s > 0 ? `+${s}%` : s < 0 ? `${s}%` : s + '%');

  //현재 모든 주식의 price를 가져온다
  //주식의 수량으로 나눈다 끗

  const ttt = Object.entries(user?.stocks ?? {});

  // console.log('유저', ttt);

  return (
    <div className="home-container">
      <h1 className="welcome-title">
        <span className="title-text">Zoosik증권</span>
        <span className="market-info ">
          현재 시장 평균
          <span
            className={`market-rate ${allAvg_displayRate > 0 ? 'plus' : allAvg_displayRate < 0 ? 'minus' : ''}`}
          >
            {formatRate(allAvg_displayRate)}
          </span>
        </span>
      </h1>
      <section className="welcome-section">
        {!user && (
          <>
            <p className="welcome-desc">로그인 후 자산과 보유 종목을 확인할 수 있습니다.</p>
            <button className="btn primary large" onClick={() => navigate('/login')}>
              로그인하고 시작하기
            </button>
          </>
        )}
      </section>
      {/* 
      <div class="test_flex">
        <div>111</div>
        <div>222</div>
        <div>333</div>
      </div>

      <div class="test_grid">
        <div>111</div>
        <div>222</div>
        <div>333</div>
      </div> */}
      {/* 프래그먼트는 엘리먼트에 실제로 나타나지 않음*/}
      <div className={!user ? 'blur' : ''}>
        <h2 className="">
          <Accounticon />
          기본계좌
        </h2>

        <div className="accout-card">
          {user ? (
            <div className="accout-box">
              <>
                <div className="accout-row">
                  <span className="label">원화</span>
                  <span className="value">{user.balance.toLocaleString()}원</span>
                </div>
                <div className="accout-row">
                  <span className="label">투자원금</span>
                  <span className="value">
                    {investedAmount.toLocaleString('ko-KR', {
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    })}
                    원
                  </span>
                </div>
                {/* <div className="accout-row">
                  <span className="label">손익금</span>
                  <span className={`value profit`}>
                    <span>{(investedAmount + totalProfit).toLocaleString('ko-KR')}원</span>
                    <span>
                      {formattedProfit_global}원 ({profitRate.toFixed(2)}%)
                    </span>
                  </span>
                </div> */}
              </>
            </div>
          ) : (
            <div className="accout-box">
              <>
                <div className="accout-row">
                  <span className="label">원화</span>
                  <span className="value">574,350원</span>
                </div>
                <div className="accout-row">
                  <span className="label">투자금</span>
                  <span className="value">34,950,000원</span>
                </div>
              </>
            </div>
          )}
        </div>

        {/* <div className="test-table">
          <div className="test-table__row head">
            <div>종목</div>
            <div>가격</div>
            <div>등락률</div>
          </div>

          <div className="test-table__row">
            <div>삼성전자11111111111111111111111111111111</div>
            <div>125,000212121213123123213123213213213123</div>
            <div>+14.2%</div>
          </div>
          <div className="test-table__row">
            <div>카카오</div>
            <div>125,000</div>
            <div>+4.2%</div>
          </div>
        </div> */}
        {/* 
        <div class="grid-table">
          <div class="header">종목</div>
          <div class="header">현재가</div>
          <div class="header">등락률</div>

          <div>삼성전자11111111111111111111111111111111</div>
          <div>125,000212121213123123213123213213213123</div>
          <div>+1.2%</div>

          <div>LG에너지솔루션</div>
          <div>420,000</div>
          <div>-0.5%</div>
        </div> */}
        <section className="total-assets">
          <span className="total-assets__title">내 투자</span>
          <span className="total-assets__user-value">{totalAssets}원</span>
          <span className={`total-assets__profit ${ClassProfit}`}>
            {formattedProfit_global}원 ({profitRate.toFixed(2)}%)
          </span>
        </section>
        <div className="btn-toggle">
          <div className="btn-toggle__wrap">
            <button
              className={`btn-toggle__btn ${viewType === 'real' && 'active'}`}
              onClick={() => setViewType('real')}
            >
              현재가
            </button>
            <button
              className={`btn-toggle__btn ${viewType === 'eval' && 'active'}`}
              onClick={() => setViewType('eval')}
            >
              평가금
            </button>
          </div>
        </div>

        {/* <h2 className="section-title">내 종목 보기</h2> */}

        {/* {console.log('Object.entries=', Object.entries(user?.stocks ?? {}))} */}

        {ownedStocks.length > 0 ? (
          //user && user.stocks && Object.keys(user.stocks).length
          //Object.keys 는 객체에서 모든 키만 뽑아서 배열로 만드는 함수
          //stocks 는 [name] : 갯수 가 있는데
          //여기서 name 만 뽑아서 배열로 만듬
          // ["aaa", "bbb", "ccc"]
          // length는 배열에서만 사용가능하고 객체의 속성 수는 object.keys 를 이용해야함
          viewType === 'eval' ? (
            <div className="stocks-table">
              {/* <div className="stocks-row stocks-head">
                <span>종목명</span>
                <span>평균단가</span>
                <span>손익률</span>
              </div> */}

              {Object.entries(user?.stocks ?? {})
                // const userStocks = {
                //   BearTech: {
                //        qty: 2,
                //        totalCost: 20000
                //             }
                //   KoalaSoft: 5,
                //   TigerMotors: 1,
                // };
                //Object.entries는 객체를 키와 값 쌍을 배열로 바꿔주는 매서드
                // [
                //   ["BearTech",{totalCoast:20000, qty:2}]
                //   ["BearTech", 2],
                //   ["KoalaSoft", 5],
                //   ["TigerMotors", 1],
                // ]
                .filter(([, position]) => position.qty > 0)
                //.filter((eee) => eee[1] > 0) 비구조하면 이렇게 써도 됨
                // 여기서  stockName , qunatity 로  구조분해 한 값을 써야하나
                // stockName은 쓰이지 않으니까 실상, 스킵자리, 빈슬롯 등으로 불림
                // 물론 [stockName, qunatity] 로 써도 상관은 없음

                .map(([stockId, position]) => {
                  const found = stocks.find((s) => s.id === stockId);

                  //console.log('found=', found);
                  //find 는 조건에 맞는 첫번째 객체나 배열을 통째로 가져옴
                  const average_price = position.totalCost / position.qty; //평균단가
                  const currentValue = found.price * position.qty; //현재가 * 보유갯수
                  const profit = currentValue - position.totalCost; //평가 손익 원
                  const profitRate = (profit / position.totalCost) * 100; // 등락비율
                  const formattedProfit =
                    profitRate > 0 ? `+${profitRate.toFixed(2)}` : profitRate.toFixed(2);

                  // const prev_price = found?.price;

                  // const priceDiff = prev_price - average_price;
                  // const diffRate = (priceDiff / average_price) * 100;
                  // const changeAmount = (prev_price - average_price) * position.qty;
                  return (
                    <Link to={`/stock/${stockId}`} key={stockId}>
                      {/*  */}
                      <div className="stocks-row">
                        <div className="col-name eq0">
                          <span className="img_wrap">
                            <img src={found.logo}></img>
                          </span>
                          <div className="stockInfo_wrap">
                            <span className="stock-name">{found?.name ?? stockId}</span>
                            <span className="stock-qty">{position.qty}주</span>
                          </div>
                        </div>

                        <div className={` col-name eq1`}>
                          <span className="current-price">
                            {currentValue.toLocaleString('ko-KR', {
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0,
                            })}
                            원
                          </span>
                          <span
                            className={`${
                              profitRate > 0 ? 'positive' : profitRate < 0 ? 'negative' : 'normal'
                            } profit`}
                          >
                            <span>
                              {profit.toLocaleString('ko-KR', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </span>
                            ({formattedProfit}%)
                          </span>
                        </div>
                      </div>
                    </Link>
                    // <li key={stockId} className="txt_type1">
                    //   <Link to={`/stock/${stockId}`}>
                    //     <span className="t2 txt_bold">
                    //       {found?.name ?? stockId}: {position.qty}주 보유
                    //     </span>
                    //     <div className="txt_type1">
                    //       <span className="t3">평균단가:{average_price.toLocaleString()}원,</span>
                    //       <span className="t3">평가손익:{profit.toLocaleString()}원, </span>
                    //       <span className="txt_bold">
                    //         {profitRate.toFixed(1)}%{/*toFixed() */}
                    //       </span>
                    //     </div>
                    //   </Link>
                    // </li>
                  );
                })}
            </div>
          ) : (
            <div className="stocks-table">
              {Object.entries(user?.stocks ?? {})
                .filter((entry) => {
                  if (entry[1].qty > 0) {
                    return entry;
                  }
                })
                .map((entry) => {
                  const stock = stocks.find((stock) => stock.id === entry[0]);
                  // console.log('탁', stock);
                  const average_price = entry[1].totalCost / entry[1].qty;
                  const display_price = average_price.toLocaleString('ko-KR', {
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  });
                  const dailyChange = ((stock.price - stock.prevClose) / stock.prevClose) * 100;
                  const formattedDailyChange = dailyChange.toFixed(1);
                  const display_dailyChange =
                    dailyChange > 0 ? `+${formattedDailyChange}` : formattedDailyChange;

                  //종가 - 현재 가격
                  return (
                    <Link to={`/stock/${stock.id}`}>
                      <div className="stocks-row">
                        <div className="col-name eq0">
                          <div className="chart-area">
                            <StockChart_mini stock={stock} history={stock.history} />
                          </div>
                          <div className="stockInfo_wrap">
                            <span className="stock-name">{stock.name}</span>
                            <span className="stock-qty">내 평균 {display_price}원</span>
                          </div>
                        </div>

                        <div className={` col-name eq1`}>
                          <span className="current-price">
                            {stock.price.toLocaleString('ko-KR', {
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0,
                            })}
                            원
                          </span>
                          <span className={`profit ${dailyChange > 0 ? 'positive' : 'negative'}`}>
                            <span>{display_dailyChange}%</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>

            // <div className="stocks-table">

            // </div>
          )
        ) : user ? (
          <Link to="/explore" className="stocks-empty">
            <p className="empty-title">현재 종목이 없습니다.</p>
            <p className="empty-desc">주식을 매수해보세요.</p>
          </Link>
        ) : (
          <div className="stocks-table">
            <div className="stocks-row stocks-head">
              <span>종목명</span>
              <span>평균단가</span>
              <span>손익률</span>
            </div>
            <div className="stocks-row">
              <span className="col-name">비어테크</span>
              <span className="col-price">500,300원</span>
              <span className="col-rate positive">30.5%</span>
            </div>
            <div className="stocks-row">
              <span className="col-name">햄스터주식회사</span>
              <span className="col-price">200,300원</span>
              <span className="col-rate negative">-10.5%</span>
            </div>
          </div>
        )}
      </div>
      {/* 공통 주식 목록 */}
      {/* <h2 style={{ marginTop: '2rem' }}>ZooSik 주식 목록</h2>
      <ul>
        {randomStocks.map((stockName, index) => {
          const stock = stocks.find((s) => s.id === stockName);
          //stock 는 셔플된 배열을 stocks에서 찾음, name을 통해서

          if (!stock) return null;

          const change = getChangeRate(stock);

          let changeClass = '';
          if (change) {
            if (change.isSame) changeClass = 'stock-same';
            else if (change.isUp) changeClass = 'stock-up';
            else changeClass = 'stock-down';
          }

          return (
            <li key={stock.id}>
              {user ? (
                <Link to={`/stock/${stock.id}`}>
                  <div className="stock-item">{renderStockItem(stock, changeClass, change)}</div>
                </Link>
              ) : (
                <div
                  className="stock-item stock-disabled"
                  onClick={() => showToast('로그인 후 이용하세요')}
                >
                  {renderStockItem(stock, changeClass, change)}
                </div>
              )}
            </li>
          );
        })}
      </ul> */}
      {/* 
      <div className="more-button-wrapper">
        <Link to="/stocks" className="more-button">
          더보기
        </Link>
      </div> */}
      {/* {user && (
        <>
          <h2 style={{ marginTop: '2rem' }}>최근 거래 내역</h2>
          {tradeStocks ? (
            <ul>
              {tradeStocks?.map((aaa, idx) => (
                <li key={idx}>
                  {stocks.find((s) => s.id === aaa.stock)?.name} : {aaa.price}원 - {aaa.quantity}주
                  // ({aaa.created})
                </li>
              ))}
            </ul>
          ) : (
            <p>거래 내역이 없습니다.</p>
          )}
        </>
      )} */}
    </div>
  );
}

export default Home;
