import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    const location = useLocation(); // ⭐️ 현재 사용자가 가려던 주소를 가져옵니다.
    const hasAlerted = useRef(false);

    useEffect(() => {
        if (!user && !hasAlerted.current) {
            alert('로그인이 필요한 서비스입니다.');
            hasAlerted.current = true;
        }
    }, [user]);

    if (!user) {
        // ⭐️ state 속성에 현재 경로(pathname)를 담아서 보냅니다.
        return <Navigate to="/shop/login" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default PrivateRoute;