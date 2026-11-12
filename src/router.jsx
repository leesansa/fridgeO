import { createBrowserRouter, redirect } from "react-router";
import { isLoggedIn } from "./utils/auth";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import Fridge from "./pages/Fridge";
import Ingredient from "./pages/Ingredient";
import RecipeList from "./pages/RecipeList";
import RecipeDetail from "./pages/RecipeDetail";
import ReviewWrite from "./pages/ReviewWrite";
import MyPage from "./pages/MyPage";
import PrivacyInfo from "./pages/PrivacyInfo";
import Loading from "./pages/Loading";
import Notification from "./pages/Notification";
import IngredientEdit from "./pages/IngredientEdit";
import Login from "./pages/Login";
import Find_ID_Password from "./pages/Find_ID_Password";
import SignUp from "./pages/Sign_up";

// 로그인 안 했으면 로그인 화면으로 (버튼 클릭, 주소 직접 입력 모두)
const requireLogin = async () => ((await isLoggedIn()) ? null : redirect("/login"));

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element:  <MainPage/>},
      // 내 냉장고 재료는 로그인한 사용자 것만 보여 주므로 로그인 필요
      { path: "fridge", element: <Fridge/>, loader: requireLogin },
      { path: "ingredient", element: <Ingredient/>, loader: requireLogin },
      { path: "ingredient/edit/:id", element: <IngredientEdit />, loader: requireLogin },
      { path: "recipe", element: <RecipeList/> },
      { path: "recipe/:id", element: <RecipeDetail/> },
      // 리뷰는 로그인한 사용자 이름으로 DB(reviews)에 저장되므로 로그인 필요
      { path: "recipe/:id/review", element: <ReviewWrite />, loader: requireLogin },
      { path: "mypage", element: <MyPage/>, loader: requireLogin },
      // 개인정보 관리: 들어온 뒤 비밀번호를 한 번 더 확인
      { path: "mypage/privacy", element: <PrivacyInfo/>, loader: requireLogin },
      { path: "notification", element: <Notification/> },
      { path: "login", element: <Login/> },
      { path: "signup", element: <SignUp/> },
      { path: "find-id-password", element: <Find_ID_Password/> },
    ],
  },
  { path: "loading", element: <Loading/> },
]);

export default router;
