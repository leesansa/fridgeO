// 레시피 제목·작성자·요리 정보(시간·인분·난이도) + 소개글
const DetailInfo = ({ recipe }) => {
    const tags = [
        recipe.cook_time && `${recipe.cook_time}분`,
        recipe.servings && `${recipe.servings}인분`,
        recipe.difficulty,
    ].filter(Boolean);

    return (
        <>
            <section className="detail-card">
                <h1 className="detail-title">{recipe.title}</h1>
                <p className="detail-author">{recipe.author ?? "알 수 없음"}</p>
                {tags.length > 0 && (
                    <ul className="detail-tags" aria-label="요리 정보">
                        {tags.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                )}
            </section>

            {recipe.description && (
                <section className="detail-card">
                    <p className="detail-intro">{recipe.description}</p>
                </section>
            )}
        </>
    );
};

export default DetailInfo;
