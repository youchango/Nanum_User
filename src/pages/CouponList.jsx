import React, { useState, useEffect } from 'react';
import couponService from '../api/couponService';
import { formatDate } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';

const CouponList = () => {
    const [tab, setTab] = useState('available'); // 'available' | 'all'
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [availableCount, setAvailableCount] = useState(0);
    const [allCount, setAllCount] = useState(0);

    const fetchCoupons = async (activeTab, page = 0) => {
        setLoading(true);
        try {
            const res = activeTab === 'available'
                ? await couponService.getAvailable(page, 10)
                : await couponService.getAll(page, 10);
            const pageData = res.data?.data;
            setCoupons(pageData?.content || []);
            setTotalPages(pageData?.totalPages || 0);
            setCurrentPage(pageData?.number || 0);
            if (activeTab === 'available') {
                setAvailableCount(pageData?.totalElements || 0);
            } else {
                setAllCount(pageData?.totalElements || 0);
            }
        } catch (err) {
            console.error('쿠폰 목록 조회 실패:', err);
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    };

    // 초기 로드: 두 탭의 totalElements를 가져오기 위해 둘 다 호출
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [availRes, allRes] = await Promise.all([
                    couponService.getAvailable(0, 10),
                    couponService.getAll(0, 1),
                ]);
                const availPageData = availRes.data?.data;
                const allPageData = allRes.data?.data;
                setCoupons(availPageData?.content || []);
                setTotalPages(availPageData?.totalPages || 0);
                setCurrentPage(availPageData?.number || 0);
                setAvailableCount(availPageData?.totalElements || 0);
                setAllCount(allPageData?.totalElements || 0);
            } catch (err) {
                console.error('쿠폰 목록 조회 실패:', err);
                setCoupons([]);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleTabChange = (newTab) => {
        if (newTab !== tab) {
            setTab(newTab);
            fetchCoupons(newTab, 0);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            fetchCoupons(tab, page);
        }
    };

    const getDiscountText = (coupon) => {
        if (coupon.discountType === 'FIXED' || coupon.discountType === 'AMOUNT') {
            return `${Number(coupon.discountValue).toLocaleString()}원 할인`;
        }
        if (coupon.discountType === 'RATE' || coupon.discountType === 'PERCENT') {
            const maxText = coupon.maxDiscount ? ` (최대 ${Number(coupon.maxDiscount).toLocaleString()}원)` : '';
            return `${coupon.discountValue}% 할인${maxText}`;
        }
        return `${Number(coupon.discountValue).toLocaleString()} 할인`;
    };

    if (loading && coupons.length === 0) {
        return (
            <MyPageLayout>
                <div className="py-40 text-center text-gray-400 uppercase tracking-widest text-sm">
                    Loading Coupons...
                </div>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout>
                <header className="mb-8 md:mb-10">
                    <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">My Coupons</h2>
                    <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">보유한 쿠폰을 확인하세요.</p>
                </header>

                {/* 탭 */}
                <div className="flex gap-0 mb-8">
                    <button
                        onClick={() => handleTabChange('available')}
                        className={`flex-1 py-3.5 text-[12px] md:text-[13px] font-bold border transition-all ${
                            tab === 'available'
                                ? 'border-[#333] bg-[#333] text-white'
                                : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'
                        }`}
                    >
                        사용 가능 ({availableCount})
                    </button>
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`flex-1 py-3.5 text-[12px] md:text-[13px] font-bold border border-l-0 transition-all ${
                            tab === 'all'
                                ? 'border-[#333] bg-[#333] text-white'
                                : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'
                        }`}
                    >
                        전체 ({allCount})
                    </button>
                </div>

                {/* 쿠폰 리스트 */}
                {coupons.length > 0 ? (
                    <div className="flex flex-col gap-4 md:gap-5">
                        {coupons.map((coupon) => {
                            const isUsed = coupon.usedYn === 'Y' || coupon.usedYn === true;
                            return (
                                <div
                                    key={coupon.memberCouponId}
                                    className={`relative bg-white border shadow-sm rounded-sm overflow-hidden ${
                                        isUsed ? 'border-gray-100 opacity-60' : 'border-gray-100'
                                    }`}
                                >
                                    {/* 사용완료 배지 */}
                                    {isUsed && (
                                        <div className="absolute inset-0 bg-gray-50/60 flex items-center justify-center z-10">
                                            <span className="px-4 py-2 bg-gray-500 text-white text-[12px] font-bold rounded-sm rotate-[-6deg] shadow-md uppercase tracking-wider">
                                                사용완료
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row">
                                        {/* 왼쪽: 할인 금액 */}
                                        <div className="bg-[#fafaf5] border-b md:border-b-0 md:border-r border-gray-100 p-5 md:p-6 flex items-center justify-center md:min-w-[180px]">
                                            <p className="text-[20px] md:text-[24px] font-black text-[#968064] text-center">
                                                {getDiscountText(coupon)}
                                            </p>
                                        </div>

                                        {/* 오른쪽: 상세 정보 */}
                                        <div className="flex-grow p-5 md:p-6">
                                            <h3 className="text-[14px] md:text-[16px] font-bold text-[#333] mb-2">
                                                {coupon.couponName}
                                            </h3>
                                            <div className="flex flex-col gap-1">
                                                {coupon.minOrderPrice > 0 && (
                                                    <p className="text-[12px] text-gray-400">
                                                        {Number(coupon.minOrderPrice).toLocaleString()}원 이상 구매 시
                                                    </p>
                                                )}
                                                <p className="text-[12px] text-gray-400">
                                                    {formatDate(coupon.validStartDate)} ~ {formatDate(coupon.validEndDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 md:py-40 text-center border-t border-b border-dashed border-gray-200 bg-white text-gray-300 italic text-[13px]">
                        보유한 쿠폰이 없습니다.
                    </div>
                )}

                {/* 페이징 UI */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <button disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)} className="text-[12px] uppercase text-[#333] disabled:text-gray-200">PREV</button>
                        <div className="flex gap-4">
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => handlePageChange(i)} className={`text-[14px] w-8 h-8 flex items-center justify-center ${currentPage === i ? 'bg-[#333] text-white rounded-full' : 'text-gray-400'}`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button disabled={currentPage === totalPages - 1} onClick={() => handlePageChange(currentPage + 1)} className="text-[12px] uppercase text-[#333] disabled:text-gray-200">NEXT</button>
                    </div>
                )}
        </MyPageLayout>
    );
};

export default CouponList;
