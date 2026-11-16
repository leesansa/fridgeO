import { createBrowserRouter, redirect } from "react-router";
import { isLoggedIn } from "./utils/auth";
import Layout from "./components/Layout";
import MainPage from "./pages/mobile/MainPage";
import Responsive from "./pages/Responsive";
import Fridge from "./pages/mobile/Fridge";
import DesktopFridge from "./pages/desktop/Fridge";
import DesktopRecipeList from "./pages/desktop/RecipeList";
import DesktopRecipeDetail from "./pages/desktop/RecipeDetail";
import DesktopMyPage from "./pages/desktop/MyPage";
import DesktopReviewWrite from "./pages/desktop/ReviewWrite";
import DesktopRecipeWrite from "./pages/desktop/RecipeWrite";
import DesktopIngredient from "./pages/desktop/Ingredient";
import DesktopIngredientEdit from "./pages/desktop/IngredientEdit";
import DesktopNotification from "./pages/desktop/Notification";
import DesktopSearch from "./pages/desktop/Search";
import DesktopBookMark from "./pages/desktop/BookMark";
import DesktopPrivacyInfo from "./pages/desktop/PrivacyInfo";
import DesktopSettings from "./pages/desktop/Settings";
import DesktopLogin from "./pages/desktop/Login";
import DesktopSignUp from "./pages/desktop/SignUp";
import DesktopFindAccount from "./pages/desktop/FindAccount";
import Ingredient from "./pages/mobile/Ingredient";
import RecipeList from "./pages/mobile/RecipeList";
import RecipeDetail from "./pages/mobile/RecipeDetail";
import RecipeWrite from "./pages/mobile/RecipeWrite";
import ReviewWrite from "./pages/mobile/ReviewWrite";
import MyPage from "./pages/mobile/MyPage";
import BookMark from "./pages/mobile/BookMark";
import PrivacyInfo from "./pages/mobile/PrivacyInfo";
import Settings from "./pages/mobile/Settings";
import Search from "./components/mobile/Search";
import Loading from "./pages/mobile/Loading";
import Notification from "./pages/mobile/Notification";
import IngredientEdit from "./pages/mobile/IngredientEdit";
import Login from "./pages/mobile/Login";
import Find_ID_Password from "./pages/mobile/Find_ID_Password";
import SignUp from "./pages/mobile/Sign_up";

// 로그인 안 했으면 로그인 화면으로 (버튼 클릭, 주소 직접 입력 모두)
const requireLogin = async () => ((await isLoggedIn()) ? null : redirect("/login"));
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element:  <MainPage/>},
      // 내 냉장고 재료는 로그인한 사용자 것만 보여 주므로 로그인 필요
      // 냉장고·재료 등록/편집·레시피 목록·레시피 상세·리뷰 작성·레시피 작성/수정·마이페이지·개인정보·알림 설정·북마크·알림·통합 검색·로그인·회원가입·계정 찾기는 화면 폭에 따라 모바일/데스크탑 화면 (pages/Responsive)
      { path: "fridge", element: <Responsive mobile={Fridge} desktop={DesktopFridge}/>, loader: requireLogin },
      { path: "ingredient", element: <Responsive mobile={Ingredient} desktop={DesktopIngredient}/>, loader: requireLogin },
      { path: "ingredient/edit/:id", element: <Responsive mobile={IngredientEdit} desktop={DesktopIngredientEdit}/>, loader: requireLogin },
      { path: "recipe", element: <Responsive mobile={RecipeList} desktop={DesktopRecipeList}/> },
      // 레시피 작성: 작성자 이름으로 DB(recipes)에 저장되므로 로그인 필요
      { path: "recipe/new", element: <Responsive mobile={RecipeWrite} desktop={DesktopRecipeWrite}/>, loader: requireLogin },
      { path: "recipe/:id", element: <Responsive mobile={RecipeDetail} desktop={DesktopRecipeDetail}/> },
      // 레시피 수정: 내가 쓴 레시피인지는 화면과 서버(PUT)에서 계정으로 확인
      { path: "recipe/:id/edit", element: <Responsive mobile={RecipeWrite} desktop={DesktopRecipeWrite}/>, loader: requireLogin },
      // 리뷰는 로그인한 사용자 이름으로 DB(reviews)에 저장되므로 로그인 필요
      { path: "recipe/:id/review", element: <Responsive mobile={ReviewWrite} desktop={DesktopReviewWrite}/>, loader: requireLogin },
      { path: "mypage", element: <Responsive mobile={MyPage} desktop={DesktopMyPage}/>, loader: requireLogin },
      // 내 북마크 목록 (DB recipe_bookmarks)
      { path: "bookmark", element: <Responsive mobile={BookMark} desktop={DesktopBookMark}/>, loader: requireLogin },
      // 개인정보 관리: 들어온 뒤 비밀번호를 한 번 더 확인
      { path: "mypage/privacy", element: <Responsive mobile={PrivacyInfo} desktop={DesktopPrivacyInfo}/>, loader: requireLogin },
      { path: "mypage/settings", element: <Responsive mobile={Settings} desktop={DesktopSettings}/>, loader: requireLogin },
      // 통합 검색: 레시피는 누구나, 내 냉장고 재료는 로그인했을 때만 함께 보여 줌
      { path: "search", element: <Responsive mobile={Search} desktop={DesktopSearch}/> },
      { path: "notification", element: <Responsive mobile={Notification} desktop={DesktopNotification}/> },
      { path: "login", element: <Responsive mobile={Login} desktop={DesktopLogin}/> },
      { path: "signup", element: <Responsive mobile={SignUp} desktop={DesktopSignUp}/> },
      { path: "find-id-password", element: <Responsive mobile={Find_ID_Password} desktop={DesktopFindAccount}/> },
    ],
  },
  { path: "loading", element: <Loading/> },
]);

export default router;
