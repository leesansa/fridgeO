import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient, authErrorMessage, getSession, PHONE_FORMAT_MESSAGE, toE164 } from "../utils/auth";
import { getMe } from "../api/me";
import { useUpdateMe } from "../queries/me";

// 개인정보 관리 (모바일·데스크탑 공통): 비밀번호를 다시 확인한 뒤에만 내 정보를 보여 준다 (화면을 나가면 다시 확인)
// 닉네임은 바로, 휴대폰은 새 번호로 받은 인증번호를 확인한 뒤 바꾼다. message = 실패·안내 문구 (ok 면 성공 안내)
export function usePrivacyInfo() {
  const navigate = useNavigate();
  const updateMe = useUpdateMe(); // 닉네임 저장 → 마이페이지의 내 정보도 다시 받음
  const [user, setUser] = useState(null); // 확인 전 null. 확인 후 Neon Auth 계정 + nickname(앱 프로필)
  const [message, setMessage] = useState({ text: "", ok: false });
  const [pending, setPending] = useState(false);
  const [codeSent, setCodeSent] = useState(false); // 인증번호를 보낸 뒤에만 입력 줄 표시

  const fail = (text) => setMessage({ text, ok: false });
  const done = (text) => setMessage({ text, ok: true });

  // 요청 중 버튼 잠금 + 실패 문구 표시 (회원가입과 같은 방식)
  const run = async (action) => {
    setMessage({ text: "", ok: false });
    setPending(true);
    try {
      await action();
    } catch (err) {
      fail(authErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  // 같은 이메일로 다시 로그인해 비밀번호가 맞는지 확인 (틀리면 예외)
  const verify = async (password) => {
    setMessage({ text: "", ok: false });
    setPending(true);
    try {
      const email = (await getSession())?.user.email;
      if (!email) return navigate("/login");
      await authClient.signIn.email({ email, password });
      const me = await getMe().catch(() => null); // 프로필이 아직 없으면 빈 칸
      setUser({ ...(await getSession()).user, nickname: me?.name ?? "" });
    } catch (err) {
      fail(err?.error?.code === "INVALID_EMAIL_OR_PASSWORD" ? "비밀번호가 올바르지 않습니다." : authErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const changeNickname = (name) => run(async () => {
    const saved = await updateMe.mutateAsync({ name: name.trim() });
    setUser((u) => ({ ...u, nickname: saved.name }));
    done("닉네임을 변경했습니다.");
  });

  const sendCode = (phone) => {
    const phoneNumber = toE164(phone);
    if (!phoneNumber) return fail(PHONE_FORMAT_MESSAGE);
    if (phoneNumber === user.phoneNumber) return fail("지금 등록된 번호와 같습니다.");
    return run(async () => {
      await authClient.phoneNumber.sendOtp({ phoneNumber });
      setCodeSent(true);
      done("인증번호를 보냈습니다. 5분 안에 입력해 주세요.");
    });
  };

  // 인증번호가 맞으면 Neon Auth 가 계정의 번호를 새 번호로 바꾼다
  const changePhone = (phone, code) => {
    const phoneNumber = toE164(phone);
    if (!phoneNumber) return fail(PHONE_FORMAT_MESSAGE);
    return run(async () => {
      await authClient.phoneNumber.verify({ phoneNumber, code: code.trim(), updatePhoneNumber: true });
      setUser((u) => ({ ...u, phoneNumber }));
      setCodeSent(false);
      done("휴대폰 번호를 변경했습니다.");
    });
  };

  return { user, message, pending, codeSent, verify, changeNickname, sendCode, changePhone };
}
