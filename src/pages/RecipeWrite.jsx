import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import logo from "../assets/Logo_FridgeO.svg";
import camera from "../assets/review/camera.png";
import { apiFetch } from "../utils/auth.js";
import { useIngredientCatalog } from "../utils/ingredientCatalog.js";
import { uploadImage } from "../utils/uploadImage.js";
import "../styles/review-write.css";
import "../styles/recipe-write.css";

const DIFFICULTIES = ["쉬움", "보통", "어려움"];

// 재료·순서 줄마다 고유 key (지우고 추가해도 입력칸이 섞이지 않게)
let nextKey = 1;
const newIngredient = () => ({ key: nextKey++, name: "", amount: "" });
const newStep = () => ({ key: nextKey++, text: "", photo: null });

// 사진 = { file, preview }. 새로 고른 사진은 file 이 있고 preview 는 임시 주소, 이미 저장된 사진은 file 없이 preview = 저장된 주소
const savedPhoto = (url) => (url ? { file: null, preview: url } : null);
const release = (p) => p?.file && URL.revokeObjectURL(p.preview); // 임시 주소만 메모리에서 해제

// /recipe/new — 작성, /recipe/:id/edit — 내 레시피 수정 (로그인은 router 에서, 작성자 확인은 아래와 서버에서)
const RecipeWrite = () => {
    const { id } = useParams();
    // 응답을 어느 id 것인지와 함께 보관 (다른 레시피 수정으로 바로 옮겨 가도 이전 내용이 채워지지 않게)
    const [loaded, setLoaded] = useState({ id: null, recipe: null, error: "" });
    const recipe = loaded.id === id ? loaded.recipe : null;
    const error = loaded.id === id ? loaded.error : "";

    useEffect(() => {
        if (!id) return;
        let ignore = false;
        apiFetch(`/api/recipes/${encodeURIComponent(id)}`)
            .then((data) => !ignore && setLoaded(data.mine
                ? { id, recipe: data, error: "" }
                : { id, recipe: null, error: "내가 쓴 레시피만 수정할 수 있어요" }))
            .catch((e) => !ignore && setLoaded({ id, recipe: null, error: e.message }));
        return () => { ignore = true; };
    }, [id]);

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

// recipe 가 있으면 그 내용으로 채워서 수정, 없으면 새로 작성. 사진은 저장 버튼을 누를 때 R2 에 올림 (작성 중 나가면 안 올라감)
const RecipeForm = ({ recipe }) => {
    const navigate = useNavigate();
    const catalog = useIngredientCatalog(); // 재료 이름 자동완성
    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState(recipe?.title ?? "");
    const [description, setDescription] = useState(recipe?.description ?? "");
    const [categoryId, setCategoryId] = useState(recipe?.category_id ?? "");
    const [servings, setServings] = useState(recipe?.servings ?? "");
    const [cookTime, setCookTime] = useState(recipe?.cook_time ?? "");
    const [difficulty, setDifficulty] = useState(recipe?.difficulty ?? "");
    const [photo, setPhoto] = useState(() => savedPhoto(recipe?.image_url));
    const [ingredients, setIngredients] = useState(() =>
        recipe?.ingredients.length ? recipe.ingredients.map((i) => ({ key: nextKey++, name: i.name, amount: i.amount ?? "" })) : [newIngredient()]);
    const [steps, setSteps] = useState(() =>
        recipe?.steps.length ? recipe.steps.map((s) => ({ key: nextKey++, text: s.text, photo: savedPhoto(s.image_url) })) : [newStep()]);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        apiFetch("/api/categories").then(setCategories).catch(() => {}); // 실패하면 분류 없이 저장
    }, []);

    // 미리보기 주소는 사진을 바꾸거나 화면을 나갈 때 메모리에서 해제
    useEffect(() => () => release(photo), [photo]);
    const stepsRef = useRef(steps);
    useEffect(() => { stepsRef.current = steps; });
    useEffect(() => () => stepsRef.current.forEach((row) => release(row.photo)), []);

    const pickPhoto = (e) => {
        const file = e.target.files[0];
        setPhoto(file ? { file, preview: URL.createObjectURL(file) } : null);
    };

    // 목록의 key 번째 줄의 field 값을 바꿈
    const edit = (setList, key, field, value) =>
        setList((list) => list.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
    const remove = (setList, key) => setList((list) => (list.length > 1 ? list.filter((row) => row.key !== key) : list));

    // 단계 사진 고르기·빼기 (file 이 없으면 뺌). 이전 미리보기 주소는 해제
    const setStepPhoto = (key, file) => {
        release(steps.find((row) => row.key === key)?.photo);
        edit(setSteps, key, "photo", file ? { file, preview: URL.createObjectURL(file) } : null);
    };
    const removeStep = (key) => {
        const row = steps.find((s) => s.key === key);
        if (steps.length > 1) release(row.photo);
        remove(setSteps, key);
    };

    // 내 레시피 삭제 (작성자 확인은 서버). 지우면 되돌릴 수 없어 한 번 더 묻고, 끝나면 레시피 목록으로
    const removeRecipe = async () => {
        if (!window.confirm("이 레시피를 삭제할까요? 리뷰와 북마크도 함께 지워지고 되돌릴 수 없어요.")) return;
        setSaving(true);
        setError("");
        try {
            await apiFetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
            navigate("/recipe", { replace: true });
        } catch (e) {
            setError(e.message);
            setSaving(false);
        }
    };

    const save = async () => {
        // 비워 둔 줄은 빼고 보냄 (사진만 있는 단계는 보내서 서버가 "입력하세요" 를 알려 줌). 나머지 검사는 서버가 함
        const filledIngredients = ingredients.filter((row) => row.name.trim()).map(({ name, amount }) => ({ name, amount }));
        const filledSteps = steps.filter((row) => row.text.trim() || row.photo);
        setSaving(true);
        setError("");
        try {
            // 새로 고른 사진만 한꺼번에 올리고, 이미 저장된 사진은 주소 그대로
            const [imageUrl, ...stepImages] = await Promise.all(
                [photo, ...filledSteps.map((row) => row.photo)].map((p) => (p?.file ? uploadImage(p.file) : p?.preview ?? null)),
            );
            const { id } = await apiFetch(recipe ? `/api/recipes/${recipe.id}` : "/api/recipes", {
                method: recipe ? "PUT" : "POST",
                body: {
                    title, description, categoryId, servings, cookTime, difficulty, imageUrl,
                    ingredients: filledIngredients,
                    steps: filledSteps.map((row, i) => ({ text: row.text, imageUrl: stepImages[i] })),
                },
            });
            navigate(`/recipe/${id}`, { replace: true });
        } catch (e) {
            setError(e.message);
            setSaving(false);
        }
    };

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
                    {photo ? <img src={photo.preview} alt="대표 사진 미리보기" /> : <span><img src={camera} alt="" />대표 사진 고르기</span>}
                    <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickPhoto} />
                </label>

                <section className="rw-card">
                    <input className="rw-title" value={title} maxLength={50} onChange={(e) => setTitle(e.target.value)} placeholder="레시피 제목" aria-label="레시피 제목" />
                    <textarea className="rw-desc" value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} placeholder="어떤 요리인지 짧게 소개해 주세요" aria-label="소개" />
                </section>

                <section className="rw-card rw-info">
                    <label>
                        분류
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                            <option value="">선택 안 함</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                    <label>
                        인분
                        <input type="number" inputMode="numeric" min={1} max={20} value={servings} onChange={(e) => setServings(e.target.value)} />
                    </label>
                    <label>
                        조리 시간(분)
                        <input type="number" inputMode="numeric" min={1} max={600} value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
                    </label>
                    <fieldset>
                        <legend>난이도</legend>
                        {DIFFICULTIES.map((d) => (
                            <label key={d} className={difficulty === d ? "is-selected" : ""}>
                                <input type="radio" name="difficulty" checked={difficulty === d} onChange={() => setDifficulty(d)} />
                                {d}
                            </label>
                        ))}
                    </fieldset>
                </section>

                <section className="rw-card">
                    <h2>재료</h2>
                    <datalist id="rw-ingredient-names">
                        {catalog.map((item) => <option key={item.name} value={item.name} />)}
                    </datalist>
                    {ingredients.map((row, i) => (
                        <div key={row.key} className="rw-row">
                            <input list="rw-ingredient-names" value={row.name} maxLength={30} placeholder="예: 달걀" aria-label={`재료 ${i + 1} 이름`}
                                onChange={(e) => edit(setIngredients, row.key, "name", e.target.value)} />
                            <input className="rw-amount" value={row.amount} maxLength={30} placeholder="예: 2개" aria-label={`재료 ${i + 1} 양`}
                                onChange={(e) => edit(setIngredients, row.key, "amount", e.target.value)} />
                            <button type="button" className="rw-del" aria-label={`재료 ${i + 1} 삭제`} onClick={() => remove(setIngredients, row.key)}>×</button>
                        </div>
                    ))}
                    <button type="button" className="rw-add" onClick={() => setIngredients((list) => [...list, newIngredient()])}>+ 재료 추가</button>
                </section>

                <section className="rw-card">
                    <h2>만드는 순서</h2>
                    {steps.map((row, i) => (
                        <div key={row.key} className="rw-row">
                            <span className="rw-no">{i + 1}</span>
                            <div className="rw-step-body">
                                <textarea value={row.text} maxLength={500} placeholder="이 단계에서 할 일을 적어 주세요" aria-label={`${i + 1}단계`}
                                    onChange={(e) => edit(setSteps, row.key, "text", e.target.value)} />
                                {row.photo ? (
                                    <div className="rw-step-photo">
                                        <img src={row.photo.preview} alt={`${i + 1}단계 사진 미리보기`} />
                                        <button type="button" aria-label={`${i + 1}단계 사진 빼기`} onClick={() => setStepPhoto(row.key, null)}>×</button>
                                    </div>
                                ) : (
                                    <label className="rw-step-attach">
                                        <img src={camera} alt="" />사진 추가
                                        <input type="file" accept="image/jpeg,image/png,image/webp" hidden
                                            onChange={(e) => setStepPhoto(row.key, e.target.files[0])} />
                                    </label>
                                )}
                            </div>
                            <button type="button" className="rw-del" aria-label={`${i + 1}단계 삭제`} onClick={() => removeStep(row.key)}>×</button>
                        </div>
                    ))}
                    <button type="button" className="rw-add" onClick={() => setSteps((list) => [...list, newStep()])}>+ 순서 추가</button>
                </section>

                {error && <p className="review-error" role="alert">{error}</p>}

                <div className="review-actions">
                    <button type="button" className="review-submit" disabled={saving} onClick={save}>
                        {saving ? "저장 중..." : recipe ? "수정 완료" : "레시피 등록"}
                    </button>
                    {recipe && (
                        <button type="button" className="review-submit review-submit--sub" disabled={saving} onClick={removeRecipe}>삭제</button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecipeWrite;
