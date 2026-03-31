import { useState, useEffect } from 'react';
import pointService from '../api/pointService';
import { formatDate } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';

import type { PointHistory as PointHistoryType } from '../api/pointService';

const PointHistory = () => {
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState<PointHistoryType[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchBalance = async () => {
        try {
            const res = await pointService.getBalance();
            setBalance(res.data ?? 0);
        } catch (err) {
            console.error('포인트 잔액 조회 실패:', err);
        }
    };

    const fetchHistory = async (p = 1) => {
        setLoading(true);
        try {
            const res = await pointService.getHistory(p, 20);
            const data = res.data || {};
            setHistory(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error('포인트 내역 조회 실패:', err);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
        fetchHistory(1);
    }, []);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchHistory(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && history.length === 0) {
        return (
            <MyPageLayout>
                <div className="py-40 text-center text-gray-400 uppercase tracking-widest text-sm">
                    Loading Points...
                </div>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout>
                <header className="mb-8 md:mb-10">
                    <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">My Points</h2>
                    <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">포인트 적립 및 사용 내역을 확인하세요.</p>
                </header>

                {/* 잔액 카드 */}
                <div className="bg-white border border-gray-100 shadow-sm p-6 md:p-8 mb-8 rounded-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-2">보유 포인트</p>
                            <p className="text-[32px] md:text-[40px] font-black text-[#968064]">
                                {balance.toLocaleString()} <span className="text-[20px] md:text-[24px] font-bold">P</span>
                            </p>
                        </div>
                        <div className="text-right text-[12px] text-gray-400">
                            총 {totalElements}건의 내역
                        </div>
                    </div>
                </div>

                {/* 포인트 내역 리스트 */}
                {history.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-3 md:gap-4">
                            {history.map((item) => {
                                const isEarn = item.pointGubun === '적립';
                                return (
                                    <div
                                        key={item.pointId}
                                        className="bg-white border border-gray-100 shadow-sm p-4 md:p-5 rounded-sm"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                                                        isEarn
                                                            ? 'bg-green-50 text-green-600'
                                                            : 'bg-red-50 text-red-500'
                                                    }`}>
                                                        {item.pointGubun}
                                                    </span>
                                                    {item.orderNo && (
                                                        <span className="text-[10px] text-gray-400 font-light">
                                                            주문 #{item.orderNo}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[13px] md:text-[14px] text-[#333] font-medium truncate">
                                                    {item.pointBigo || (isEarn ? '포인트 적립' : '포인트 사용')}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-[16px] md:text-[18px] font-bold ${
                                                    isEarn ? 'text-green-600' : 'text-red-500'
                                                }`}>
                                                    {isEarn ? '+' : '-'}{Math.abs(item.pointUse).toLocaleString()} P
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-light mt-1">
                                                    {formatDate(item.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-2 text-[12px] font-bold border border-gray-200 text-gray-400 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    이전
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-8 h-8 text-[12px] font-bold border transition-all ${
                                            page === i + 1
                                                ? 'border-[#333] bg-[#333] text-white'
                                                : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages}
                                    className="px-3 py-2 text-[12px] font-bold border border-gray-200 text-gray-400 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-20 md:py-40 text-center border-t border-b border-dashed border-gray-200 bg-white text-gray-300 italic text-[13px]">
                        포인트 내역이 없습니다.
                    </div>
                )}
        </MyPageLayout>
    );
};

export default PointHistory;
