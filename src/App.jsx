import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';


// 메인 화면을 별도의 컴포넌트로 분리하거나 아래처럼 정의합니다.
const MainHome = () => {
    return (
        <section className="h-screen w-full flex flex-col items-center justify-center bg-[#ece0d1] flex-shrink-0 relative overflow-hidden">
            <div className="text-center z-10">
                <h2 className="text-[40px] md:text-[56px] font-bold text-[#343434] leading-tight mb-6">
                    메인화면
                </h2>
            </div>
        </section>
    );
};
function App() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <Header />

                <main className="flex-grow">
                    <Routes>
                        {/* 1. 홈 화면 */}
                        <Route path="/" element={<MainHome />} />
                        {/* 2. 전체 상품 페이지 */}
                        <Route path="/shop/products" element={<ProductList />} />
                        {/* 3. 상품 상세 페이지 */}
                        <Route path="/shop/product/:id" element={<ProductDetail />} />
                        {/* 4. 결제 페이지 */}
                        <Route path="/shop/checkout" element={<Checkout />} />
                        {/* 5. 로그인 페이지 */}
                        <Route path="/shop/login" element={<Login />} />
                        {/* 6. 회원가입 페이지 */}
                        <Route path="/signup" element={<Signup />} />
                        {/* 7. 이용약관,개인정보취급방침 */}
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                    </Routes>
                </main>

                <Footer />
            </div>
        </Router>
    );
}

export default App;