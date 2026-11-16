// 글자 안의 검색어를 <mark> 로 표시 (대소문자 무시, 여러 번 나와도 모두). 검색어가 없으면 글자 그대로
const Highlight = ({ text, word }) => {
    if (!word || !text) return text;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // split 에 괄호 묶음을 쓰면 홀수 번째 조각이 찾은 검색어
    return text.split(new RegExp(`(${escaped})`, "gi")).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
};

export default Highlight;
