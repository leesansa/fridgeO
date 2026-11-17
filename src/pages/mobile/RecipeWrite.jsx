import { Link, useNavigate, useParams } from "react-router";
import logo from "../../assets/Logo_FridgeO.svg";
import camera from "../../assets/review/camera.png";
import { DIFFICULTIES, useEditableRecipe, useRecipeForm } from "../../hooks/useRecipeForm.js";
import "../../styles/mobile/review-write.css";
import "../../styles/mobile/recipe-write.css";

// /recipe/new — 작성, /recipe/:id/edit — 내 레시피 수정 (로그인은 router 에서, 작성자 확인은 아래와 서버에서)
const RecipeWrite = () => {
    const { id } = useParams();
    const { recipe, error } = useEditableRecipe(id);

    if (!id) return <RecipeForm recipe={null} />;
    if (recipe) return <RecipeForm key={id} recipe={recipe} />;
    return (
        <div className="review-page recipe-write">
            <p className={error ? "review-error" : "rw-status"} role={error ? "alert" : "status"}>
                {error || "레시피를 불러오는 중..."}
            </p>
        </div>
    );
};

// 입력 상태·저장·삭제·사진은 데스크탑과 공통 (useRecipeForm), 여기서는 모바일 화면만 그림
const RecipeForm = ({ recipe }) => {
    const navigate = useNavigate();
    const f = useRecipeForm(recipe);

    return (
        <div className="review-page recipe-write">
            <header className="review-header">
                <button type="button" className="review-back" aria-label="뒤로가기" onClick={() => navigate(-1)}>
                    <svg viewBox="0 0 38 38" aria-hidden="true"><path d="M23 9 14.5 19 23 29" /></svg>
                </button>
                <Link to="/" className="review-logo" aria-label="홈으로"><img src={logo} alt="" /></Link>
                <h1>{recipe ? "레시피 수정하기" : "레시피 작성하기"}</h1>
            </header>

            <main className="review-main">
                <label className="rw-photo">
                    {f.photo ? <img src={f.photo.preview} alt="대표 사진 미리보기" /> : <span><img src={camera} alt="" />대표 사진 고르기</span>}
                    <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => f.pickPhoto(e.target.files[0])} />
                </label>

                <section className="rw-card">
                    <input className="rw-title" value={f.title} maxLength={50} onChange={(e) => f.setTitle(e.target.value)} placeholder="레시피 제목" aria-label="레시피 제목" />
                    <textarea className="rw-desc" value={f.description} maxLength={500} onChange={(e) => f.setDescription(e.target.value)} placeholder="어떤 요리인지 짧게 소개해 주세요" aria-label="소개" />
                </section>

                <section className="rw-card rw-info">
                    <label>
                        분류
                        <select value={f.categoryId} onChange={(e) => f.setCategoryId(e.target.value)}>
                            <option value="">선택 안 함</option>
                            {f.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                    <label>
                        인분
                        <input type="number" inputMode="numeric" min={1} max={20} value={f.servings} onChange={(e) => f.setServings(e.target.value)} />
                    </label>
                    <label>
                        조리 시간(분)
                        <input type="number" inputMode="numeric" min={1} max={600} value={f.cookTime} onChange={(e) => f.setCookTime(e.target.value)} />
                    </label>
                    <fieldset>
                        <legend>난이도</legend>
                        {DIFFICULTIES.map((d) => (
                            <label key={d} className={f.difficulty === d ? "is-selected" : ""}>
                                <input type="radio" name="difficulty" checked={f.difficulty === d} onChange={() => f.setDifficulty(d)} />
                                {d}
                            </label>
                        ))}
                    </fieldset>
                </section>

                <section className="rw-card">
                    <h2>재료</h2>
                    <datalist id="rw-ingredient-names">
                        {f.catalog.map((item) => <option key={item.name} value={item.name} />)}
                    </datalist>
                    {f.ingredients.map((row, i) => (
                        <div key={row.key} className="rw-row">
                            <input list="rw-ingredient-names" value={row.name} maxLength={30} placeholder="예: 달걀" aria-label={`재료 ${i + 1} 이름`}
                                onChange={(e) => f.editIngredient(row.key, "name", e.target.value)} />
                            <input className="rw-amount" value={row.amount} maxLength={30} placeholder="예: 2개" aria-label={`재료 ${i + 1} 양`}
                                onChange={(e) => f.editIngredient(row.key, "amount", e.target.value)} />
                            <button type="button" className="rw-del" aria-label={`재료 ${i + 1} 삭제`} onClick={() => f.removeIngredient(row.key)}>×</button>
                        </div>
                    ))}
                    <button type="button" className="rw-add" onClick={f.addIngredient}>+ 재료 추가</button>
                </section>

                <section className="rw-card">
                    <h2>만드는 순서</h2>
                    {f.steps.map((row, i) => (
                        <div key={row.key} className="rw-row">
                            <span className="rw-no">{i + 1}</span>
                            <div className="rw-step-body">
                                <textarea value={row.text} maxLength={500} placeholder="이 단계에서 할 일을 적어 주세요" aria-label={`${i + 1}단계`}
                                    onChange={(e) => f.editStep(row.key, e.target.value)} />
                                {row.photo ? (
                                    <div className="rw-step-photo">
                                        <img src={row.photo.preview} alt={`${i + 1}단계 사진 미리보기`} />
                                        <button type="button" aria-label={`${i + 1}단계 사진 빼기`} onClick={() => f.setStepPhoto(row.key, null)}>×</button>
                                    </div>
                                ) : (
                                    <label className="rw-step-attach">
                                        <img src={camera} alt="" />사진 추가
                                        <input type="file" accept="image/jpeg,image/png,image/webp" hidden
                                            onChange={(e) => f.setStepPhoto(row.key, e.target.files[0])} />
                                    </label>
                                )}
                            </div>
                            <button type="button" className="rw-del" aria-label={`${i + 1}단계 삭제`} onClick={() => f.removeStep(row.key)}>×</button>
                        </div>
                    ))}
                    <button type="button" className="rw-add" onClick={f.addStep}>+ 순서 추가</button>
                </section>

                {f.error && <p className="review-error" role="alert">{f.error}</p>}

                <div className="review-actions">
                    <button type="button" className="review-submit" disabled={f.saving} onClick={f.save}>
                        {f.saving ? "저장 중..." : recipe ? "수정 완료" : "레시피 등록"}
                    </button>
                    {recipe && (
                        <button type="button" className="review-submit review-submit--sub" disabled={f.saving} onClick={f.removeRecipe}>삭제</button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecipeWrite;
