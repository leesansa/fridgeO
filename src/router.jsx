import { createBrowserRouter, redirect } from "react-router";
import { isLoggedIn } from "./utils/auth";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import Fridge from "./pages/Fridge";
import Ingredient from "./pages/Ingredient";
import RecipeList from "./pages/RecipeList";
import RecipeDetail from "./pages/RecipeDetail";
import MyPage from "./pages/MyPage";
import Loading from "./pages/Loading";
import Notification from "./pages/Notification";
import IngredientEdit from "./pages/IngredientEdit";
import Login from "./pages/Login";
import Find_ID_Password from "./pages/Find_ID_Password";
import SignUp from "./pages/Sign_up";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element:  <MainPage/>},
      { path: "fridge", element: <Fridge/>},
      { path: "ingredient", element: <Ingredient/> },
      { path: "ingredient/edit/:id", element: <IngredientEdit /> },
      { path: "recipe", element: <RecipeList/> },
      { path: "recipe/:id", element: <RecipeDetail/> },
      // 로그인 안 했으면 마이페이지 대신 로그인 화면으로 (하단 바 클릭, 주소 직접 입력 모두)
      { path: "mypage", element: <MyPage/>, loader: async () => ((await isLoggedIn()) ? null : redirect("/login")) },
      { path: "notification", element: <Notification/> },
      { path: "login", element: <Login/> },
      { path: "signup", element: <SignUp/> },
      { path: "find-id-password", element: <Find_ID_Password/> },
    ],
  },
  { path: "loading", element: <Loading/> },
]);

export default router;
