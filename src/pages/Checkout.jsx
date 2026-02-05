import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems } = useCart();

    // ⭐️ [로직] 넘어온 데이터(선택구매/바로구매)가 있으면 그걸 쓰고, 없으면 장바구니 전체 사용
    const orderItems = location.state?.orderItems || cartItems;

    const [paymentMethod, setPaymentMethod] = useState('신용카드');

    // [계산] 주문 금액
    const subtotal = orderItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

    // [계산] 할인 금액 (나중에 쿠폰이나 적립금 선택 시 상태값으로 관리 가능)
    // 일단은 0원으로 두거나, 테스트를 위해 임의의 값을 넣어보세요.
    const [discountPrice, setDiscountPrice] = useState(0);

    // [계산] 배송비 환경설정에서 가져오기
    const shippingPrice = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;

    // [계산] 최종 결제 금액 (주문금액 + 배송비 - 할인금액)
    // 단, 합계가 0원보다 작아지지 않도록 처리합니다.
    const totalPrice = Math.max(0, subtotal + shippingPrice - discountPrice);

    const handlePayment = () => {
        if (orderItems.length === 0) {
            alert('결제할 상품이 없습니다.');
            return;
        }
        alert(`${totalPrice.toLocaleString()}원 결제가 완료되었습니다!`);
        // 결제 성공 시 로직 (예: 장바구니 비우기 등)
        navigate('/shop/main');
    };

    return (
        <div className="w-full bg-[#fcfcfc] pb-20">
            {/* 상단 타이틀 */}
            <section className="py-12 md:py-16 px-6">
                <div className="max-w-[1100px] mx-auto text-center">
                    <h2 className="text-[28px] md:text-[36px] font-medium text-[#333] mb-2 uppercase tracking-tight">주문/결제</h2>
                    <p className="text-[#888] text-sm font-light uppercase tracking-widest">ORDER & PAYMENT</p>
                </div>
            </section>

            <div className="max-w-[1100px] mx-auto px-6 flex flex-col lg:flex-row gap-10">

                {/* 왼쪽: 배송 및 주문 정보 입력 */}
                <div className="flex-[1.5] flex flex-col gap-10">

                    {/* ⭐️ 동적 주문 상품 요약 */}
                    <section className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-[#333] mb-6 border-b pb-4">주문 상품 정보 ({orderItems.length})</h3>
                        <div className="flex flex-col gap-6">
                            {orderItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                    <div className="w-20 h-24 bg-[#f9f9f9] flex-shrink-0 border border-gray-100 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={item.image || item.img || '/images/no-image.jpg'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-[15px] font-medium text-[#333]">{item.name}</h4>
                                        <p className="text-[13px] text-gray-400 mt-1">수량: {item.quantity}개</p>
                                        <p className="text-[14px] font-bold text-[#968064] mt-1">{(item.price * item.quantity).toLocaleString()}원</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 배송지 정보 (기존과 동일) */}
                    <section className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-[#333] mb-6 border-b pb-4">배송지 정보</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-[#666]">받는 분</label>
                                <input type="text" className="w-full border border-gray-200 px-4 py-3 text-sm focus:border-[#333] outline-none transition-all" placeholder="이름을 입력해주세요" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-[#666]">연락처</label>
                                <input type="text" className="w-full border border-gray-200 px-4 py-3 text-sm focus:border-[#333] outline-none transition-all" placeholder="010-0000-0000" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-[#666]">주소</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" className="flex-grow border border-gray-200 px-4 py-3 text-sm bg-gray-50" placeholder="우편번호" readOnly />
                                    <button className="px-4 py-3 bg-[#333] text-white text-xs font-bold whitespace-nowrap">주소찾기</button>
                                </div>
                                <input type="text" className="w-full border border-gray-200 px-4 py-3 text-sm mb-2" placeholder="기본 주소" />
                                <input type="text" className="w-full border border-gray-200 px-4 py-3 text-sm" placeholder="상세 주소 입력" />
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                <label className="text-[13px] font-bold text-[#666]">배송 요청사항</label>
                                <select className="w-full border border-gray-200 px-4 py-3 text-sm outline-none">
                                    <option>배송 메시지를 선택해주세요</option>
                                    <option>부재 시 문 앞에 놓아주세요</option>
                                    <option>배송 전 미리 연락주세요</option>
                                    <option>직접 입력</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* 결제 수단 선택 */}
                    <section className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm mb-10">
                        <h3 className="text-lg font-bold text-[#333] mb-6 border-b pb-4">결제 수단</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['신용카드', '가상계좌', '무통장입금', '카카오페이'].map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-3 text-xs font-medium border transition-all ${paymentMethod === method ? 'border-[#333] bg-[#333] text-white' : 'border-gray-200 text-[#888] hover:border-gray-400'}`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* 오른쪽: 최종 결제 금액 및 결제 버튼 (Sticky) */}
                <div className="flex-1">
                    <div className="sticky top-28 bg-white border border-[#333] p-6 md:p-8 shadow-lg">
                        <h3 className="text-lg font-bold text-[#333] mb-6">최종 결제 금액</h3>
                        <div className="flex flex-col gap-4 text-sm text-[#666]">
                            <div className="flex justify-between">
                                <span>주문 금액</span>
                                <span className="text-[#333] font-medium">{subtotal.toLocaleString()}원</span>
                            </div>

                            {/* ⭐️ 배송비가 0원보다 클 때만 표시, 0원이면 '무료'라고 표시하거나 아예 숨김 */}
                            <div className="flex justify-between">
                                <span>배송비</span>
                                <span className="text-[#333] font-medium">
                                  {shippingPrice > 0 ? `+ ${shippingPrice.toLocaleString()}원` : '무료'}
                                </span>
                            </div>

                            {/* ⭐️ 할인 금액이 0원보다 클 때만 라인 자체가 노출되도록 설정 */}
                            {discountPrice > 0 && (
                            <div className="flex justify-between">
                                <span>할인 금액</span>
                                <span className="text-[#E23600] font-medium">- {discountPrice.toLocaleString()}원</span>
                            </div>
                            )}

                            <div className="flex justify-between items-end pt-6 border-t border-gray-100 mt-2 text-[#333]">
                                <span className="font-bold text-base">총 결제 금액</span>
                                <span className="text-2xl font-extrabold text-[#968064]">{totalPrice.toLocaleString()}원</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-4">
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <input type="checkbox" className="mt-1 accent-[#333]" />
                                <span className="text-[11px] text-[#888] group-hover:text-[#666] transition-colors leading-tight">
                                    구매조건 확인 및 결제진행에 동의하며, 개인정보 수집 및 이용에 동의합니다. (필수)
                                </span>
                            </label>
                            <button
                                onClick={handlePayment}
                                className="w-full py-5 bg-[#333] text-white font-bold text-base hover:bg-black transition-all active:scale-[0.98]"
                            >
                                {totalPrice.toLocaleString()}원 결제하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;