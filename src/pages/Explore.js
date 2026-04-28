import { useEffect, useMemo, useState } from 'react';
import '../style/explore.css';
import { Link, useNavigate } from 'react-router-dom';
import { loadRecentViewed, removeRecentViewed, clearRecentViewed } from '../utils/recentViewed';

export default function Explore({ stocks = [], user }) {
  // stocks 값이 undefined 일 때 만 [] 로 대체해서 프롭스를 받겠다 이거임
  // function abc(ab = '바보') {
  //   console.log(ab);
  // }
  // abc() => 기본값인 바보 출력, abc(11)=> 인자값인 11 출력
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  //스테이트 값을 안넣게 되면 query.includes('a') 매서드는 초기 값일 때
  //undefined로 넘어가서 에러가 뜸

  console.log('스턱스', stocks);
  const [activeTaps, setActiveTaps] = useState('rise');

  const visibieStocks = stocks
    .filter((s) => {
      console.log('계산됨');
      const q = query.toLowerCase().trim();
      if (!q) return true;
      //검색어 없으면 밑에 구문 안읽고 그냥 다 보여주게 하기 위해서

      if (!s.name || !s.id) return false;

      const name = s.name.toLowerCase().trim();
      const id = s.id.toLowerCase().trim();

      return name.includes(q) || id.includes(q);

      // const sort_s = includes_a.sort((a, b) => {
      //   const rateA = (a.price - a.prevClose) / a.price;
      //   const rateB = (b.price - b.prevClose) / b.price;

      //   if (rateA > rateB) return 1;
      //   if (rateA === rateB) return 0;
      //   if (rateA < rateB) return -1;
      //   // if (activeTaps === 'rise') {
      //   //   return s;
      //   // }
      //   // if (activeTaps === 'fall') {
      //   //   return s;
      //   // }
      // });   1 2 3 4 5
    })
    .sort((a, b) => {
      const rateA = (a.price - a.prevClose) / a.price;
      const rateB = (b.price - b.prevClose) / b.price;

      if (activeTaps === 'rise') return rateB - rateA;
      if (activeTaps === 'fall') return rateA - rateB;
    });

  const handleSortToggle = () => {
    // if (activeTaps === 'rise') setActiveTaps('fall');
    // if (activeTaps === 'fall') setActiveTaps('rise');

    //이전 스테이트 상태를 읽어서 값을 비교하거나 생성하는 경우는 이전 값을 확실히 받기 위해
    // prev를  안전하게 써주는게 좋다.. 당장 작동은 되더라도 빠르게 누르면 에러날지도.
    setActiveTaps((prev) => {
      if (prev === 'rise') return 'fall';
      if (prev === 'fall') return 'rise';
    });
  };
  // const visibieStocks = useMemo(() => {
  //   //useMemo는 랜더링하는 과정에서 실행이 되며
  //   //의존성 배열에 있는 값이 변경되지 않는 한 실행이 되지 않는다
  //   //첫번째 인자로 받는 콜백 함수는 실행하고 있지 않다가 위 랜더링 되는 시점에 실행되고
  //   //그 함수가 return 한 값을 useMemo의 반환값으로 사용함
  //   const q = query.trim().toLowerCase();
  //   //trim()= 문자 앞,끝 "공백, 탭, 줄바꿈" 제거 메소드, toLowerCase()= 소문자로 변경해줌

  //   if (!q) return stocks;
  //   const filter_s = stocks.filter((s) => {
  //     //filter(조건) , 조건에 맞는 요소만 찾아서 다시 배열을 리턴
  //     const name = (s.name || '').toLowerCase();
  //     const id = (s.id || '').toLowerCase();
  //     return name.includes(q) || id.includes(q);
  //   });

  //   return sort_s;
  // }, [stocks, query]);

  //   //q는 입력한 값

  // //name=비어테크, id=beartech, q='bear'혹은'비어'등
  // //리턴은 비어테크 or beartech

  return (
    <div className="explore">
      <h2 className="explore_title">종목</h2>
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
          <div className="explore-search">
            <input
              className="explore_input"
              type="search"
              placeholder="주식명 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {/* {query && (
          <button className="explore_clear" type="button" onClick={() => setQuery('')}>
            지우기
          </button>
        )} */}

            {/* A가 truthy면 A를 반환 => or
        A가 truthy면 B를 반환 => and */}
          </div>
          <ul className="stock-tabs">
            {/* <li className="stock-tabs-item">거래대금</li>
        <li className="stock-tabs-item">거래량</li> */}
            <li
              className={`stock-tabs-item ${activeTaps === 'rise' || 'fall' ? 'active' : ''}`}
              onClick={handleSortToggle}
            >
              등락률
              {activeTaps === 'rise' ? (
                <i className="fa fa-angle-up" aria-hidden="true"></i>
              ) : (
                <i className="fa fa-angle-down" aria-hidden="true"></i>
              )}
            </li>
            {/* <li
          className={`stock-tabs-item ${activeTaps === 'fall' ? 'active' : ''}`}
          onClick={() => setActiveTaps('fall')}
        >
          하위 변동
        </li> */}
          </ul>
          <ul className="stock-list">
            {visibieStocks.map((s, idx) => {
              const price = s.price ?? 0;
              const prev = s.prevClose ?? 0;

              const changeRate = price === 0 ? 0 : (price - prev) / price;
              const changeRateFormatted = changeRate.toFixed(2);
              const changeRateDisplay =
                changeRate > 0 ? `+${changeRateFormatted}` : changeRateFormatted;

              return (
                <li key={s.id} className="stock-row">
                  <Link className="stock-row-link" to={`/stock/${s.id}`}>
                    <span className="stock-index">{idx + 1}</span>
                    <div className="img_wrap">
                      <img src={`/logos/${s.id}.png`} />
                    </div>
                    <div className="stock_info">
                      <span className="stock-row-name">{s.name}</span>
                      <span className="stock-row-price">
                        {s.price.toLocaleString('ko-KR', {
                          maximumFractionDigits: 0,
                          minimumFractionDigits: 0,
                        })}
                        원
                        <span
                          className={`rate ${changeRate > 0 ? 'positive' : changeRate < 0 ? 'negative' : ''}`}
                        >
                          {changeRateDisplay}%
                        </span>
                      </span>
                    </div>

                    {/* <div className="stock-row_right">
                <p className="stock-row_price">
                  {typeof s.price === 'number' ? `${s.price.toLocaleString('ko-kr')}원` : '-'} */}
                    {/* typeof 연산자는 항상 string을 반환해서 "number" 이라고 해야함 */}
                    {/* == 는 값만 비교 === 는 값+타입 비교 */}
                    {/* </p>
              </div> */}
                  </Link>
                </li>
              );
            })}
          </ul>
          {visibieStocks.length === 0 && <p className="explore_empty">검색 결과가 없습니다.</p>}
        </>
      )}
    </div>
  );
}
