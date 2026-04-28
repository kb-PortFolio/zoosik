import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import '../style/setting.css';

export default function Settings({ user, setUser }) {
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const navigate = useNavigate();

  // 닉네임 변경
  const handleUpdateNickname = async () => {
    if (!user?.uid) return;
    if (!nickname.trim()) return;

    await updateDoc(doc(db, 'users', user.uid), {
      nickname: nickname.trim(),
    });

    // 로컬 상태도 갱신 (중요)
    setUser((prev) => ({
      ...prev,
      nickname: nickname.trim(),
    }));

    alert('닉네임이 변경되었습니다.');
  };

  useEffect(() => {
    console.log('user', user);
  }, [user]);

  // 로그아웃
  const handleLogout = async () => {
    // alert('체험용 계정은 로그아웃을 할 수 없습니다');
    // return;
    await signOut(auth);
    navigate('/');
  };

  // 계정 초기화 (심플)
  const handleReset = async () => {
    if (!user?.uid) return;

    if (!window.confirm('거래 내역 포함 전체 초기화를 진행할까요?')) {
      return;
    }

    const uid = user.uid;

    // 1️⃣ balance / stocks 초기화
    await updateDoc(doc(db, 'users', uid), {
      balance: 1000000,
      stocks: {},
    });

    // 2️⃣ trades 서브컬렉션 삭제
    const tradesSnapshot = await getDocs(collection(db, 'users', uid, 'trades'));

    const deletePromises = tradesSnapshot.docs.map((d) => deleteDoc(d.ref));

    await Promise.all(deletePromises);

    alert('계정이 초기화되었습니다.');
    navigate('/');
  };
  return (
    <div className="settings-page">
      <h2 className="settings-title">설정</h2>

      {/* 반환하는 값이 undefined 나 null 일 경우 react에서 무시하고 랜더링 안함 */}
      {user && (
        <section className="settings-section">
          <label className="settings-label">닉네임 변경</label>
          <input
            className="settings-input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={user ? user.nickname : '-'}
          />{' '}
          <button onClick={handleUpdateNickname} className="btn btn_save">
            저장
          </button>
        </section>
      )}

      {user ? (
        <section className="settings-actions">
          <button onClick={handleLogout} className="btn btn_log">
            로그아웃
          </button>
          <button onClick={handleReset} className="btn btn_reset">
            계정 초기화
          </button>
        </section>
      ) : (
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
      )}
    </div>
  );
}
