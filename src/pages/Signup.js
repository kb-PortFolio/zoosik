import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

//firebase 에서 회원가입 및 db 관련 함수 import
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

import '../style/signup.css';

function Signup() {
  //setUser 프롭 받던거 삭제
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [error, setError] = useState(null); // 에러 메세지 상태 추가를 위한 스테이트

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (pw !== pwConfirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    try {
      // 파이어 베이스 ??
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      //auth 서버에 새로운 유저를 생성하고 email/pw 입력받고 uid 발급
      const user = userCredential.user;
      //계정 생성 성공하면 userCredential 객체를 반환하고
      // 여기에는 유저 정보를 가진 user, user.uid, user.email 이 잇음

      await setDoc(doc(db, 'users', user.uid), {
        //setDoc 는 첫번째 인자 doc로 만든 문서 , 두번째는 실제 저장할 데이터
        //doc(db, '컬렉션이름', '문서ID')
        nickname: nickname.trim(),
        balance: 1000000,
        stocks: {},
      });

      navigate('/');
    } catch (err) {
      console.error('회원가입 실패:', err);
      setError(err.message);
    }

    // const newUser = {
    //   id,
    //   nickname: id + '님',
    //   balance: 1000000,
    //   stocks: {},
    // };

    // setUser(newUser);
    // navigate('/');
  };

  return (
    <div className="signup-container">
      <div className="stockDetail_header">
        <button onClick={() => navigate(-1)} className="back-button">
          <i class="fa fa-chevron-left" aria-hidden="true"></i>
        </button>
        <h2>회원가입</h2>
      </div>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="로그인시 사용할 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="signup-input signup-input-email"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          minLength={6}
          required
          className=" signup-input signup-input-pw"
        />
        <input
          type="password"
          placeholder="비밀번호 재입력"
          value={pwConfirm}
          onChange={(e) => setPwConfirm(e.target.value)}
          minLength={6}
          required
          className="signup-input signup-input-pw-re"
        />
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          required
          className="signup-input signup-input-nick"
        />
        <button type="submit" className="btn primary">
          회원가입
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
      <div className="guest_area">
        <p className="welcome-desc">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="link_signup">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
