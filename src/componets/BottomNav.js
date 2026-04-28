import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        //NavLink 내부에 isActive, isPending 속성을 가진 객체가 있고
        //그것을 함수에서 구조분해로 선언해서 바로 사용하는 것
        // navLinkData(함수명은 임의) = {
        //   isActive: boolean,
        //   isPanding: boolean
        // }
        className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
      >
        <span className="bottom-nav__icon">
          <i class="fa fa-home" aria-hidden="true"></i>
        </span>
        <span className="bottom-nav__label">내계좌</span>
      </NavLink>
      <NavLink
        to="/explore"
        className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
      >
        <span className="bottom-nav__icon">
          <i class="fa fa-search" aria-hidden="true"></i>
        </span>
        <span className="bottom-nav__label">탐색</span>
      </NavLink>
      {/* <NavLink
        to="/history"
        className={({ isActive }) => {
          return 'bottom-nav_icon ' + (isActive ? 'is-active' : '');
        }}
      >
        <span className="bottom-nav__icon">
          <i class="fa fa-list-alt" aria-hidden="true"></i>
        </span>
        <span className="bottom-nav__label">내역</span>
      </NavLink> */}
      <NavLink
        to="/history"
        className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
      >
        <span className="bottom-nav__icon">
          <i class="fa fa-list-alt" aria-hidden="true"></i>
        </span>
        <span className="bottom-nav__label">내역</span>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
      >
        <span className="bottom-nav__icon">
          <i class="fa fa-cog" aria-hidden="true"></i>
        </span>
        <span className="bottom-nav__label">설정</span>
      </NavLink>
    </nav>
  );
}
