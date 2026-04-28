const AccountIcon = ({ size = 28 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <defs>
        <linearGradient id="zooGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5B9CFF" />
          <stop offset="100%" stopColor="#3A7BFF" />
        </linearGradient>
      </defs>

      {/* 배경 */}
      <rect width="28" height="28" rx="8" fill="url(#zooGrad)" />

      {/* 통장/카드 */}
      <rect x="6" y="8" width="16" height="12" rx="3" fill="white" />

      {/* 상단 라인 */}
      <rect x="6" y="10" width="16" height="2.5" fill="#3A7BFF" opacity="0.9" />

      {/* 하단 정보 느낌 */}
      <rect x="9" y="15" width="6" height="2" rx="1" fill="#3A7BFF" opacity="0.8" />
      <rect x="16" y="15" width="3" height="2" rx="1" fill="#3A7BFF" opacity="0.6" />
    </svg>
  );
};

export default AccountIcon;
