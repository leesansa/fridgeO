// 라우트들이 같이 쓰는 요청 도구: 오류 클래스, 본문 읽기, 주소의 숫자 id
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const MAX_BODY = 10_000;

// 본문 원본 바이트 (웹훅 서명 검증은 파싱 전 원본이 필요)
// shortcut: 통째로 읽은 뒤 크기를 검사함 (Content-Length 가 있으면 읽기 전에 거절), 스트리밍 제한이 필요해지면 reader 로 끊을 것
export async function readBody(c, limit = MAX_BODY) {
  if (Number(c.req.header("content-length") ?? 0) > limit) throw new HttpError(413, "요청이 너무 큽니다");
  const buf = Buffer.from(await c.req.arrayBuffer());
  if (buf.length > limit) throw new HttpError(413, "요청이 너무 큽니다");
  return buf;
}

// limit 는 기본 10KB. 프로필 사진·레시피처럼 큰 본문을 받는 곳만 늘려 줌
export async function readJson(c, limit) {
  const raw = (await readBody(c, limit)).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "JSON 형식이 아닙니다");
  }
}

// /api/.../<id>/... 의 :id (1 이상의 정수). 아니면 notFound 메시지로 404
export function idParam(c, notFound) {
  const id = Number(c.req.param("id"));
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, notFound);
  return id;
}
