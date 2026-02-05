import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

// 메인 페이지 (나중에 별도 파일로 분리 권장)
const MainPage = () => (
    <div className="h-screen flex items-center justify-center bg-[#ece0d1]">
        <h2 className="text-4xl font-bold">나눔 메인 화면</h2>
    </div>
);

function App() {
    return (
        // ⭐️ 1. 최상단에서 장바구니 상태를 관리합니다.
        <CartProvider>
            <BrowserRouter>
                <div className="min-h-screen flex flex-col font-sans select-none">
                    <Header />

                    <main className="flex-grow">
                        <Routes>
                            {/* 메인 리다이렉트 */}
                            <Route path="/" element={<Navigate to="/shop/main" replace />} />


                            <Route path="/shop">
                                <Route path="main" element={<MainPage />} />
                                <Route path="products" element={<ProductList />} />
                                <Route path="product/:id" element={<ProductDetail />} />
                                <Route path="login" element={<Login />} />
                                <Route path="signup" element={<Signup />} />
                                <Route path="terms" element={<Terms />} />
                                <Route path="privacy" element={<Privacy />} />
                            </Route>

                            <Route
                                path="/shop/cart"
                                element={
                                    <PrivateRoute>
                                        <Cart />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/shop/checkout"
                                element={
                                    <PrivateRoute>
                                        <Checkout />
                                    </PrivateRoute>
                                }
                            />

                            {/* 404 예외 처리 */}
                            <Route path="*" element={<Navigate to="/shop/main" replace />} />
                        </Routes>
                    </main>

                    <Footer />
                </div>
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;