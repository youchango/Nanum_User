import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import claimService from '../api/claimService';
import { formatDateTime } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';
import { CLAIM_TYPE_MAP, CLAIM_STATUS_MAP, CLAIM_REASON_MAP } from '../constants/statusMaps';

const CLAIM_TYPE_STYLE = {
    EXCHANGE: 'bg-blue-50 text-blue-500',
    RETURN: 'bg-orange-50 text-orange-500',
    REFUND: 'bg-red-50 text-red-400',
};

const ClaimDetail = () => {
    const { claimId } = useParams();
    const navigate = useNavigate();

    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchClaim = async () => {
            setLoading(true);
            setError(false);
            try {
                const res = await claimService.getClaimDetail(claimId);
                const data = res.data?.data;
                if (!data) throw new Error('클레임 데이터가 없습니다.');
                setClaim(data);
            } catch (err) {
                console.error('클레임 상세 조회 실패:', err);
                setClaim(null);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchClaim();
        window.scrollTo(0, 0);
    }, [claimId]);

    const goBackToList = () => {
        navigate('/shop/mypage/claims');
    };

    if (loading) return (
        <MyPageLayout>
            <div className="py-40 text-center text-gray-400 uppercase tracking-widest text-sm">
                Loading Claim...
            </div>
        </MyPageLayout>
    );

    if (error || !claim) return (
        <MyPageLayout>
            <div className="py-20 text-center">
                <p className="text-gray-400 mb-6">클레임 정보를 불러올 수 없습니다.</p>
                <button onClick={goBackToList} className="px-8 py-3 bg-[#333] text-white text-[13px] font-bold hover:bg-black">
                    목록으로 돌아가기
                </button>
            </div>
        </MyPageLayout>
    );

    const statusInfo = CLAIM_STATUS_MAP[claim.claimStatus] || { label: claim.claimStatus, color: 'bg-gray-100 text-gray-500' };

    return (
        <MyPageLayout>

                {/* 상단 헤더 */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-8 gap-4">
                    <div>
                        <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">Claim Detail</h2>
                        <p className="text-gray-400 text-[13px] font-light leading-relaxed">
                            신청일시: <span className="text-[#333] font-medium mr-4">{formatDateTime(claim.requestedAt)}</span>
                            {claim.orderNo && (
                                <>
                                    <br className="md:hidden" />
                                    주문번호: <span className="text-[#968064] font-bold">{claim.orderNo}</span>
                                </>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={goBackToList}
                        className="w-fit text-[12px] text-gray-400 hover:text-black underline underline-offset-4 font-bold transition-colors uppercase tracking-widest"
                    >
                        &larr; Back to List
                    </button>
                </header>

                <div className="flex flex-col gap-8 md:gap-12">

                    {/* 클레임 유형 & 상태 */}
                    <section className="bg-white border border-gray-100 p-6 md:p-8 flex justify-between items-center shadow-sm rounded-sm">
                        <div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1 block">Type</span>
                            <span className={`inline-block px-2.5 py-1 rounded-sm text-[11px] font-bold ${CLAIM_TYPE_STYLE[claim.claimType] || 'bg-gray-100 text-gray-500'}`}>
                                {CLAIM_TYPE_MAP[claim.claimType] || claim.claimType}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1 block">Status</span>
                            <span className={`inline-block px-2.5 py-1 rounded-sm text-[11px] font-bold ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                    </section>

                    {/* 클레임 정보 */}
                    <section>
                        <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] mb-5 border-l-2 border-[#333] pl-3">Claim Info</h3>
                        <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm rounded-sm">
                            <div className="space-y-6">
                                <div>
                                    <span className="block text-[10px] font-bold text-gray-300 uppercase mb-2 tracking-widest">Product</span>
                                    {claim.productName ? (
                                        <p className="text-[14px] md:text-[15px] font-bold">
                                            {claim.productName}
                                            {claim.quantity > 0 && <span className="text-gray-400 font-normal text-[12px] ml-2">x{claim.quantity}</span>}
                                        </p>
                                    ) : claim.orderItems && claim.orderItems.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {claim.orderItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-[13px] py-2 border-b border-gray-50 last:border-0">
                                                    <div>
                                                        <span className="font-bold text-[#333]">{item.productName}</span>
                                                        {item.optionName && <span className="text-gray-400 ml-1">({item.optionName})</span>}
                                                    </div>
                                                    <span className="text-gray-500 shrink-0 ml-3">{item.quantity}개 · {item.pricePerUnit?.toLocaleString()}원</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[14px] md:text-[15px] font-bold">{claim.orderName || '주문 전체'}</p>
                                    )}
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-gray-300 uppercase mb-2 tracking-widest">Reason</span>
                                    <p className="text-[13px] md:text-[14px] font-medium text-gray-600">
                                        {CLAIM_REASON_MAP[claim.claimReason] || claim.claimReason}
                                    </p>
                                </div>
                                {claim.claimReasonDetail && (
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-300 uppercase mb-2 tracking-widest">Detail</span>
                                        <p className="text-[13px] md:text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {claim.claimReasonDetail}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 관리자 메모 (답변) */}
                    {claim.adminMemo && (
                        <section>
                            <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] mb-5 border-l-2 border-[#968064] pl-3">Admin Response</h3>
                            <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm rounded-sm">
                                <p className="text-[13px] md:text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">{claim.adminMemo}</p>
                            </div>
                        </section>
                    )}

                    {/* 환불 정보 */}
                    {(claim.refundType || claim.refundPrice) && (
                        <section>
                            <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] mb-5 border-l-2 border-[#968064] pl-3">Refund Info</h3>
                            <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm rounded-sm">
                                <div className="space-y-4">
                                    {claim.refundType && (
                                        <div className="flex justify-between text-[13px] md:text-[14px]">
                                            <span className="text-gray-500">환불 방식</span>
                                            <span className="font-bold">{claim.refundType}</span>
                                        </div>
                                    )}
                                    {claim.refundPrice != null && (
                                        <div className="flex justify-between text-[13px] md:text-[14px]">
                                            <span className="text-gray-500">환불 금액</span>
                                            <span className="font-black text-[#968064] text-[16px]">{claim.refundPrice?.toLocaleString()}원</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 목록으로 */}
                    <div className="mt-4">
                        <button
                            onClick={goBackToList}
                            className="w-full py-4 md:py-5 border border-gray-200 text-[#333] font-bold text-[12px] md:text-[13px] uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-[0.98]"
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
        </MyPageLayout>
    );
};

export default ClaimDetail;
