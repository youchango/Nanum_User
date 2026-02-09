import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Main from './pages/Main'; // ⭐️ 이미 분리된 Main 컴포넌트
import Header from './components/Header';
import Footer from './components/Footer';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cart from './pages/Cart';
import { CartProvider } from './context/CartContext';
import PrivateRoute from "./components/PrivateRoute.jsx";
import NoticeList from "./pages/NoticeList.jsx";
import NoticeDetail from "./pages/NoticeDetail.jsx";
import MyPageEdit from "./pages/MyPageEdit.jsx";
import Withdrawal from "./pages/Withdrawal.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import OrderList from "./pages/OrderList.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";

// ⭐️ 실제 레이아웃을 담당하는 컴포넌트
const LayoutContent = ({ children }) => {
    const location = useLocation();

    // 메인 페이지 여부 확인 (경로에 따라 / 또는 /shop/main)
    const isMainPage = location.pathname === '/shop/main' || location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col font-sans select-none">
            {/* 공통 헤더 */}
            <Header />

            {/* ⭐️ 메인이면 여백 0 (pt-0), 일반 페이지면 헤더 높이만큼 띄움 */}
            {/* flex-1을 주어 컨텐츠가 적어도 Footer가 항상 하단에 위치하게 합니다. */}
            <main className={`flex-1 ${isMainPage ? "pt-0" : "pt-[60px] md:pt-[76px]"}`}>
                {children}
            </main>

            {/* 공통 푸터 */}
            <Footer />
        </div>
    );
};

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                {/* ⭐️ 모든 Route를 LayoutContent로 감싸서 중앙 제어 */}
                <LayoutContent>
                    <Routes>
                        {/* 1. 기본 리다이렉트 */}
                        <Route path="/" element={<Navigate to="/shop/main" replace />} />

                        {/* 2. 쇼핑 관련 모든 라우트 그룹 */}
                        <Route path="/shop">
                            {/* ⭐️ MainPage 대신 위에서 import한 Main 컴포넌트를 사용합니다. */}
                            <Route path="main" element={<Main />} />
                            <Route path="products" element={<ProductList />} />
                            <Route path="product/:id" element={<ProductDetail />} />
                            <Route path="login" element={<Login />} />
                            <Route path="signup" element={<Signup />} />
                            <Route path="terms" element={<Terms />} />
                            <Route path="privacy" element={<Privacy />} />
                            <Route path="notice" element={<NoticeList />} />
                            <Route path="notice/:id" element={<NoticeDetail />} />

                            {/* --- 로그인(PrivateRoute)이 필요한 페이지들 --- */}
                            <Route path="cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                            <Route path="checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                            <Route path="orders" element={<PrivateRoute><OrderList /></PrivateRoute>} />

                            <Route path="mypage">
                                {/* /shop/mypage 로 들어오면 주문조회로 리다이렉트 */}
                                <Route index element={<Navigate to="orders" replace />} />
                                <Route path="order/:orderId" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
                                <Route path="orders" element={<PrivateRoute><OrderList /></PrivateRoute>} />
                                <Route path="edit" element={<PrivateRoute><MyPageEdit /></PrivateRoute>} />
                                <Route path="wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
                                <Route path="withdrawal" element={<PrivateRoute><Withdrawal /></PrivateRoute>} />
                            </Route>
                        </Route>

                        {/* 3. 예외 처리 (404) */}
                        <Route path="*" element={<Navigate to="/shop/main" replace />} />
                    </Routes>
                </LayoutContent>
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;