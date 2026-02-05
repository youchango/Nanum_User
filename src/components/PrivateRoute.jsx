// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const user = localStorage.getItem('user');

    // 유저 정보가 없으면 알림을 띄우고 로그인으로 보냅니다.
    if (!user) {
        alert('로그인이 필요한 서비스입니다.');
        return <Navigate to="/shop/login" replace />;
    }

    return children;
};

export default PrivateRoute;