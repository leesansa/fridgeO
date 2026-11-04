import { Outlet } from "react-router";
import Navigation from "./Navigation";

const Layout = () => {
    return <>
    <Outlet/>
    <Navigation/>
    </>
};

export default Layout;