import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useCategories, useCreateRecipe, useDeleteRecipe, useRecipe, useUpdateRecipe } from "../queries/recipes";
import { useIngredientCatalog } from "../queries/ingredients";
import { uploadImage } from "../api/images";

// 레시피 작성·수정 화면 상태 (모바일·데스크탑 공통). 화면 모양만 pages/{mobile,desktop}/RecipeWrite.jsx 가 그림
export const DIFFICULTIES = ["쉬움", "보통", "어려움"];

// 재료·순서 줄마다 고유 key (지우고 추가해도 입력칸이 섞이지 않게)
let nextKey = 1;
const newIngredient = () => ({ key: nextKey++, name: "", amount: "" });
const newStep = () => ({ key: nextKey++, text: "", photo: null });

// 사진 = { file, preview }. 새로 고른 사진은 file 이 있고 preview 는 임시 주소, 이미 저장된 사진은 file 없이 preview = 저장된 주소
const savedPhoto = (url) => (url ? { file: null, preview: url } : null);
const release = (p) => p?.file && URL.revokeObjectURL(p.preview); // 임시 주소만 메모리에서 해제
const toPhoto = (file) => (file ? { file, preview: URL.createObjectURL(file) } : null);

// /recipe/:id/edit 에서 고칠 레시피 (내 것만). id 가 없으면(새로 작성) 아무것도 안 받음
// 상세와 같은 캐시를 써서 상세에서 "수정"을 누르면 바로 채워짐
export function useEditableRecipe(id) {
  const { data, error } = useRecipe(id);
  if (error) return { recipe: null, error: error.message };
  if (data && !data.mine) return { recipe: null, error: "내가 쓴 레시피만 수정할 수 있어요" };
  return { recipe: data ?? null, error: "" };
}

// recipe 가 있으면 그 내용으로 채워서 수정, 없으면 새로 작성. 레시피가 바뀌면 부모가 key 로 새로 만듦
// 사진은 저장 버튼을 누를 때 R2 에 올림 (작성 중 나가면 안 올라감)
export function useRecipeForm(recipe) {
  const navigate = useNavigate();
  const catalog = useIngredientCatalog(); // 재료 이름 자동완성
  const categories = useCategories().data ?? []; // 실패하면 분류 없이 저장
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
  const [saving, setSaving] = useState(false); // 사진 올리기부터 저장까지 (사진 올리는 동안도 잠금)
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const deleteRecipe = useDeleteRecipe();

  // 미리보기 주소는 사진을 바꾸거나 화면을 나갈 때 메모리에서 해제
  useEffect(() => () => release(photo), [photo]);
  const stepsRef = useRef(steps);
  useEffect(() => { stepsRef.current = steps; });
  useEffect(() => () => stepsRef.current.forEach((row) => release(row.photo)), []);

  const pickPhoto = (file) => setPhoto(toPhoto(file));

  // 목록의 key 번째 줄의 field 값을 바꿈 / 한 줄은 남기고 지움
  const edit = (setList, key, field, value) =>
    setList((list) => list.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  const drop = (setList, key) => setList((list) => (list.length > 1 ? list.filter((row) => row.key !== key) : list));

  const editIngredient = (key, field, value) => edit(setIngredients, key, field, value);
  const addIngredient = () => setIngredients((list) => [...list, newIngredient()]);
  const removeIngredient = (key) => drop(setIngredients, key);

  const editStep = (key, text) => edit(setSteps, key, "text", text);
  const addStep = () => setSteps((list) => [...list, newStep()]);
  // 단계 사진 고르기·빼기 (file 이 없으면 뺌). 이전 미리보기 주소는 해제
  const setStepPhoto = (key, file) => {
    release(steps.find((row) => row.key === key)?.photo);
    edit(setSteps, key, "photo", toPhoto(file));
  };
  const removeStep = (key) => {
    const row = steps.find((s) => s.key === key);
    if (steps.length > 1) release(row.photo);
    drop(setSteps, key);
  };

  // 내 레시피 삭제 (작성자 확인은 서버). 지우면 되돌릴 수 없어 한 번 더 묻고, 끝나면 레시피 목록으로
  const removeRecipe = async () => {
    if (!window.confirm("이 레시피를 삭제할까요? 리뷰와 북마크도 함께 지워지고 되돌릴 수 없어요.")) return;
    setSaving(true);
    setError("");
    try {
      await deleteRecipe.mutateAsync(recipe.id);
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
      const body = {
        title, description, categoryId, servings, cookTime, difficulty, imageUrl,
        ingredients: filledIngredients,
        steps: filledSteps.map((row, i) => ({ text: row.text, imageUrl: stepImages[i] })),
      };
      const { id } = await (recipe ? updateRecipe.mutateAsync({ id: recipe.id, body }) : createRecipe.mutateAsync(body));
      navigate(`/recipe/${id}`, { replace: true });
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return {
    catalog, categories,
    title, setTitle, description, setDescription, categoryId, setCategoryId,
    servings, setServings, cookTime, setCookTime, difficulty, setDifficulty,
    photo, pickPhoto,
    ingredients, editIngredient, addIngredient, removeIngredient,
    steps, editStep, addStep, removeStep, setStepPhoto,
    error, saving, save, removeRecipe,
  };
}
