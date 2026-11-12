import { useRef, useState } from "react";
import { apiFetch } from "../../utils/auth";

const AVATAR_PX = 160; // 프로필 사진 저장 크기 (화면에는 72px, 선명하게 2배 남짓)

// 고른 사진을 가운데 기준 정사각형으로 잘라 160px JPEG data URL 로 줄임 (서버에 보낼 크기를 10KB 안팎으로)
async function toAvatarDataUrl(file) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = AVATAR_PX;
  canvas.getContext("2d").drawImage(
    bitmap,
    (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side,
    0, 0, AVATAR_PX, AVATAR_PX,
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

// 프로필 카드: 사과(프로필)를 누르면 사진 고르기 → 줄여서 DB 에 저장. 사진이 없으면 계속 🍏
const ProfileCard = ({ me, onImageSaved }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handlePhoto = async (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // 같은 사진을 다시 골라도 onChange 가 오도록
    if (!file) return;
    setUploading(true);
    try {
      const profileImage = await toAvatarDataUrl(file);
      const saved = await apiFetch("/api/me", { method: "PATCH", body: { profileImage } });
      onImageSaved(saved.profile_image_url);
    } catch (e) {
      alert(`프로필 사진을 바꾸지 못했어요. ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mypage-card mypage-profile">
      <button
        type="button"
        className={`mypage-avatar${uploading ? " is-uploading" : ""}`}
        aria-label={uploading ? "프로필 사진 저장 중" : "프로필 사진 바꾸기"}
        disabled={!me || uploading}
        onClick={() => fileRef.current.click()}
      >
        {me?.profile_image_url
          ? <img src={me.profile_image_url} alt="" className="mypage-avatar-img" />
          : <span aria-hidden="true">🍏</span>}
        <span className="mypage-avatar-badge" aria-hidden="true">✎</span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
      <div>
        <div className="mypage-profile-name">{me ? `${me.name} 님` : " "}</div>
        <div className="mypage-profile-sub">오늘도 냉장고를 비워볼까요?</div>
      </div>
    </div>
  );
};

export default ProfileCard;
