import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import orderService from '../api/orderService';
import productService from '../api/productService';
import { formatDate } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';

const OrderList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();

    const ITEMS_PER_PAGE = 10;

    // 1. [상태 관리] 상태 복구 로직
    const [filterDate, setFilterDate] = useState(location.state?.filterDate || '3month');
    const [startDate, setStartDate] = useState(location.state?.startDate || '');
    const [endDate, setEndDate] = useState(location.state?.endDate || '');
    const [currentPage, setCurrentPage] = useState(location.state?.currentPage || 1);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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
        return { start: formatStartDate, end: formatEndDate };
    };

    // 3. [API 호출 — 서버 페이징 + 날짜 필터]
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = async (pageNum = 1, sd = startDate, ed = endDate) => {
        setLoading(true);
        try {
            const params = { page: pageNum - 1, size: ITEMS_PER_PAGE };
            if (sd && ed) {
                params.startDate = sd;
                params.endDate = ed;
            }
            const res = await orderService.getOrders(params);
            const pageData = res.data?.data;
            setAllOrders(pageData?.content || []);
            setTotalPages(pageData?.totalPages || 1);
        } catch (err) {
            console.error('주문 목록 조회 실패:', err);
            setAllOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!location.state?.startDate) {
            const dates = calculateDates(filterDate);
            fetchOrders(1, dates.start, dates.end);
        } else {
            fetchOrders(currentPage, startDate, endDate);
        }
    }, []);

    // 4. [페이지네이션]
    const paginatedOrders = allOrders; // 서버에서 이미 페이징됨

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleQuickFilter = (type) => {
        setFilterDate(type);
        const dates = calculateDates(type);
        setCurrentPage(1);
        fetchOrders(1, dates.start, dates.end);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if(startDate && endDate && startDate > endDate) {
            alert('시작일이 종료일보다 클 수 없습니다.');
            return;
        }
        setCurrentPage(1);
        fetchOrders(1, startDate, endDate);
    };

    // 6. [주문 관리 액션]
    // 리뷰 모달
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [reviewForm, setReviewForm] = useState({ title: '', content: '', rating: 5 });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewHover, setReviewHover] = useState(0);

    const openReviewModal = (item, orderId) => {
        setReviewTarget({ ...item, orderId });
        setReviewForm({ title: '', content: '', rating: 5 });
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewForm.title.trim()) { alert('제목을 입력해주세요.'); return; }
        if (!reviewForm.content.trim()) { alert('내용을 입력해주세요.'); return; }
        setReviewSubmitting(true);
        try {
            await productService.createReview(reviewTarget.productId, {
                ...reviewForm,
                orderId: reviewTarget.orderId,
            });
            alert('후기가 등록되었습니다.');
            setShowReviewModal(false);
            // 목록 새로고침
            fetchOrders(currentPage, startDate, endDate);
        } catch (e) {
            alert(e.response?.data?.message || '후기 등록에 실패했습니다.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const onAddToCart = (item) => {
        addToCart({ id: item.productId, name: item.productName, price: item.pricePerUnit, img: item.img }, 1);
        if (window.confirm("장바구니에 담겼습니다. 장바구니로 이동할까요?")) {
            navigate('/shop/cart');
        }
    };

    const onDirectPurchase = (item) => {
        const user = localStorage.getItem('user');
        const orderData = {
            isDirect: true,
            orderItems: [{ id: item.productId, name: item.productName, price: item.pricePerUnit, image: item.img, quantity: 1 }]
        };
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/shop/login', { state: { from: location.pathname, directOrderData: orderData } });
            return;
        }
        navigate('/shop/checkout', { state: orderData });
    };

    // 7. [페이지네이션]
    const goToPage = (pageNum) => {
        setCurrentPage(pageNum);
        fetchOrders(pageNum);
        window.scrollTo(0, 0);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
    };

    const dateFilters = [
        { label: '3개월', value: '3month' },
        { label: '6개월', value: '6month' },
        { label: '1년', value: '1year' },
    ];

    if (loading) {
        return (
            <MyPageLayout>
                <div className="py-40 text-center text-gray-400 uppercase tracking-widest text-sm">
                    Loading Orders...
                </div>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout>
                <header className="mb-8 md:mb-10 text-center md:text-left">
                    <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">Order History</h2>
                    <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">정갈한 나눔의 기록들을 확인하세요.</p>
                </header>

                {/* 기간 조회 섹션 */}
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

                                {/* PC 버전 조회하기 버튼 */}
                                <button type="submit" className="hidden md:block px-8 py-2 bg-[#333] text-white text-[12px] font-bold hover:bg-black transition-all h-[38px] active:scale-95 shrink-0">
                                    조회하기
                                </button>
                            </div>
                        </div>

                        {/* 모바일 버전 조회하기 버튼 */}
                        <button type="submit" className="md:hidden w-full py-3 bg-[#333] text-white text-[12px] font-bold hover:bg-black transition-all rounded-sm active:scale-95">
                            조회하기
                        </button>
                    </form>
                </div>

                {/* 주문 리스트 영역 */}
                {paginatedOrders.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-6 md:gap-8">
                            {paginatedOrders.map((order) => (
                                <div key={order.orderId} className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-sm">
                                    <div className="bg-[#fafafa] px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex justify-between items-center gap-2">
                                        <div className="flex flex-col md:flex-row md:gap-6 text-[11px] md:text-[12px]">
                                            <p className="text-gray-400 font-medium"><span className="hidden md:inline mr-2 uppercase text-[10px] font-bold">Date</span><strong>{formatDate(order.createdAt)}</strong></p>
                                            <p className="text-[#333]"><span className="hidden md:inline mr-2 uppercase text-[10px] font-bold text-gray-400">Order No.</span><strong>{order.orderNo}</strong></p>
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
                                        {(order.items || []).map((item, idx) => (
                                            <div key={idx} className="p-4 md:p-6">
                                                <div className="flex items-start md:items-center gap-4 md:gap-8 mb-4 md:mb-0">
                                                    <Link to={`/shop/product/${item.productId}`} className="w-20 h-24 md:w-20 md:h-24 bg-[#f9f9f9] shrink-0 overflow-hidden border border-gray-100 rounded-sm group">
                                                        <img src={item.img || `/images/product${item.productId}.jpg`} alt={item.productName} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    </Link>

                                                    <div className="flex-grow">
                                                        <div className="inline-block px-1.5 py-0.5 rounded-sm bg-gray-100 text-[9px] md:text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">{order.status}</div>
                                                        <Link to={`/shop/product/${item.productId}`} className="block text-[14px] md:text-[15px] font-bold mb-1 leading-snug hover:text-[#968064] transition-colors line-clamp-2">
                                                            {item.productName}
                                                            {item.optionName && <span className="text-gray-400 font-normal text-[12px] ml-2">({item.optionName})</span>}
                                                        </Link>
                                                        <p className="text-[12px] md:text-[13px] text-gray-400 font-light">{item.pricePerUnit?.toLocaleString()}원 · {item.quantity}개</p>
                                                    </div>

                                                    <div className="hidden md:flex flex-col gap-2 w-40">
                                                        <button onClick={() => onDirectPurchase(item)} className="w-full py-2.5 bg-[#343434] text-white text-[11px] font-bold hover:bg-black transition-all active:scale-95">바로 구매</button>
                                                        <button onClick={() => onAddToCart(item)} className="w-full py-2.5 border border-gray-200 text-[#666] text-[11px] font-bold hover:bg-gray-50 transition-all">장바구니 담기</button>
                                                        {order.status === 'DELIVERED' && !item.reviewYn && (
                                                            <button onClick={() => openReviewModal(item, order.orderId)} className="w-full py-2.5 border border-[#968064] text-[#968064] text-[11px] font-bold hover:bg-orange-50 transition-all">후기 작성</button>
                                                        )}
                                                        {order.status === 'DELIVERED' && item.reviewYn && (
                                                            <span className="w-full py-2.5 text-center text-gray-400 text-[11px]">작성 완료</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 md:hidden">
                                                    <button onClick={() => onAddToCart(item)} className="flex-1 py-3 border border-gray-200 text-[#666] text-[11px] font-bold active:bg-gray-100 transition-all rounded-sm">장바구니</button>
                                                    <button onClick={() => onDirectPurchase(item)} className="flex-1 py-3 bg-[#343434] text-white text-[11px] font-bold active:bg-black transition-all rounded-sm">바로 구매</button>
                                                    {order.status === 'DELIVERED' && !item.reviewYn && (
                                                        <button onClick={() => openReviewModal(item, order.orderId)} className="flex-1 py-3 border border-[#968064] text-[#968064] text-[11px] font-bold active:bg-orange-50 transition-all rounded-sm">후기</button>
                                                    )}
                                                    {order.status === 'DELIVERED' && item.reviewYn && (
                                                        <span className="flex-1 py-3 text-center text-gray-400 text-[11px]">작성완료</span>
                                                    )}
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
                                {pageNumbers.map(num => (
                                    <button key={num} onClick={() => goToPage(num)} className={`text-[13px] md:text-[14px] transition-all relative ${currentPage === num ? 'text-black font-bold after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-black' : 'text-gray-300 hover:text-gray-500 font-light'}`}>{num}</button>
                                ))}
                            </div>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-colors ${currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-black'}`}>Next</button>
                        </div>
                    </>
                ) : (
                    <div className="py-20 md:py-40 text-center border-t border-b border-dashed border-gray-200 bg-white text-gray-300 italic text-[13px]">주문 내역이 존재하지 않습니다.</div>
                )}

            {/* 후기 작성 모달 */}
            {showReviewModal && reviewTarget && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={() => setShowReviewModal(false)}>
                    <div className="bg-white w-full max-w-[500px] mx-4 rounded-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-[16px] font-bold text-[#333]">후기 작성</h3>
                            <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-black text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="p-6 flex flex-col gap-5">
                            <div className="bg-[#fcfcfc] border border-gray-100 p-4 rounded-sm">
                                <p className="text-[14px] font-bold text-[#333]">{reviewTarget.productName}</p>
                                {reviewTarget.optionName && <p className="text-[12px] text-gray-400 mt-1">{reviewTarget.optionName}</p>}
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-[#555] mb-2">평점</label>
                                <span className="inline-flex gap-1 text-2xl">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span key={star}
                                              className={`cursor-pointer select-none transition-colors ${(reviewHover || reviewForm.rating) >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                              onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                              onMouseEnter={() => setReviewHover(star)}
                                              onMouseLeave={() => setReviewHover(0)}
                                        >&#9733;</span>
                                    ))}
                                </span>
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-[#555] mb-2">제목</label>
                                <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                       placeholder="후기 제목을 입력해주세요" className="w-full px-4 py-3 border border-gray-200 text-[14px] outline-none focus:border-[#968064] rounded-sm" maxLength={100} />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-[#555] mb-2">내용</label>
                                <textarea value={reviewForm.content} onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                                          placeholder="구매 후기를 작성해주세요" className="w-full px-4 py-3 border border-gray-200 text-[14px] outline-none focus:border-[#968064] rounded-sm resize-none" rows={5} maxLength={1000} />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 py-3.5 border border-gray-200 text-gray-500 text-[13px] font-medium rounded-sm hover:bg-gray-50">취소</button>
                                <button type="submit" disabled={reviewSubmitting} className="flex-[2] py-3.5 bg-[#343434] text-white text-[13px] font-medium rounded-sm hover:bg-black disabled:opacity-50">{reviewSubmitting ? '등록 중...' : '후기 등록'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MyPageLayout>
    );
};

export default OrderList;
