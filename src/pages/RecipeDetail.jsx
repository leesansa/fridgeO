import { useState } from "react";
import Header from "../components/Header.jsx";
import { fridgeIngredients } from "../utils/fridgeData";
import "../vendor/lucian-icons/check.js"; // 065번 check 아이콘
import "../vendor/lucian-icons/edit.js"; // 079번 edit(연필) 아이콘
import "../styles/recipe-detail.css";

const images = Object.fromEntries(
    Object.entries(import.meta.glob("../assets/recipe/**/*.png", { eager: true, import: "default" }))
        .map(([path, url]) => [path.split("/").pop().replace(/\.\w+$/, ""), url]),
);

// 냉장고에 있는 재료 이름 (공백 뺀 이름으로 비교, 예: "소 금" = "소금")
const norm = (name) => name.replace(/\s/g, "");
const inFridge = new Set(fridgeIngredients.map((f) => norm(f.name)));

const ingredients = [
    { name: "콩나물", amount: "4줌" },
    { name: "멸치다시마육수", amount: "500ml" },
    { name: "국간장", amount: "1 T" },
    { name: "소금", amount: "1/3 T" },
    { name: "다진파", amount: "5 T" },
    { name: "다진마늘", amount: "5 T" },
];

const steps = [
    "콩나물은 누런부분과 껍질부분 제거하고 두세번 세척후 소쿠리에 받쳐줍니다. 미리 멸치다시마육수 500ml도 준비해주세요.",
    "냄비에 씻은 콩나물을 넣고 멸치다시마육수 500ml를 넣은후 물 700ml를 넣고요~",
    "센불로 켠후 끓으면 중약불로 줄여 5분동안 끓여줍니다.",
    "5분경과후~ 다진마늘1/2T, 다진파5T, 국간장1T, 멸치액젓1T를 넣은후~ 한번 바글 끓인후 간을 보셔서 싱거우면 소금간을 추가하세요~ ^^",
];

const intro = "안녕하세요. 김진옥입니다. 콩나물국 쉬운 요리인데... 제맛 내는것 어렵죠? 콩나물국 끓이실때요... 물로만 끓이지 마시고.. 멸치다시마육수를 반반 비율로 넣고 끓여보세요~ 간은 국간장,멸치액젓으로 해보시고요 ~~ 개운한 국물맛에 놀라실겁니다.";

const review = [
    "이 콩나물국 레시피는 간단하면서도 깊고 시원한 맛을 낸다는 호평이 많습니다. 멸치액젓이나 새우젓을 활용한 사람들의 후기에서는 국물의 맛을 훌륭하게 살렸다고 합니다.",
    "아이부터 어른까지 가족 모두의 입맛에 잘 맞으며, 요리 초보자도 쉽게 따라 할 수 있는 레시피라 칭찬받고 있습니다.",
];

// shortcut: 레시피 하나(콩나물국)만 있어 :id 를 쓰지 않음, 레시피 데이터가 생기면 id 로 골라 보여주기
const RecipeDetail = () => {
    // 체크 = 이미 갖고 있음. 처음엔 냉장고 재료로 채우고, 눌러서 바꿀 수 있음
    const [checked, setChecked] = useState(() => new Set(ingredients.filter((ing) => inFridge.has(norm(ing.name))).map((ing) => ing.name)));
    const toggle = (name) => setChecked((prev) => {
        const next = new Set(prev);
        if (!next.delete(name)) next.add(name);
        return next;
    });
    const missing = ingredients.filter((ing) => !checked.has(ing.name));
    const haveCount = ingredients.length - missing.length;

    return (
        <div className="detail-page">
            <Header />

            <main className="detail-main">
                <section className="detail-card detail-hero">
                    <img src={images.hero} alt="국물이 개운한 맑은 콩나물국" />
                    <div className="detail-hero-actions">
                        <button type="button" className="detail-btn"><lucian-edit size="16" tone="line" aria-hidden="true" /> 리뷰 작성하기</button>
                    </div>
                </section>

                <section className="detail-card">
                    <h1 className="detail-title">맑은 콩나물국</h1>
                    <p className="detail-author">김진옥</p>
                    <ul className="detail-tags" aria-label="요리 정보">
                        <li>15분</li>
                        <li>4인분</li>
                        <li>초급</li>
                    </ul>
                </section>

                <section className="detail-card">
                    <p className="detail-intro">{intro}</p>
                </section>

                <section className="detail-card" aria-label="준비물">
                    <div className="detail-ing-head">
                        <h2>준비물</h2>
                        <span className="detail-have">{haveCount}/{ingredients.length}개 준비됐어요</span>
                    </div>
                    <ul className="detail-ing-list">
                        {ingredients.map((ing) => {
                            const have = checked.has(ing.name);
                            return (
                                <li key={ing.name} className={`detail-ing ${have ? "have" : "lack"}`}>
                                    <label className="detail-ing-label">
                                        <input type="checkbox" className="detail-check" checked={have} onChange={() => toggle(ing.name)} />
                                        <span className="detail-ing-mark" aria-hidden="true">{have && <lucian-check size="26" />}</span>
                                        <span className="detail-ing-name">{ing.name}</span>
                                        <span className="detail-ing-amount">{ing.amount}</span>
                                    </label>
                                    {/* 이미 있는 재료는 담을 필요가 없어 버튼을 숨김 */}
                                    {have
                                        ? <span className="detail-ing-spacer" />
                                        : <button type="button" className="detail-btn detail-ing-btn" aria-label={`${ing.name} 장바구니에 담기`}>담기</button>}
                                </li>
                            );
                        })}
                    </ul>
                    {missing.length > 0 && (
                        // shortcut: 쿠팡은 여러 상품을 한 번에 담는 주소가 없어 없는 재료 이름으로 검색 결과만 열어 줌, 쿠팡 파트너스 API 를 쓰게 되면 교체
                        <a
                            className="detail-btn detail-btn--wide"
                            href={`https://www.coupang.com/np/search?q=${encodeURIComponent(missing.map((ing) => ing.name).join(" "))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            없는 재료 {missing.length}개 장바구니에 담기
                        </a>
                    )}
                </section>

                <section className="detail-card" aria-label="만드는 순서">
                    <h2>만드는 순서</h2>
                    <ol className="detail-steps">
                        {steps.map((text, i) => (
                            <li key={i} className="detail-step">
                                <div className="detail-step-photo">
                                    <img src={images[`step${i + 1}`]} alt={`${i + 1}단계 사진`} />
                                    <span className="detail-step-no" aria-hidden="true">{i + 1}</span>
                                </div>
                                <p>{text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="detail-card detail-review" aria-label="AI 리뷰 요약">
                    <span className="detail-review-badge">AI 리뷰 요약</span>
                    {review.map((p) => <p key={p}>{p}</p>)}
                    <div className="detail-positive">
                        <span>긍정리뷰 100%</span>
                        <span className="detail-positive-bar" aria-hidden="true"><span style={{ width: "100%" }} /></span>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default RecipeDetail;
