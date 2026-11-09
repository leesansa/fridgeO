import React, { useState } from "react";

const MyPage = () => {
  // 간단한 인터랙션 확인용 상태 (클릭해보실 수 있습니다)
  const [count, setCount] = useState(3);
  const [storage, setStorage] = useState("냉장");
  const [selectedChip, setSelectedChip] = useState("사과");

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        
        .mockup-wrapper {
          font-family: 'Pretendard', sans-serif;
          background-color: #E5E5E5;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 40px;
          padding: 40px;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .phone {
          width: 340px;
          height: 680px;
          background-color: #F2F2F2;
          border-radius: 36px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          position: relative;
          border: 8px solid #FFFFFF;
        }
        .header {
          background: #FFFFFF;
          padding: 18px 20px;
          font-weight: 700;
          font-size: 15px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
        }
        .card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .label {
          font-size: 12px;
          color: #777;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .input-box {
          font-size: 16px;
          font-weight: 700;
          color: #222;
          border-bottom: 2px solid #91AE6E;
          padding-bottom: 8px;
        }
        .chip-group {
          display: flex;
          gap: 6px;
          margin-top: 10px;
        }
        .chip {
          background: #F2F2F2;
          color: #555;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 20px;
          cursor: pointer;
        }
        .chip.active {
          background: #91AE6E;
          color: #FFF;
          font-weight: 600;
        }
        .row {
          display: flex;
          gap: 12px;
        }
        .col {
          flex: 1;
        }
        .stepper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #F2F2F2;
          border-radius: 10px;
          padding: 6px 12px;
          font-weight: 700;
          user-select: none;
        }
        .stepper span {
          color: #689D4B;
          cursor: pointer;
          font-size: 18px;
          padding: 0 4px;
        }
        .toggle {
          display: flex;
          background: #F2F2F2;
          border-radius: 10px;
          padding: 4px;
          font-size: 13px;
          cursor: pointer;
        }
        .toggle div {
          flex: 1;
          text-align: center;
          padding: 6px 0;
          border-radius: 8px;
          color: #777;
        }
        .toggle .active {
          background: #689D4B;
          color: #FFF;
          font-weight: 700;
        }
        .date-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #333;
        }
        .badge-red {
          background: #D96868;
          color: #FFF;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 700;
        }
        .cta-btn {
          background: #689D4B;
          color: #FFFFFF;
          text-align: center;
          padding: 16px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 16px;
          margin-top: auto;
          box-shadow: 0 4px 12px rgba(104, 157, 75, 0.3);
          cursor: pointer;
        }
        /* 마이페이지 스타일 */
        .search-bar {
          background: #F2F2F2;
          border-radius: 20px;
          padding: 8px 14px;
          font-size: 12px;
          color: #888;
          flex: 1;
        }
        .profile {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #91AE6E;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          text-align: center;
          padding: 12px 0;
        }
        .stat-num {
          font-weight: 700;
          font-size: 16px;
          color: #689D4B;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
        .recipe-scroll {
          display: flex;
          gap: 10px;
        }
        .recipe-item {
          flex: 1;
          background: #F2F2F2;
          border-radius: 10px;
          padding: 10px;
          font-size: 12px;
          font-weight: 600;
        }
        .menu-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        .menu-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #F2F2F2;
          cursor: pointer;
        }
        /* 하단 탭바 */
        .nav-wrap {
          padding: 12px 16px 20px;
        }
        .nav-bar {
          background: #FFFFFF;
          border-radius: 30px;
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          font-size: 12px;
          font-weight: 600;
          color: #999;
        }
        .nav-bar .active {
          color: #689D4B;
          font-weight: 700;
        }
        .logo-btn {
          width: 38px;
          height: 38px;
          background: #689D4B;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          position: relative;
        }
        .logo-dot {
          width: 4px;
          height: 10px;
          background: #D96868;
          border-radius: 2px;
          margin-left: 6px;
        }
      `}</style>

      <div className="mockup-wrapper">
        {/* 화면 1: 냉장재료 등록 */}
        <div className="phone">
          <div className="header">&lt; 홈 &nbsp;|&nbsp; 냉장재료 등록</div>
          <div className="content">
            <div className="card">
              <div className="label">어떤 재료인가요?</div>
              <div className="input-box">🍎 {selectedChip}</div>
              <div className="chip-group">
                {["사과", "계란", "우유", "대파"].map((item) => (
                  <div
                    key={item}
                    className={`chip ${selectedChip === item ? "active" : ""}`}
                    onClick={() => setSelectedChip(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="row">
              <div className="card col">
                <div className="label">수량 (몇 개)</div>
                <div className="stepper">
                  <span onClick={() => setCount(Math.max(1, count - 1))}>
                    -
                  </span>
                  {count}개<span onClick={() => setCount(count + 1)}>+</span>
                </div>
              </div>
              <div className="card col">
                <div className="label">보관 방법</div>
                <div className="toggle">
                  <div
                    className={storage === "냉장" ? "active" : ""}
                    onClick={() => setStorage("냉장")}
                  >
                    냉장
                  </div>
                  <div
                    className={storage === "냉동" ? "active" : ""}
                    onClick={() => setStorage("냉동")}
                  >
                    냉동
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="label">유통기한</div>
              <div className="date-box">
                <span>2026. 11. 08 까지</span>
                <span className="badge-red">D-3 임박</span>
              </div>
            </div>

            <div className="cta-btn">추가완료</div>
          </div>

          <div className="nav-wrap">
            <div className="nav-bar">
              <span>홈</span>
              <span>레시피</span>
              <div className="logo-btn">
                <div className="logo-dot"></div>
              </div>
              <span className="active">냉장고</span>
              <span>마이</span>
            </div>
          </div>
        </div>

        {/* 화면 2: 마이페이지 */}
        <div className="phone">
          <div className="header">
            <div className="logo-btn" style={{ width: "28px", height: "28px" }}>
              <div className="logo-dot" style={{ height: "7px" }}></div>
            </div>
            <div className="search-bar">🔍 레시피나 재료를 검색해보세요</div>
          </div>
          <div className="content">
            <div className="card profile">
              <div className="avatar">🍏</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "16px" }}>
                  프레시요리사 님
                </div>
                <div
                  style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
                >
                  오늘도 냉장고를 비워볼까요?
                </div>
              </div>
            </div>

            <div className="card stats">
              <div>
                <div className="stat-num">12</div>
                <div className="stat-label">북마크</div>
              </div>
              <div style={{ borderLeft: "1px solid #EEE" }}></div>
              <div>
                <div className="stat-num">34</div>
                <div className="stat-label">팔로우</div>
              </div>
              <div style={{ borderLeft: "1px solid #EEE" }}></div>
              <div>
                <div className="stat-num" style={{ color: "#D96868" }}>
                  5
                </div>
                <div className="stat-label">구독</div>
              </div>
            </div>

            <div className="card">
              <div className="label">최근 본 레시피 / 정보</div>
              <div className="recipe-scroll">
                <div className="recipe-item">
                  🥗 사과 샐러드
                  <br />
                  <span style={{ fontSize: "10px", color: "#888" }}>
                    10분 완성
                  </span>
                </div>
                <div className="recipe-item">
                  🍲 두부 된장찌개
                  <br />
                  <span style={{ fontSize: "10px", color: "#888" }}>
                    재료 100% 일치
                  </span>
                </div>
              </div>
            </div>

            <div className="card menu-list">
              <div className="menu-item">
                <span>내 냉장고 관리</span>
                <span className="badge-red">임박 2개 &gt;</span>
              </div>
              <div className="menu-item">
                <span>개인정보 관리</span>
                <span style={{ color: "#CCC" }}>&gt;</span>
              </div>
              <div className="menu-item" style={{ border: "none", padding: 0 }}>
                <span>알림 설정 &nbsp;|&nbsp; 동의/약관</span>
                <span style={{ color: "#CCC" }}>&gt;</span>
              </div>
            </div>
          </div>

          <div className="nav-wrap">
            <div className="nav-bar">
              <span>홈</span>
              <span>레시피</span>
              <div className="logo-btn">
                <div className="logo-dot"></div>
              </div>
              <span>냉장고</span>
              <span className="active">마이</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPage;
