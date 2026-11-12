// 편집 화면 하단 바 (홈 · 냉장고 · 레시피 · 마이페이지 아이콘). shortcut: 버튼에 이동 기능이 없음, 공통 하단 바(Layout 의 Navigation)와 겹치면 이 파일은 지울 것
const EditBottomNav = () => (
  <nav className="ingredient-edit-nav">
    <button>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#85A86E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </button>
    <button>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#85A86E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="5" y1="10" x2="19" y2="10" />
        <line x1="9" y1="6" x2="9" y2="7" />
        <line x1="9" y1="14" x2="9" y2="16" />
      </svg>
    </button>
    <button>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#85A86E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 7v5" />
        <path d="M15 7v5" />
        <path d="M9 12v5" />
        <path d="M15 12v5" />
      </svg>
    </button>
    <button>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#85A86E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </button>
  </nav>
);

export default EditBottomNav;
