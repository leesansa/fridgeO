import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import Navigation from "./Navigation";
import Loading from "../pages/Loading";

// shortcut: 실제로 불러올 데이터가 없어 고정 시간만 보여줌, 데이터 로딩이 생기면 그 완료 시점으로 교체
const LOADING_MS = 2000;

const Layout = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), LOADING_MS);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <Loading />;

    return <>
    <Outlet/>
    <Navigation/>
    </>
};

export default Layout;
