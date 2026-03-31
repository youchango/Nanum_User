import { useState, useEffect } from 'react';
import taxBillService from '../api/taxBillService';
import { formatDate } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';
import { TAX_BILL_STATUS_MAP } from '../constants/statusMaps';

const TaxBillHistory = () => {
    const [applyList, setApplyList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchApplyList = async (page = 1) => {
        setLoading(true);
        try {
            const res = await taxBillService.getApplyList(page, 10);
            const pageData = res.data;
            setApplyList(pageData?.content || []);
            setTotalPages(pageData?.totalPages || 0);
            setCurrentPage(pageData?.number || 1);
        } catch (e) {
            console.error('발행 내역 조회 실패:', e);
            setApplyList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplyList(1);
    }, []);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchApplyList(page);
        }
    };

    if (loading && applyList.length === 0) {
        return <MyPageLayout><div className="py-20 text-center text-gray-400 text-sm">로딩 중...</div></MyPageLayout>;
    }

    return (
        <MyPageLayout>
            <header className="mb-8">
                <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight uppercase text-[#343434]">세금계산서/현금영수증</h2>
                <p className="text-gray-400 text-[12px] mt-2 font-light">발행 신청 내역입니다.</p>
            </header>

            {applyList.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {applyList.map((apply: any) => {
                        const statusInfo = (TAX_BILL_STATUS_MAP as any)[apply.status] || { label: apply.status, color: 'bg-gray-100 text-gray-500' };
                        return (
                            <div key={apply.id} className="bg-white border border-gray-100 p-5 shadow-sm rounded-sm flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${statusInfo.color}`}>{statusInfo.label}</span>
                                        <span className="text-[12px] text-gray-400">{apply.billType === 'TAX_BILL' ? '세금계산서' : '현금영수증'}</span>
                                    </div>
                                    <p className="text-[14px] font-bold text-[#333]">
                                        {apply.billType === 'TAX_BILL' ? apply.bizName : apply.receiptIdNum}
                                    </p>
                                    <p className="text-[12px] text-gray-400 mt-0.5">주문번호: {apply.orderNo} · {formatDate(apply.createdAt)}</p>
                                </div>
                                {apply.ntsConfirmNum && (
                                    <p className="text-[11px] text-gray-400">승인번호: {apply.ntsConfirmNum}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-20 text-center text-gray-400 text-[13px] border border-dashed border-gray-200 rounded-sm">
                    발행 신청 내역이 없습니다.
                </div>
            )}

            {/* 페이징 UI */}
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                    <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="text-[12px] uppercase text-[#333] disabled:text-gray-200">PREV</button>
                    <div className="flex gap-4">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`text-[14px] w-8 h-8 flex items-center justify-center ${currentPage === i + 1 ? 'bg-[#333] text-white rounded-full' : 'text-gray-400'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="text-[12px] uppercase text-[#333] disabled:text-gray-200">NEXT</button>
                </div>
            )}
        </MyPageLayout>
    );
};

export default TaxBillHistory;
