import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import claimService from '../api/claimService';
import MyPageLayout from '../components/MyPageLayout';
import { CLAIM_REASON_MAP } from '../constants/statusMaps';

const CLAIM_TYPES = [
    { value: 'EXCHANGE', label: '교환' },
    { value: 'RETURN', label: '반품' },
    { value: 'REFUND', label: '환불' },
];

const CLAIM_REASONS = Object.entries(CLAIM_REASON_MAP).map(([value, label]) => ({ value, label }));

const ClaimCreate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId, orderNo, items = [] } = location.state || {};

    const [selectedItems, setSelectedItems] = useState(
        items.map(item => ({ ...item, checked: true, claimQty: item.quantity }))
    );
    const [claimType, setClaimType] = useState('');
    const [claimReason, setClaimReason] = useState('');
    const [claimReasonDetail, setClaimReasonDetail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const toggleItem = (idx) => {
        setSelectedItems(prev => prev.map((item, i) =>
            i === idx ? { ...item, checked: !item.checked } : item
        ));
    };

    const updateQty = (idx, qty) => {
        setSelectedItems(prev => prev.map((item, i) =>
            i === idx ? { ...item, claimQty: Math.max(1, Math.min(qty, item.quantity)) } : item
        ));
    };

    const checkedItems = selectedItems.filter(item => item.checked);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!orderId) {
            alert('주문 정보가 없습니다. 주문 상세에서 신청해주세요.');
            return;
        }
        if (checkedItems.length === 0) {
            alert('대상 상품을 선택해주세요.');
            return;
        }
        if (!claimType) {
            alert('클레임 유형을 선택해주세요.');
            return;
        }
        if (!claimReason) {
            alert('사유를 선택해주세요.');
            return;
        }
        if (claimReasonDetail.trim().length < 10) {
            alert('상세 사유를 10자 이상 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            // 선택된 상품별로 각각 클레임 신청
            for (const item of checkedItems) {
                await claimService.createClaim({
                    orderId,
                    orderDetailId: item.orderDetailId || null,
                    claimType,
                    claimReason,
                    claimReasonDetail: claimReasonDetail.trim(),
                    quantity: item.claimQty,
                });
            }
            alert(`${checkedItems.length}건의 클레임이 신청되었습니다.`);
            navigate('/shop/mypage/claims');
        } catch (err) {
            const msg = err.response?.data?.message || '클레임 신청에 실패했습니다.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MyPageLayout>
                <header className="mb-8 md:mb-10">
                    <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">New Claim</h2>
                    <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">
                        교환/반품/환불을 신청합니다.
                        {orderNo && <span className="ml-2 text-[#968064] font-medium not-italic">주문번호: {orderNo}</span>}
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-sm p-6 md:p-10 rounded-sm">
                    <div className="flex flex-col gap-6 md:gap-8">

                        {/* 상품 선택 (체크박스) */}
                        {selectedItems.length > 0 && (
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    대상 상품 선택 <span className="text-[#968064]">({checkedItems.length}/{selectedItems.length})</span>
                                </label>
                                <div className="flex flex-col gap-2">
                                    {selectedItems.map((item, idx) => (
                                        <div key={idx} className={`border rounded-sm transition-all ${item.checked ? 'border-[#333] bg-[#fafaf5]' : 'border-gray-200 bg-white'}`}>
                                            <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={() => toggleItem(idx)}
                                                    className="w-4 h-4 accent-[#333] shrink-0"
                                                />
                                                <div className="flex-grow">
                                                    <span className="text-[13px] font-bold text-[#333]">{item.productName || item.name}</span>
                                                    {item.optionName && <span className="text-[12px] text-gray-400 ml-2">({item.optionName})</span>}
                                                    <p className="text-[12px] text-gray-500 mt-0.5">
                                                        주문 수량: {item.quantity}개 · {(item.pricePerUnit || item.price)?.toLocaleString()}원
                                                    </p>
                                                </div>
                                            </label>
                                            {item.checked && (
                                                <div className="px-4 pb-3 flex items-center gap-2">
                                                    <span className="text-[11px] text-gray-400">신청 수량:</span>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={item.quantity}
                                                        value={item.claimQty}
                                                        onChange={(e) => updateQty(idx, parseInt(e.target.value) || 1)}
                                                        className="w-20 border border-gray-200 px-3 py-1.5 text-[13px] outline-none focus:border-[#333] text-center"
                                                    />
                                                    <span className="text-[11px] text-gray-400">/ {item.quantity}개</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 클레임 유형 */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">클레임 유형</label>
                            <div className="flex gap-3">
                                {CLAIM_TYPES.map((t) => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setClaimType(t.value)}
                                        className={`flex-1 py-3 border text-[13px] font-bold transition-all ${
                                            claimType === t.value
                                                ? 'border-[#333] bg-[#333] text-white'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-[#f9f9f9]'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 사유 */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">사유</label>
                            <select
                                value={claimReason}
                                onChange={(e) => setClaimReason(e.target.value)}
                                className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f9f9f9] focus:bg-white focus:border-[#333] transition-colors appearance-none"
                            >
                                <option value="">선택해주세요</option>
                                {CLAIM_REASONS.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* 상세 사유 */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">상세 사유</label>
                            <textarea
                                value={claimReasonDetail}
                                onChange={(e) => setClaimReasonDetail(e.target.value)}
                                placeholder="상세 사유를 입력해주세요 (최소 10자)"
                                rows={6}
                                className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f9f9f9] focus:bg-white focus:border-[#333] transition-colors resize-none leading-relaxed"
                            />
                            <p className="text-[11px] text-gray-300 mt-1 text-right">{claimReasonDetail.length}자</p>
                        </div>

                        {/* 버튼 */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-4 border border-gray-200 text-[#333] text-[12px] font-bold hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || checkedItems.length === 0}
                                className={`flex-1 py-4 text-white text-[12px] font-bold transition-all active:scale-95 uppercase tracking-widest ${
                                    submitting || checkedItems.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#333] hover:bg-black'
                                }`}
                            >
                                {submitting ? '신청 중...' : `${checkedItems.length}건 신청하기`}
                            </button>
                        </div>
                    </div>
                </form>
        </MyPageLayout>
    );
};

export default ClaimCreate;
