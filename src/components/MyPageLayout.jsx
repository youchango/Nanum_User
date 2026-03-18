import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
    { label: '내 정보 수정', path: '/shop/mypage/edit' },
    { label: '주문/배송 조회', path: '/shop/mypage/orders' },
    { label: '교환/반품/환불', path: '/shop/mypage/claims' },
    { label: '포인트', path: '/shop/mypage/points' },
    { label: '쿠폰', path: '/shop/mypage/coupons' },
    { label: '세금계산서 정보', path: '/shop/mypage/tax-bill' },
    { label: '세금계산서/현금영수증', path: '/shop/mypage/tax-bill-history' },
    { label: '배송지 관리', path: '/shop/mypage/addresses' },
    { label: '위시리스트', path: '/shop/mypage/wishlist' },
    { label: '1:1 문의', path: '/shop/mypage/inquiries' },
];

const MyPageLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        // 정확히 일치하거나, path 뒤에 /가 오는 경우만 활성화 (tax-bill과 tax-bill-history 구분)
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] py-10 md:py-20 px-4 md:px-6 font-sans text-[#333]">
            <div className="max-w-[1100px] mx-auto">
                <header className="mb-8 md:mb-10">
                    <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight uppercase tracking-widest text-[#343434]">My Page</h2>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* 좌측 사이드바 */}
                    <aside className="w-full md:w-[200px] shrink-0">
                        {/* 모바일: 가로 스크롤 */}
                        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar">
                            {menuItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`whitespace-nowrap px-4 py-3 text-[13px] text-left rounded-sm transition-all ${
                                        isActive(item.path)
                                            ? 'bg-[#333] text-white font-bold'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-[#333]'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                            <button
                                onClick={() => navigate('/shop/mypage/withdrawal')}
                                className="whitespace-nowrap px-4 py-3 text-[13px] text-left text-gray-300 hover:text-red-400 transition-all mt-2 md:mt-4 md:border-t md:border-gray-100 md:pt-4"
                            >
                                회원 탈퇴
                            </button>
                        </nav>
                    </aside>

                    {/* 우측 콘텐츠 */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MyPageLayout;
