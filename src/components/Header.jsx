import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount } = useCart();

    const [user, setUser] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (userData && token) {
            // JWT 만료 체크 (토큰의 payload에서 exp 추출)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    // 토큰 만료 → 로그아웃 처리
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    setUser(null);
                    return;
                }
            } catch (e) {
                // 토큰 파싱 실패 → 무시 (API 호출 시 처리됨)
            }
            setUser(JSON.parse(userData));
        } else {
            setUser(null);
        }
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/shop/login');
    };

    const menus = [
        { title: '나눔 컬렉션', url: '/shop/products', sub: [{ name: '이달의 추천', url: '/shop/products' }, { name: '위시리스트', url: '/shop/mypage/wishlist' }] },
        { title: '전체 상품', url: '/shop/products', sub: [{ name: '전체 보기', url: '/shop/products' }, { name: '신상품', url: '/shop/products' }] },
        { title: '소식과 안내', url: '/shop/notice', sub: [{ name: '공지사항', url: '/shop/notice' }, { name: '브랜드 이야기', url: '/shop/main' }] },
        { title: '나의 기록', url: '/shop/mypage', sub: [{ name: '주문/배송 조회', url: '/shop/mypage/orders' }, { name: '1:1 문의', url: '/shop/mypage/inquiries' }, { name: '마이페이지', url: '/shop/mypage/edit' }] }
    ];

    return (
        <>
            <header
                /* ⭐️ [수정] transition-all을 transition-none으로 바꾸거나 duration을 0으로 만들어 잔상 제거 */
                className={`fixed top-0 left-0 w-full z-[9999] select-none ${
                    isScrolled || isHovered || isMobileMenuOpen ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
                style={{
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    /* 배경색만은 즉시 바뀌도록 강제(필요시) */
                    transition: isScrolled ? 'none' : 'background-color 0.3s ease-in-out'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={`w-full border-b transition-colors duration-300 ${
                    isScrolled || isHovered || isMobileMenuOpen ? 'border-gray-200' : 'border-transparent'
                }`}>
                    <div className="max-w-[1290px] mx-auto px-4 relative flex items-center justify-between h-[60px] md:h-[76px] z-[10001]">

                        <Link to="/shop/main" className="outline-none shrink-0 ml-3">
                            <img src="/images/shop/index/header_logo2.png" alt="Nanum 로고" className="h-6 md:h-8 object-contain" />
                        </Link>

                        {/* PC 메뉴 영역 */}
                        <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 h-full">
                            {menus.map((menu, idx) => (
                                <div key={idx} className={`h-full flex items-center transition-all duration-500 ease-in-out ${isHovered ? 'px-8 lg:px-10' : 'px-6 lg:px-8'}`}>
                                    <div className="relative group py-2">
                                        <Link to={menu.url} className="text-[15px] font-medium text-[#343434] hover:text-[#968064] transition-all whitespace-nowrap">{menu.title}</Link>

                                        {/* ⭐️ 서브메뉴: 개별 박스가 아닌 전체를 덮는 메가메뉴 스타일로 위치 조정 */}
                                        <div className={`absolute top-[52px] md:top-[60px] left-1/2 -translate-x-1/2 w-full transition-all duration-300 z-[100] ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                            <ul className="py-6 flex flex-col items-center gap-3">
                                                {menu.sub.map((subItem, sIdx) => (
                                                    <li key={sIdx}>
                                                        <Link to={subItem.url} className="text-[13px] text-[#666] hover:text-[#968064] block whitespace-nowrap transition-colors">{subItem.name}</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2 md:gap-4 relative z-[10001]">
                            <div className="hidden md:flex items-center gap-4 text-[13px]">
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <Link to="/shop/mypage/edit" className="text-[#343434] font-medium hover:text-[#968064] group">
                                            <span className="text-[#968064] font-bold border-b border-transparent group-hover:border-[#968064]">{user.memberName}</span> 님
                                        </Link>
                                        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition-colors">로그아웃</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <Link to="/shop/login" className="bg-[#968064] text-white px-4 py-1.5 rounded-full hover:bg-[#7d6b54] transition-colors font-medium">로그인</Link>
                                        <Link to="/shop/signup" className="text-[#343434] hover:text-[#968064] font-medium transition-colors">회원가입</Link>
                                    </div>
                                )}
                            </div>

                            <Link to="/shop/cart" className="p-2 group relative flex items-center justify-center outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#343434] opacity-70 group-hover:opacity-100 group-hover:text-[#968064] transition-all">
                                    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.1-5.38a1 1 0 0 0-1-1.2H6.14" />
                                </svg>
                                {cartCount > 0 && <span className="absolute top-0 right-0 bg-[#E23600] text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-1">{cartCount}</span>}
                            </Link>

                            <button className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                <span className={`w-6 h-0.5 bg-[#343434] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                                <span className={`w-6 h-0.5 bg-[#343434] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                                <span className={`w-6 h-0.5 bg-[#343434] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ⭐️ PC 메가메뉴 배경 (이미지의 하얀색 가로 바 부분) */}
                <div className={`hidden md:block absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg -z-10 transition-all duration-300 ${isHovered ? 'h-[180px] opacity-100' : 'h-0 opacity-0 invisible'}`} />
            </header>

            {/* 모바일 메뉴 레이어 (헤더 외부에 분리 배치) */}
            <div className={`fixed inset-0 bg-white z-[9998] transition-transform duration-500 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="pt-24 px-6 h-full overflow-y-auto pb-10 overscroll-contain bg-white">
                    <div className="mb-8 pb-6 border-b">
                        {user ? (
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-bold"><span className="text-[#968064]">{user.memberName}</span>님</p>
                                    <button onClick={handleLogout} className="text-sm text-gray-400 underline underline-offset-4">로그아웃</button>
                                </div>
                                <Link to="/shop/cart" className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#343434]"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.1-5.38a1 1 0 0 0-1-1.2H6.14" /></svg>
                                        <span className="text-[15px] font-bold text-[#343434]">나의 장바구니</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#E23600] font-bold text-sm">{cartCount}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="m9 18 6-6-6-6"/></svg>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-gray-400 text-sm">서비스 이용을 위해 로그인이 필요합니다.</p>
                                <Link to="/shop/login" className="bg-[#968064] text-white text-center py-4 rounded-xl font-bold" onClick={() => setIsMobileMenuOpen(false)}>로그인 하러가기</Link>
                                <Link to="/shop/signup" className="text-center text-sm text-gray-500 font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>회원가입</Link>
                            </div>
                        )}
                    </div>
                    {menus.map((menu, idx) => (
                        <div key={idx} className="mb-8">
                            <h3 className="text-base font-bold text-[#343434] mb-4 flex items-center gap-2"><span className="w-1 h-4 bg-[#968064] rounded-full"></span>{menu.title}</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-3">
                                {menu.sub.map((subItem, sIdx) => (
                                    <Link key={sIdx} to={subItem.url} onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 py-2">{subItem.name}</Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Header;