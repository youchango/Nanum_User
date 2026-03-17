import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, removeItems, fetchCart } = useCart();

    const [orderItems, setOrderItems] = useState([]);

    useEffect(() => {
        let items = location.state?.orderItems;
        if (location.state?.directOrderData) {
            items = location.state.directOrderData.orderItems;
        }

        if (!items || items.length === 0) {
            setOrderItems(cartItems);
        } else {
            setOrderItems(items);
        }
    }, [location.state, cartItems]);

    const [paymentMethod, setPaymentMethod] = useState('신용카드');

    const subtotal = orderItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    const [discountPrice] = useState(0);
    const shippingPrice = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;
    const totalPrice = Math.max(0, subtotal + shippingPrice - discountPrice);

    const handlePayment = async () => {
        if (orderItems.length === 0) {
            alert('결제할 상품이 없습니다.');
            return;
        }

        if (window.confirm(`${totalPrice.toLocaleString()}원을 결제하시겠습니까?`)) {
            alert('결제가 완료되었습니다!');
            // 장바구니에서 주문한 상품 삭제 (cartId가 있는 경우만)
            const cartIdsToRemove = orderItems
                .map(item => item.cartId)
                .filter(Boolean);
            if (cartIdsToRemove.length > 0) {
                await removeItems(cartIdsToRemove);
            }
            navigate('/shop/mypage/orders');
        }
    };

    return (
        <div className="w-full bg-[#fcfcfc] pb-20 font-sans">
            <section className="py-12 md:py-16 px-6">
                <div className="max-w-[1100px] mx-auto text-center">
                    <h2 className="text-[28px] md:text-[36px] font-medium text-[#333] mb-2 uppercase tracking-tight text-center">주문/결제</h2>
                    <p className="text-[#888] text-sm font-light uppercase tracking-widest italic text-center">Order & Payment</p>
                </div>
            </section>

            <div className="max-w-[1100px] mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-10">
                {/* 왼쪽: 배송 및 주문 정보 */}
                <div className="flex-[1.5] flex flex-col gap-8 md:gap-10">

                    {/* 주문 상품 요약 */}
                    <section className="bg-white p-5 md:p-8 border border-gray-100 shadow-sm rounded-sm">
                        <h3 className="text-base md:text-lg font-bold text-[#333] mb-6 border-b pb-4">주문 상품 정보 ({orderItems.length})</h3>
                        <div className="flex flex-col gap-6">
                            {orderItems.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="flex items-center gap-4 md:gap-6 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                    <div className="w-20 h-24 bg-[#f9f9f9] flex-shrink-0 border border-gray-100 overflow-hidden">
                                        <img
                                            src={item.image || item.img || '/images/no-image.jpg'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-[14px] md:text-[15px] font-bold text-[#333] mb-1">{item.name}</h4>
                                        <p className="text-[12px] text-gray-400">수량: {item.quantity}개</p>
                                        <p className="text-[14px] font-bold text-[#968064] mt-1">{(item.price * item.quantity).toLocaleString()}원</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 배송지 정보 (주소 찾기 버튼 수정됨) */}
                    <section className="bg-white p-5 md:p-8 border border-gray-100 shadow-sm rounded-sm">
                        <h3 className="text-base md:text-lg font-bold text-[#333] mb-6 border-b pb-4">배송지 정보</h3>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider ml-1">Receiver</label>
                                <input type="text" className="w-full border border-gray-200 px-4 py-3 text-sm focus:border-[#333] outline-none transition-all bg-[#fafafa] focus:bg-white h-[48px]" placeholder="받는 분 성함을 입력해주세요" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider ml-1">Contact</label>
                                <input type="text" className="w-full border border-gray-200 px-4 py-3 text-sm focus:border-[#333] outline-none transition-all bg-[#fafafa] focus:bg-white h-[48px]" placeholder="010-0000-0000" />
                            </div>

                            {/* 🏠 주소 입력 영역 최적화 */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider ml-1">Address</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-grow border border-gray-200 px-4 py-3 text-sm bg-gray-100 text-gray-400 outline-none h-[48px] min-w-0"
                                        placeholder="우편번호"
                                        readOnly
                                    />
                                    <button
                                        type="button"
                                        className="px-4 md:px-6 bg-[#333] text-white text-[12px] font-bold whitespace-nowrap hover:bg-black transition-colors h-[48px] shrink-0 active:scale-95"
                                    >
                                        주소 찾기
                                    </button>
                                </div>
                                <input type="text" className="w-full border border-gray-200 px-4 py-3 text-sm bg-[#fafafa] h-[48px] focus:bg-white focus:border-[#333] outline-none transition-all" placeholder="기본 주소" />
                                <input type="text" className="w-full border border-gray-200 px-4 py-3 text-sm h-[48px] focus:border-[#333] outline-none transition-all" placeholder="상세 주소를 입력해주세요" />
                            </div>
                        </div>
                    </section>

                    {/* 결제 수단 */}
                    <section className="bg-white p-5 md:p-8 border border-gray-100 shadow-sm rounded-sm">
                        <h3 className="text-base md:text-lg font-bold text-[#333] mb-6 border-b pb-4">결제 수단</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['신용카드', '가상계좌', '무통장입금', '카카오페이'].map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-3.5 text-[11px] md:text-[12px] font-bold border transition-all ${paymentMethod === method ? 'border-[#333] bg-[#333] text-white' : 'border-gray-200 text-[#aaa] hover:border-gray-300 bg-white'}`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* 오른쪽: 주문 요약 Sticky */}
                <div className="flex-1">
                    <div className="lg:sticky lg:top-28 bg-white border border-[#333] p-6 md:p-8 shadow-xl rounded-sm mt-4 lg:mt-0">
                        <h3 className="text-base md:text-lg font-bold text-[#333] mb-8 uppercase tracking-widest border-b pb-4 text-center lg:text-left">Order Summary</h3>
                        <div className="flex flex-col gap-5 text-sm">
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>주문 합계</span>
                                <span>{subtotal.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>배송비</span>
                                <span>{shippingPrice > 0 ? `+ ${shippingPrice.toLocaleString()}원` : '무료 배송'}</span>
                            </div>
                            {discountPrice > 0 && (
                                <div className="flex justify-between text-[#E23600] font-medium">
                                    <span>할인 금액</span>
                                    <span>- {discountPrice.toLocaleString()}원</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-8 border-t border-gray-100 mt-4">
                                <span className="font-bold text-gray-800 text-base">최종 결제 금액</span>
                                <span className="text-[24px] md:text-[28px] font-black text-[#968064]">{totalPrice.toLocaleString()}원</span>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-5">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input type="checkbox" className="mt-1 accent-[#333] w-4 h-4 shrink-0" />
                                <span className="text-[11px] text-gray-400 group-hover:text-gray-600 transition-colors leading-relaxed">
                                    주문 내용을 확인하였으며, 정보 제공 및 결제 진행에 동의합니다. (필수)
                                </span>
                            </label>
                            <button
                                onClick={handlePayment}
                                className="w-full py-5 bg-[#333] text-white font-bold text-base hover:bg-black transition-all active:scale-95 shadow-lg"
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