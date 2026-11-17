import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "../utils/auth";

// 켜기/끄기 공통 (북마크·팔로우): 화면을 먼저 바꾸고 request(켤지 여부)로 저장. 실패하면 되돌림. 로그인 안 했으면 로그인 화면으로
// onError(e) 를 넘기면 실패 때 호출 (팔로우는 alert), error 문구는 항상 채움
export function useToggleRequest(initial, request, onError) {
  const navigate = useNavigate();
  const [on, setOn] = useState(initial);
  const [saving, setSaving] = useState(false); // 저장 중 연타하면 요청 순서가 꼬이니 잠금
  const [error, setError] = useState("");
  const { data: session } = authClient.useSession();

  const toggle = async () => {
    if (!session?.session) {
      navigate("/login");
      return;
    }
    const next = !on;
    setOn(next);
    setSaving(true);
    setError("");
    try {
      await request(next);
    } catch (e) {
      setOn(!next);
      setError(e.message);
      onError?.(e);
    } finally {
      setSaving(false);
    }
  };

  return { on, saving, error, toggle };
}
