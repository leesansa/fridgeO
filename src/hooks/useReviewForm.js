import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getRecipe } from "../api/recipes";
import { deleteMyReview, getMyReview, saveMyReview } from "../api/reviews";

// 직접 먹어 본 맛 평가 (화면에서만 고름, 저장 안 됨)
export const TASTES = ["맛있어요", "보통이예요", "생각보다 별로예요"];

// 리뷰 작성 화면 상태 (모바일·데스크탑 공통): 이 레시피에 대한 내 리뷰를 DB(reviews)에 작성·수정·삭제
// shortcut: reviews 테이블에 맛 평가·사진 칸이 없어 taste·photo 는 화면에서만 (저장 안 됨), 저장하려면 reviews 에 컬럼과 파일 저장 추가
export function useReviewForm(id) {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [mine, setMine] = useState(null); // DB에 저장된 내 리뷰 (없으면 null)
  const [rating, setRating] = useState(5); // 디자인처럼 처음엔 별 5개
  const [taste, setTaste] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState(""); // 첨부 사진 미리보기용 임시 주소

  // 레시피 정보 + 이미 쓴 리뷰가 있으면 불러와서 채워 둠
  useEffect(() => {
    let ignore = false;
    Promise.all([getRecipe(id), getMyReview(id)])
      .then(([recipeData, review]) => {
        if (ignore) return;
        setRecipe(recipeData);
        setMine(review);
        if (review) {
          setRating(review.rating);
          setText(review.comment ?? "");
        }
      })
      .catch((e) => !ignore && setError(e.message));
    return () => { ignore = true; };
  }, [id]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await saveMyReview(id, { rating, comment: text });
      navigate(`/recipe/${id}`, { replace: true }); // 상세로 돌아가면 리뷰 수·평균이 새로 반영됨
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  // 저장된 리뷰가 있으면 DB에서 지우고, 없으면 쓰던 내용만 처음 상태로
  const remove = async () => {
    if (!window.confirm(mine ? "저장된 리뷰를 삭제할까요?" : "작성한 내용을 지울까요?")) return;
    setError("");
    try {
      if (mine) await deleteMyReview(id);
      setMine(null);
      setRating(5);
      setTaste("");
      setText("");
      if (photo) URL.revokeObjectURL(photo);
      setPhoto("");
    } catch (e) {
      setError(e.message);
    }
  };

  // 사진 고르면 미리보기 주소를 만들고, 이전 주소는 메모리에서 해제 (<input type="file"> onChange)
  const attach = (e) => {
    const file = e.target.files[0];
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(file ? URL.createObjectURL(file) : "");
  };

  return { recipe, mine, rating, setRating, taste, setTaste, text, setText, error, saving, photo, attach, save, remove };
}
