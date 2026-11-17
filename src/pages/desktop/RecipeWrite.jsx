import { Link, useNavigate, useParams } from "react-router";
import camera from "../../assets/review/camera.png";
import { DIFFICULTIES, useEditableRecipe, useRecipeForm } from "../../hooks/useRecipeForm";
import "../../styles/desktop/recipe-write.css";

const PHOTO_TYPES = "image/jpeg,image/png,image/webp";

// 데스크탑 레시피 작성·수정: 왼쪽 제목·소개·재료·순서 | 오른쪽(고정) 대표 사진·요리 정보·저장
// 불러오기·입력 상태·저장·삭제·사진은 모바일과 같은 useEditableRecipe·useRecipeForm
const RecipeWrite = () => {
    const { id } = useParams();
    const { recipe, error } = useEditableRecipe(id);

    if (!id) return <RecipeForm recipe={null} />;
    if (recipe) return <RecipeForm key={id} recipe={recipe} />;
    return (
        <div className="dwrite">
            <p className={error ? "dwrite-error" : "dwrite-status"} role={error ? "alert" : "status"}>
                {error || "레시피를 불러오는 중..."}
            </p>
        </div>
    );
};

const RecipeForm = ({ recipe }) => {
    const navigate = useNavigate();
    const f = useRecipeForm(recipe);

    return (
        <div className="dwrite">
            <nav className="dwrite-crumbs" aria-label="현재 위치">
                <Link to="/recipe">레시피</Link>
                {recipe && <> › <Link to={`/recipe/${recipe.id}`}>{recipe.title}</Link></>}
                {" › "}<span aria-current="page">{recipe ? "수정" : "새 레시피 작성"}</span>
            </nav>

            <form
                className="dwrite-layout"
                onSubmit={(e) => {
                    e.preventDefault();
                    f.save();
                }}
            >
                <div className="dwrite-main">
                    <h1>{recipe ? "레시피 수정하기" : "레시피 작성하기"}</h1>

                    <section className="dwrite-card">
                        <label className="dwrite-label" htmlFor="dwrite-title">레시피 제목</label>
                        <input id="dwrite-title" className="dwrite-title" value={f.title} maxLength={50}
                            onChange={(e) => f.setTitle(e.target.value)} placeholder="예: 밀가루 없이 두부도우로 피자 만들기" />
                        <div className="dwrite-hint">{f.title.length} / 50</div>
                        <label className="dwrite-label" htmlFor="dwrite-desc">소개</label>
                        <textarea id="dwrite-desc" className="dwrite-desc" value={f.description} maxLength={500}
                            onChange={(e) => f.setDescription(e.target.value)} placeholder="어떤 요리인지, 어떤 점이 좋은지 짧게 소개해 주세요" />
                        <div className="dwrite-hint">{f.description.length} / 500</div>
                    </section>

                    <section className="dwrite-card" aria-labelledby="dwrite-ing-title">
                        <div className="dwrite-card-head">
                            <h2 id="dwrite-ing-title">재료 <span>{f.ingredients.filter((r) => r.name.trim()).length}</span></h2>
                            <span className="dwrite-hint">재료 이름은 자동완성돼요</span>
                        </div>
                        <datalist id="dwrite-ingredient-names">
                            {f.catalog.map((item) => <option key={item.name} value={item.name} />)}
                        </datalist>
                        <ol className="dwrite-ings">
                            {f.ingredients.map((row, i) => (
                                <li key={row.key}>
                                    <input list="dwrite-ingredient-names" value={row.name} maxLength={30} placeholder="재료 이름 (예: 달걀)"
                                        aria-label={`재료 ${i + 1} 이름`} onChange={(e) => f.editIngredient(row.key, "name", e.target.value)} />
                                    <input value={row.amount} maxLength={30} placeholder="양 (예: 2개)"
                                        aria-label={`재료 ${i + 1} 양`} onChange={(e) => f.editIngredient(row.key, "amount", e.target.value)} />
                                    <button type="button" className="dwrite-del" aria-label={`재료 ${i + 1} 삭제`}
                                        disabled={f.ingredients.length === 1} onClick={() => f.removeIngredient(row.key)}>×</button>
                                </li>
                            ))}
                        </ol>
                        <button type="button" className="dwrite-add" onClick={f.addIngredient}>+ 재료 추가</button>
                    </section>

                    <section className="dwrite-card" aria-labelledby="dwrite-step-title">
                        <div className="dwrite-card-head">
                            <h2 id="dwrite-step-title">만드는 순서 <span>{f.steps.length}</span></h2>
                            <span className="dwrite-hint">단계마다 사진을 넣을 수 있어요</span>
                        </div>
                        <ol className="dwrite-steps">
                            {f.steps.map((row, i) => (
                                <li key={row.key}>
                                    <span className="dwrite-no" aria-hidden="true">{i + 1}</span>
                                    <textarea value={row.text} maxLength={500} placeholder="이 단계에서 할 일을 적어 주세요"
                                        aria-label={`${i + 1}단계`} onChange={(e) => f.editStep(row.key, e.target.value)} />
                                    {row.photo ? (
                                        <div className="dwrite-step-photo">
                                            <img src={row.photo.preview} alt={`${i + 1}단계 사진 미리보기`} />
                                            <button type="button" aria-label={`${i + 1}단계 사진 빼기`} onClick={() => f.setStepPhoto(row.key, null)}>×</button>
                                        </div>
                                    ) : (
                                        <label className="dwrite-step-photo is-empty">
                                            <img src={camera} alt="" />
                                            사진 추가
                                            <input type="file" accept={PHOTO_TYPES} hidden onChange={(e) => f.setStepPhoto(row.key, e.target.files[0])} />
                                        </label>
                                    )}
                                    <button type="button" className="dwrite-del" aria-label={`${i + 1}단계 삭제`}
                                        disabled={f.steps.length === 1} onClick={() => f.removeStep(row.key)}>×</button>
                                </li>
                            ))}
                        </ol>
                        <button type="button" className="dwrite-add" onClick={f.addStep}>+ 순서 추가</button>
                    </section>
                </div>

                <aside className="dwrite-side">
                    <section className="dwrite-card">
                        <h2>대표 사진</h2>
                        <label className="dwrite-photo">
                            {f.photo
                                ? <img src={f.photo.preview} alt="대표 사진 미리보기" />
                                : <span><img src={camera} alt="" />대표 사진 고르기</span>}
                            <input type="file" accept={PHOTO_TYPES} hidden onChange={(e) => f.pickPhoto(e.target.files[0])} />
                        </label>
                        {f.photo && <p className="dwrite-hint">사진을 누르면 다른 사진으로 바꿀 수 있어요</p>}
                    </section>

                    <section className="dwrite-card dwrite-info">
                        <h2>요리 정보</h2>
                        <label>
                            분류
                            <select value={f.categoryId} onChange={(e) => f.setCategoryId(e.target.value)}>
                                <option value="">선택 안 함</option>
                                {f.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </label>
                        <div className="dwrite-info-row">
                            <label>
                                인분
                                <input type="number" min={1} max={20} value={f.servings} onChange={(e) => f.setServings(e.target.value)} />
                            </label>
                            <label>
                                조리 시간(분)
                                <input type="number" min={1} max={600} value={f.cookTime} onChange={(e) => f.setCookTime(e.target.value)} />
                            </label>
                        </div>
                        <fieldset>
                            <legend>난이도</legend>
                            <div className="dwrite-chips">
                                {DIFFICULTIES.map((d) => (
                                    <label key={d} className={f.difficulty === d ? "is-on" : undefined}>
                                        <input type="radio" name="difficulty" checked={f.difficulty === d} onChange={() => f.setDifficulty(d)} />
                                        {d}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    </section>

                    {f.error && <p className="dwrite-error" role="alert">{f.error}</p>}

                    <div className="dwrite-actions">
                        <button type="submit" className="dwrite-btn primary" disabled={f.saving}>
                            {f.saving ? "저장 중..." : recipe ? "수정 완료" : "레시피 등록"}
                        </button>
                        <button type="button" className="dwrite-btn" disabled={f.saving}
                            onClick={() => navigate(recipe ? `/recipe/${recipe.id}` : "/recipe")}>취소</button>
                        {recipe && (
                            <button type="button" className="dwrite-btn danger" disabled={f.saving} onClick={f.removeRecipe}>레시피 삭제</button>
                        )}
                    </div>
                </aside>
            </form>
        </div>
    );
};

export default RecipeWrite;
