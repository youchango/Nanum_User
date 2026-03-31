import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import claimService from '../api/claimService';
import { formatDate } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';
import { CLAIM_TYPE_MAP, CLAIM_STATUS_MAP, CLAIM_REASON_MAP } from '../constants/statusMaps';

const CLAIM_TYPE_STYLE: Record<string, string> = {
    EXCHANGE: 'bg-blue-50 text-blue-500',
    RETURN: 'bg-orange-50 text-orange-500',
    REFUND: 'bg-red-50 text-red-400',
};

const ClaimList = () => {
    const navigate = useNavigate();
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchClaims = async (page = 1) => {
        setLoading(true);
        try {
            const res = await claimService.getMyClaims(page, 10);
            const pageData: any = res.data;
            setClaims(pageData?.content || []);
            setTotalPages(pageData?.totalPages || 0);
            setCurrentPage(pageData?.number || 1);
        } catch (err) {
            console.error('클레임 목록 조회 실패:', err);
            setClaims([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims(1);
    }, []);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchClaims(page);
        }
    };

    if (loading && claims.length === 0) {
        return (
            <MyPageLayout>
                <div className="py-40 text-center text-gray-400 uppercase tracking-widest text-sm">
                    Loading Claims...
                </div>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout>
            <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">Claims</h2>
                    <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">교환/반품/환불 내역을 확인하세요.</p>
                </div>
            </header>

            {claims.length > 0 ? (
                <div className="flex flex-col gap-4 md:gap-5">
                    {claims.map((claim: any) => {
                        const statusInfo = (CLAIM_STATUS_MAP as any)[claim.claimStatus] || { label: claim.claimStatus, color: 'bg-gray-100 text-gray-500' };
                        return (
                            <div
                                key={claim.claimId}
                                onClick={() => navigate(`/shop/mypage/claim/${claim.claimId}`)}
                                className="bg-white border border-gray-100 shadow-sm p-5 md:p-6 cursor-pointer hover:border-gray-200 transition-all rounded-sm group"
                            >
                                <div className="flex items-start md:items-center justify-between gap-3">
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${CLAIM_TYPE_STYLE[claim.claimType] || 'bg-gray-100 text-gray-500'}`}>
                                                {(CLAIM_TYPE_MAP as any)[claim.claimType] || claim.claimType}
                                            </span>
                                            <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                            {claim.orderNo && (
                                                <span className="text-[10px] text-gray-300 font-light">
                                                    #{claim.orderNo}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-[14px] md:text-[15px] font-bold truncate group-hover:text-[#968064] transition-colors">
                                            {claim.productName || claim.orderName || '주문 전체'}
                                            {claim.productName && claim.quantity > 0 && <span className="text-gray-400 font-normal text-[12px] ml-1">x{claim.quantity}</span>}
                                        </h3>
                                        <p className="text-[12px] text-gray-400 mt-1 font-light">
                                            {(CLAIM_REASON_MAP as any)[claim.claimReason] || claim.claimReason}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[11px] md:text-[12px] text-gray-400 font-light">{formatDate(claim.requestedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-20 md:py-40 text-center border-t border-b border-dashed border-gray-200 bg-white text-gray-300 italic text-[13px]">
                    클레임 내역이 없습니다.
                </div>
            )}

            {/* 페이징 UI */}
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                    <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="text-[12px] uppercase text-[#333] disabled:text-gray-200">PREV</button>
                    <div className="flex gap-4">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => handlePageChange(i)} className={`text-[14px] w-8 h-8 flex items-center justify-center ${currentPage === i ? 'bg-[#333] text-white rounded-full' : 'text-gray-400'}`}>
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

export default ClaimList;
