import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

import '../style/login.css';

function Login() {
  // 이렇게 props 객체를 받음
  // props = {
  //  setUser2: setUser
  // }
  //{setUser2} = props
  //구조분해할당으로 {setUser2} 로 사용
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState(null);
  //초기값을 null , "" , undefined 줘도 똑같이 fasly기 때문에
  const navigate = useNavigate();
  //useNavigate 함수를 실행하면 내부적으로 navigate 함수를 반환함(상수명 상관 없음)
  //즉 navigate() 는 내부적 navigate를 실행하는 것

  useEffect(() => {
    const unsbscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        navigate('/');
      }
    });

    return () => unsbscribe();
  }, [navigate]);
  //유스이펙트는 항상 최상단에 써야함~
  //의존성 배열은 보통 useEffect 내부에 쓰인 외부 스코프들은 다 써준다.
  //naviate는 변하지 않는 변수지만 외부값들은 써주는게 린트 규칙

  const handleLogin = async (e) => {
    e.preventDefault(); //form 작동 안되게해서 새로고침 막음
    setError(null); //에러 유무 다시 초기화

    try {
      await signInWithEmailAndPassword(auth, email, pw);
      navigate('/');
    } catch (err) {
      console.error('로그인 실패: ', err);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="stockDetail_header">
        <button onClick={() => navigate(-1)} className="back-button">
          <i class="fa fa-chevron-left" aria-hidden="true"></i>
        </button>
        <h2>로그인</h2>
      </div>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          className="login-input login-input--email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          className="login-input login-input-pw"
          placeholder="비밀번호를 입력하세요"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="current-password"
          required
        />
        <button type="submit" className="btn primary">
          로그인
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="guest_area">
        <p className="welcome-desc">
          계정이 없으신가요?
          <Link to="/signup" className="link_signup">
            회원가입 하기
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
