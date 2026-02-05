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

    // ⭐️ [해결책 1] 모바일 메뉴가 열렸을 때 뒷배경 스크롤 방지
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    // [로직] 유저 데이터 로드
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            setUser(null);
        }
    }, [location]);

    // [로직] 스크롤 시 배경색 변경
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // [로직] 로그아웃
    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            alert('로그아웃 되었습니다.');
            navigate('/shop/login');
        }
    };

    const handleCartClick = (e) => {
        if (!localStorage.getItem('user')) {
            e.preventDefault();
            alert('로그인이 필요한 서비스입니다.');
            setIsMobileMenuOpen(false);
            navigate('/shop/login');
        } else {
            setIsMobileMenuOpen(false);
        }
    };

    const menus = [
        { title: '나눔 컬렉션', url: '/shop/products', sub: [{ name: '이달의 추천', url: '/shop/products' }, { name: '위시리스트', url: '/shop/mypage/wishlist' }] },
        { title: '전체 상품', url: '/shop/products', sub: [{ name: '전체 보기', url: '/shop/products' }, { name: '신상품', url: '/shop/products' }] },
        { title: '소식과 안내', url: '/shop/main', sub: [{ name: '공지사항', url: '/shop/main' }, { name: '브랜드 이야기', url: '/shop/main' }] },
        { title: '나의 기록', url: '/shop/mypage', sub: [{ name: '주문/배송 조회', url: '/shop/mypage' }, { name: '내 정보 수정', url: '/shop/mypage' }] }
    ];

    return (
        <header
            className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 select-none ${
                isScrolled || isHovered || isMobileMenuOpen ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`w-full border-b transition-colors duration-300 ${
                isScrolled || isHovered || isMobileMenuOpen ? 'border-gray-200' : 'border-transparent'
            }`}>
                <div className="max-w-[1290px] mx-auto px-4 relative flex items-center justify-between h-[60px] md:h-[76px]">

                    <Link to="/shop/main" className="relative z-[10001] outline-none">
                        <img src="/images/shop/index/header_logo2.png" alt="Nanum 로고" className="h-6 md:h-8 object-contain" />
                    </Link>

                    <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
                        {menus.map((menu, idx) => (
                            <div key={idx} className={`h-[76px] flex items-center group relative transition-all duration-500 ease-in-out ${isHovered ? 'px-8 lg:px-10' : 'px-6 lg:px-8'}`}>
                                <Link to={menu.url} className="text-[15px] font-medium text-[#343434] hover:text-[#968064] transition-all whitespace-nowrap">{menu.title}</Link>
                                <ul className={`absolute top-[76px] left-1/2 -translate-x-1/2 w-full transition-all duration-300 overflow-hidden z-[100] ${isHovered ? 'max-h-[300px] py-6 opacity-100' : 'max-h-0 opacity-0 invisible'}`}>
                                    {menu.sub.map((subItem, sIdx) => (
                                        <li key={sIdx} className="text-center py-2"><Link to={subItem.url} className="text-[13px] text-[#666] hover:text-[#968064] block whitespace-nowrap">{subItem.name}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 md:gap-4 relative z-[10001]">
                        <div className="hidden md:flex items-center gap-4 text-[13px]">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <p className="text-[#343434] font-medium"><span className="text-[#968064] font-bold">{user.memberName}</span> 님</p>
                                    <button onClick={handleLogout} className="px-3 py-1 border border-gray-200 rounded-sm text-gray-400 hover:text-black hover:border-gray-400 hover:bg-gray-50 transition-all">로그아웃</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/shop/login" className="bg-[#968064] text-white px-4 py-1.5 rounded-full hover:bg-[#7d6b54] transition-colors font-medium">로그인</Link>
                                    <Link to="/shop/signup" className="text-[#343434] hover:text-[#968064] font-medium transition-colors">회원가입</Link>
                                </div>
                            )}
                        </div>

                        <Link to="/shop/cart" onClick={handleCartClick} className="p-2 group relative flex items-center justify-center outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#343434] opacity-70 group-hover:opacity-100 group-hover:text-[#968064] transition-all">
                                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.1-5.38a1 1 0 0 0-1-1.2H6.14" />
                            </svg>
                            {cartCount > 0 && <span className="absolute top-0 right-0 bg-[#E23600] text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-1">{cartCount}</span>}
                        </Link>

                        <button className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <span className={`w-6 h-0.5 bg-[#343434] transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`w-6 h-0.5 bg-[#343434] ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                            <span className={`w-6 h-0.5 bg-[#343434] transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* PC 메가메뉴 배경 */}
            <div className={`hidden md:block absolute top-[76px] left-0 w-full bg-white border-b border-gray-200 transition-all duration-300 shadow-lg -z-10 ${isHovered ? 'h-[280px] opacity-100' : 'h-0 opacity-0'}`} />

            {/* 모바일 메뉴 레이어 */}
            <div className={`fixed inset-0 bg-white z-[10000] transition-transform duration-500 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* ⭐️ [해결책 2] 모바일 메뉴 내부에만 스크롤을 주고 전체 스크롤 방지 */}
                <div className="pt-24 px-6 h-full overflow-y-auto pb-10 overscroll-contain">
                    <div className="mb-8 pb-6 border-b">
                        {user ? (
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-bold"><span className="text-[#968064]">{user.memberName}</span>님</p>
                                    <button onClick={handleLogout} className="text-sm text-gray-400 underline underline-offset-4">로그아웃</button>
                                </div>
                                <Link to="/shop/cart" onClick={handleCartClick} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
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
                                <Link to="/shop/login" className="bg-[#968064] text-white text-center py-4 rounded-xl font-bold shadow-md shadow-[#968064]/20" onClick={() => setIsMobileMenuOpen(false)}>로그인 하러가기</Link>
                                <Link to="/shop/signup" className="text-center text-sm text-gray-500 font-medium" onClick={() => setIsMobileMenuOpen(false)}>회원가입</Link>
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
        </header>
    );
};

export default Header;