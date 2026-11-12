// 만드는 순서 (DB recipe_steps): 단계 사진 + 번호 + 설명
const RecipeSteps = ({ steps }) => (
    <section className="detail-card" aria-label="만드는 순서">
        <h2>만드는 순서</h2>
        <ol className="detail-steps">
            {steps.map((step) => (
                <li key={step.position} className="detail-step">
                    <div className="detail-step-photo">
                        {step.image_url && <img src={step.image_url} alt={`${step.position}단계 사진`} loading="lazy" referrerPolicy="no-referrer" />}
                        <span className="detail-step-no" aria-hidden="true">{step.position}</span>
                    </div>
                    <p>{step.text}</p>
                </li>
            ))}
        </ol>
    </section>
);

export default RecipeSteps;
