import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import Fridge from "./pages/Fridge";
import Ingredient from "./pages/Ingredient";
import RecipeList from "./pages/RecipeList";
import RecipeDetail from "./pages/RecipeDetail";
import ReviewWrite from "./pages/ReviewWrite";
import MyPage from "./pages/MyPage";
import Loading from "./pages/Loading";
import Notification from "./pages/Notification";
import IngredientEdit from "./pages/IngredientEdit";

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
      { path: "review", element: <ReviewWrite /> },
      { path: "mypage", element: <MyPage/> },
      { path: "notification", element: <Notification/> },
    ],
  },
  { path: "loading", element: <Loading/> },
]);

export default router;
