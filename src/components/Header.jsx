import React, { useState, useEffect } from 'react';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 모바일 메뉴 상태

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menus = [
        {
            title: '나눔 컬렉션',
            url: '/shop/collection',
            sub: [
                { name: '이달의 추천', url: '/shop/collection/monthly' },
                { name: '위시리스트', url: '/shop/mypage/wishlist', protected: true },
            ]
        },
        {
            title: '전체 상품',
            url: '/shop/products', // 이 링크를 클릭하면 방금 만든 전체상품 페이지로 이동합니다.
            sub: [
                { name: '전체 보기', url: '/shop/products' },
                { name: '신상품', url: '/shop/products/new' },
                { name: '베스트', url: '/shop/products/best' },
            ]
        },
        {
            title: '소식과 안내',
            url: '/shop/notice',
            sub: [
                { name: '공지사항', url: '/shop/notice/list' },
                { name: '브랜드 이야기', url: '/shop/about' },
                { name: '이용 가이드', url: '/shop/guide' },
            ]
        },
        {
            title: '나의 기록',
            url: '/shop/mypage',
            sub: [
                { name: '주문/배송 조회', url: '/shop/mypage/orders' },
                { name: '1:1 문의', url: '/shop/mypage/qna' },
                { name: '내 정보 수정', url: '/shop/mypage/profile', protected: true },
            ]
        }
    ];

    return (
        <header
            className={`fixed w-full z-[9999] transition-all duration-300 select-none ${
                isScrolled || isHovered || isMobileMenuOpen ? 'bg-white' : 'bg-transparent'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 상단 메인 바 */}
            <div className={`w-full border-b transition-colors duration-300 ${
                isScrolled || isHovered || isMobileMenuOpen ? 'border-gray-200' : 'border-transparent'
            }`}>
                <div className="max-w-[1290px] mx-auto px-4 relative flex items-center justify-between h-[60px] md:h-[76px]">

                    {/* 로고: 모바일 대응 크기 조절 */}
                    <a href="/" className="relative z-[10001] outline-none">
                        <img src="/images/shop/index/header_logo2.png" alt="Nanum 로고" className="h-6 md:h-8 object-contain" />
                    </a>

                    {/* 메인 메뉴: md(768px) 미만에서는 숨김 */}
                    <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
                        {menus.map((menu, idx) => (
                            <div
                                key={idx}
                                className={`h-[76px] flex items-center group relative transition-all duration-500 ease-in-out ${
                                    isHovered ? 'px-8 lg:px-10' : 'px-6 lg:px-8'
                                }`}
                            >
                                <a href={menu.url} className="text-[15px] font-medium text-[#343434] hover:text-[#E23600] transition-all outline-none whitespace-nowrap">
                                    {menu.title}
                                </a>

                                {/* PC 서브 메뉴 드롭다운 */}
                                <ul className={`absolute top-[76px] left-1/2 -translate-x-1/2 w-full transition-all duration-300 overflow-hidden z-[100] ${
                                    isHovered ? 'max-h-[300px] py-6 opacity-100' : 'max-h-0 opacity-0 invisible'
                                }`}>
                                    {menu.sub.map((subItem, sIdx) => (
                                        <li key={sIdx} className="text-center py-2">
                                            <a href={subItem.url} className="text-[13px] text-[#454545] hover:text-[#E23600] block whitespace-nowrap outline-none">
                                                {subItem.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* 우측 메뉴 (PC 전용) */}
                    <div className="hidden md:flex items-center gap-2 text-[12px] relative z-[10001]">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-2">
                                <p className="text-[#343434] font-medium">홍길동 님</p>
                                <button onClick={() => setIsLoggedIn(false)} className="px-2 py-1 border border-gray-300 rounded">로그아웃</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <a href="/shop/login" className="bg-[#968064] text-white px-3 py-1 rounded-full">로그인</a>
                                <a href="/signup" className="text-[#343434]">회원가입</a>
                            </div>
                        )}
                        <a href="/cart" className="ml-2"><img src="/images/shop/index/cart.png" alt="장바구니" className="w-5" /></a>
                    </div>

                    {/* 모바일 햄버거 버튼 */}
                    <button
                        className="md:hidden relative z-[10001] w-8 h-8 flex flex-col justify-center items-center gap-1.5 outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className={`w-6 h-0.5 bg-[#343434] transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-6 h-0.5 bg-[#343434] ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-6 h-0.5 bg-[#343434] transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>
            </div>

            {/* PC용 확장 배경 */}
            <div className={`hidden md:block absolute top-[76px] left-0 w-full bg-white border-b border-gray-200 transition-all duration-300 shadow-lg -z-10 ${
                isHovered ? 'h-[280px] opacity-100' : 'h-0 opacity-0'
            }`} />

            {/* 모바일 메뉴 오버레이 */}
            <div className={`fixed inset-0 bg-white z-[10000] transition-transform duration-500 md:hidden ${
                isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="pt-24 px-6 h-full overflow-y-auto pb-10">
                    {menus.map((menu, idx) => (
                        <div key={idx} className="mb-8">
                            <h3 className="text-lg font-bold text-[#343434] mb-3 border-b pb-2">{menu.title}</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {menu.sub.map((subItem, sIdx) => (
                                    <a key={sIdx} href={subItem.url} className="text-sm text-gray-500 py-1">
                                        {subItem.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="mt-10 pt-6 border-t flex gap-4 text-sm font-medium">
                        <a href="/shop/login">로그인</a>
                        <a href="/signup">회원가입</a>
                        <a href="/cart">장바구니</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;