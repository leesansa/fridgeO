import chevron from "../../assets/main/chevron.png";
import tofu from "../../assets/main/tofu.jpg";
import eggsPhoto from "../../assets/main/eggs-photo.jpg";

// 화면 출력용 정적 데이터 (Figma 메인페이지_2 기준), 스타일은 MainPage.css
const recommends = [
    { image: tofu, imageWidth: 257, title: "냉장고에 두부가 기다리고있어요", lines: ["맛있는 두부요리는 어떠신가요?", "두부를 이용한 요리법 지금바로 보기"] },
    { image: eggsPhoto, imageWidth: 216, title: "냉장고에 계란이 기다리고있어요", lines: ["신선한 계란 요리는 어떠신가요?", "계란을 이용한 요리법 지금바로 보기"] },
];

const Recommends = () => {
    return (
        <section className="main-section recommend-section">
            <h2 className="section-title recommend-title">주인님을 기다리는 친구들이 있어요!!</h2>
            <div className="recommend-list">
                {recommends.map((recommend) => (
                    <button type="button" className="recommend-card" key={recommend.title}>
                        <span className="recommend-image">
                            <img src={recommend.image} alt="" style={{ width: recommend.imageWidth }} />
                        </span>
                        <span className="recommend-name">{recommend.title}</span>
                        <span className="recommend-desc">
                            {recommend.lines[0]}
                            <br />
                            {recommend.lines[1]}
                        </span>
                        <img className="chevron recommend-chevron" src={chevron} alt="" />
                    </button>
                ))}
            </div>
        </section>
    );
};

export default Recommends;
