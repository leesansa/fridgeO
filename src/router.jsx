import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import Fridge from "./pages/Fridge";
import Ingredient from "./pages/Ingredient";
import RecipeList from "./pages/RecipeList";
import RecipeDetail from "./pages/RecipeDetail";
import MyPage from "./pages/MyPage";
import Loading from "./pages/Loading";
import Notification from "./pages/Notification";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element:  <MainPage/>},
      { path: "fridge", element: <Fridge/>},
      { path: "ingredient", element: <Ingredient/> },
      { path: "recipe", element: <RecipeList/> },
      { path: "recipe/:id", element: <RecipeDetail/> },
      { path: "mypage", element: <MyPage/> },
      { path: "notification", element: <Notification/> },
    ],
  },
  { path: "loading", element: <Loading/> },
]);

export default router;
