import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const OrderList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();

    // 1. [상태 관리] 상태 복구 로직
    const [filterDate, setFilterDate] = useState(location.state?.filterDate || '3month');
    const [startDate, setStartDate] = useState(location.state?.startDate || '');
    const [endDate, setEndDate] = useState(location.state?.endDate || '');
    const [currentPage, setCurrentPage] = useState(location.state?.currentPage || 1);

    const totalPages = 5;

    // 2. [날짜 계산 로직]
    const calculateDates = (type) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();

        const formatEndDate = now.toISOString().split('T')[0];
        let start = new Date(year, month, day);

        if (type === '3month') start.setMonth(start.getMonth() - 3);
        else if (type === '6month') start.setMonth(start.getMonth() - 6);
        else if (type === '1year') start.setFullYear(start.getFullYear() - 1);

        const formatStartDate = start.toISOString().split('T')[0];
        setStartDate(formatStartDate);
        setEndDate(formatEndDate);
    };

    useEffect(() => {
        if (!location.state?.startDate) {
            calculateDates(filterDate);
        }
    }, []);

    const handleQuickFilter = (type) => {
        setFilterDate(type);
        calculateDates(type);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if(startDate && endDate && startDate > endDate) {
            alert('시작일이 종료일보다 클 수 없습니다.');
            return;
        }
        setCurrentPage(1);
        alert(`${startDate} ~ ${endDate} 내역을 조회합니다.`);
    };

    // 3. [주문 관리 액션]
    const onAddToCart = (item) => {
        addToCart({ id: item.id, name: item.name, price: item.price, img: item.img }, 1);
        if (window.confirm("장바구니에 담겼습니다. 장바구니로 이동할까요?")) {
            navigate('/shop/cart');
        }
    };

    const onDirectPurchase = (item) => {
        const user = localStorage.getItem('user');
        const orderData = {
            isDirect: true,
            orderItems: [{ id: item.id, name: item.name, price: item.price, image: item.img, quantity: 1 }]
        };
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/shop/login', { state: { from: location.pathname, directOrderData: orderData } });
            return;
        }
        navigate('/shop/checkout', { state: orderData });
    };

    // 4. [페이지네이션]
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0);
        }
    };

    // 5. [가짜 데이터]
    const [orders] = useState([
        {
            orderId: "20260205-001234",
            orderDate: "2026.02.05",
            status: "배송중",
            totalPrice: 64800,
            items: [
                { id: 1, name: "Nanum 쌀 (백미) 10kg", price: 36000, img: "/images/product1.jpg", quantity: 1 },
                { id: 3, name: "내추럴 린넨 에이프런", price: 28800, img: "/images/product3.jpg", quantity: 1 }
            ]
        }
    ]);

    const dateFilters = [
        { label: '3개월', value: '3month' },
        { label: '6개월', value: '6month' },
        { label: '1년', value: '1year' },
    ];

    return (
        <div className="min-h-screen bg-[#fcfcfc] py-10 md:py-20 px-4 md:px-6 font-sans text-[#333]">
            <div className="max-w-[1000px] mx-auto">

                <header className="mb-8 md:mb-10 text-center md:text-left">
                    <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">Order History</h2>
                    <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">정갈한 나눔의 기록들을 확인하세요.</p>
                </header>

                {/* 🔍 기간 조회 섹션 (PC 버튼 레이아웃 수정됨) */}
                <div className="bg-white border border-gray-100 p-4 md:p-8 mb-8 md:mb-12 shadow-sm rounded-sm">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden md:block w-20 shrink-0">Period</span>

                            <div className="flex flex-col sm:flex-row items-center gap-3 flex-grow w-full">
                                {/* 퀵 필터 버튼 */}
                                <div className="flex gap-1 w-full sm:w-auto">
                                    {dateFilters.map((filter) => (
                                        <button
                                            key={filter.value}
                                            type="button"
                                            onClick={() => handleQuickFilter(filter.value)}
                                            className={`flex-1 sm:flex-none px-4 py-2 text-[11px] md:text-[12px] transition-all border ${
                                                filterDate === filter.value
                                                    ? 'bg-[#333] text-white border-[#333]'
                                                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-400 hover:text-[#333]'
                                            }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                                {/* 달력 날짜 */}
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <input type="date" value={startDate} onChange={(e) => {setStartDate(e.target.value); setFilterDate('');}} className="flex-1 sm:w-[140px] border border-gray-200 px-2 py-2 text-[12px] outline-none h-[38px] bg-[#f9f9f9] focus:bg-white focus:border-[#333]" />
                                    <span className="text-gray-300">~</span>
                                    <input type="date" value={endDate} onChange={(e) => {setEndDate(e.target.value); setFilterDate('');}} className="flex-1 sm:w-[140px] border border-gray-200 px-2 py-2 text-[12px] outline-none h-[38px] bg-[#f9f9f9] focus:bg-white focus:border-[#333]" />
                                </div>

                                {/* ⭐️ PC 버전에서 정렬된 조회하기 버튼 */}
                                <button type="submit" className="hidden md:block px-8 py-2 bg-[#333] text-white text-[12px] font-bold hover:bg-black transition-all h-[38px] active:scale-95 shrink-0">
                                    조회하기
                                </button>
                            </div>
                        </div>

                        {/* ⭐️ 모바일 버전에서만 보이는 조회하기 버튼 */}
                        <button type="submit" className="md:hidden w-full py-3 bg-[#333] text-white text-[12px] font-bold hover:bg-black transition-all rounded-sm active:scale-95">
                            조회하기
                        </button>
                    </form>
                </div>

                {/* 주문 리스트 영역 */}
                {orders.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-6 md:gap-8">
                            {orders.map((order) => (
                                <div key={order.orderId} className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-sm">
                                    <div className="bg-[#fafafa] px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex justify-between items-center gap-2">
                                        <div className="flex flex-col md:flex-row md:gap-6 text-[11px] md:text-[12px]">
                                            <p className="text-gray-400 font-medium"><span className="hidden md:inline mr-2 uppercase text-[10px] font-bold">Date</span><strong>{order.orderDate}</strong></p>
                                            <p className="text-[#333]"><span className="hidden md:inline mr-2 uppercase text-[10px] font-bold text-gray-400">Order No.</span><strong>{order.orderId}</strong></p>
                                        </div>
                                        <Link
                                            to={`/shop/mypage/order/${order.orderId}`}
                                            state={{ currentPage, filterDate, startDate, endDate }}
                                            className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase border border-gray-200 px-2 py-1 md:border-none md:p-0 md:underline md:underline-offset-4 hover:text-black transition-colors"
                                        >
                                            상세보기
                                        </Link>
                                    </div>

                                    <div className="divide-y divide-gray-50">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="p-4 md:p-6">
                                                <div className="flex items-start md:items-center gap-4 md:gap-8 mb-4 md:mb-0">
                                                    <Link to={`/shop/product/${item.id}`} className="w-20 h-24 md:w-20 md:h-24 bg-[#f9f9f9] shrink-0 overflow-hidden border border-gray-100 rounded-sm group">
                                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    </Link>

                                                    <div className="flex-grow">
                                                        <div className="inline-block px-1.5 py-0.5 rounded-sm bg-gray-100 text-[9px] md:text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">{order.status}</div>
                                                        <Link to={`/shop/product/${item.id}`} className="block text-[14px] md:text-[15px] font-bold mb-1 leading-snug hover:text-[#968064] transition-colors line-clamp-2">{item.name}</Link>
                                                        <p className="text-[12px] md:text-[13px] text-gray-400 font-light">{item.price.toLocaleString()}원 · {item.quantity}개</p>
                                                    </div>

                                                    <div className="hidden md:flex flex-col gap-2 w-40">
                                                        <button onClick={() => onDirectPurchase(item)} className="w-full py-2.5 bg-[#343434] text-white text-[11px] font-bold hover:bg-black transition-all active:scale-95">바로 구매</button>
                                                        <button onClick={() => onAddToCart(item)} className="w-full py-2.5 border border-gray-200 text-[#666] text-[11px] font-bold hover:bg-gray-50 transition-all">장바구니 담기</button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 md:hidden">
                                                    <button onClick={() => onAddToCart(item)} className="flex-1 py-3 border border-gray-200 text-[#666] text-[11px] font-bold active:bg-gray-100 transition-all rounded-sm">장바구니</button>
                                                    <button onClick={() => onDirectPurchase(item)} className="flex-1 py-3 bg-[#343434] text-white text-[11px] font-bold active:bg-black transition-all rounded-sm">바로 구매</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 md:mt-20 mb-10 flex justify-center items-center gap-4 md:gap-10">
                            <button onClick={handlePrevPage} disabled={currentPage === 1} className={`text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-colors ${currentPage === 1 ? 'text-gray-100 cursor-not-allowed' : 'text-gray-300 hover:text-black'}`}>Prev</button>
                            <div className="flex gap-4 md:gap-8">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button key={num} onClick={() => {setCurrentPage(num); window.scrollTo(0,0);}} className={`text-[13px] md:text-[14px] transition-all relative ${currentPage === num ? 'text-black font-bold after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-black' : 'text-gray-300 hover:text-gray-500 font-light'}`}>{num}</button>
                                ))}
                            </div>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-colors ${currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-black'}`}>Next</button>
                        </div>
                    </>
                ) : (
                    <div className="py-20 md:py-40 text-center border-t border-b border-dashed border-gray-200 bg-white text-gray-300 italic text-[13px]">주문 내역이 존재하지 않습니다.</div>
                )}
            </div>
        </div>
    );
};

export default OrderList;