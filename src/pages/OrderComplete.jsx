import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const OrderComplete = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const order = location.state;

    if (!order) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center font-sans">
                <div className="text-center">
                    <p className="text-gray-400 mb-6">주문 정보를 찾을 수 없습니다.</p>
                    <button onClick={() => navigate('/shop/main')} className="px-8 py-3 bg-[#333] text-white text-[13px] font-bold hover:bg-black">메인으로</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] py-16 md:py-24 px-4 font-sans text-[#333]">
            <div className="max-w-[600px] mx-auto">

                {/* 완료 아이콘 + 메시지 */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-[#333] rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                        </svg>
                    </div>
                    <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight mb-3">주문이 완료되었습니다</h2>
                    <p className="text-gray-400 text-[14px] font-light">주문해주셔서 감사합니다. 아래에서 주문 내역을 확인하세요.</p>
                </div>

                {/* 주문 정보 카드 */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-sm p-6 md:p-8 mb-6">
                    <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <span className="text-[12px] text-gray-400 uppercase tracking-widest font-bold">주문번호</span>
                            <span className="text-[15px] font-bold text-[#968064]">{order.orderNo || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-[13px] text-gray-500">주문 상품</span>
                            <span className="text-[13px] font-medium text-[#333]">{order.orderName || '-'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-[13px] text-gray-500">결제 금액</span>
                            <span className="text-[16px] font-bold text-[#333]">{order.paymentPrice?.toLocaleString() || 0}원</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-[13px] text-gray-500">결제 수단</span>
                            <span className="text-[13px] text-[#333]">{order.paymentMethod || '-'}</span>
                        </div>

                        {order.receiverName && (
                            <div className="pt-4 border-t border-gray-100">
                                <span className="text-[12px] text-gray-400 uppercase tracking-widest font-bold block mb-3">배송지</span>
                                <p className="text-[13px] text-[#333] font-medium">{order.receiverName} <span className="text-gray-400 font-normal">{order.receiverPhone}</span></p>
                                <p className="text-[12px] text-gray-500 mt-1">({order.zipcode}) {order.address} {order.addressDetail}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 안내 메시지 */}
                <div className="bg-[#f8f5f2] border border-gray-100 rounded-sm p-5 mb-8">
                    <p className="text-[12px] text-[#968064] font-medium leading-relaxed">
                        주문 상태는 마이페이지 &gt; 주문/배송 조회에서 확인하실 수 있습니다.
                        배송 관련 문의사항은 1:1 문의를 이용해주세요.
                    </p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(`/shop/mypage/order/${order.orderId}`)}
                        className="flex-1 py-4 bg-[#343434] text-white font-bold text-[14px] hover:bg-black transition-all shadow-md active:scale-[0.98] rounded-sm"
                    >
                        주문 상세 보기
                    </button>
                    <Link
                        to="/shop/products"
                        className="flex-1 py-4 border border-gray-200 text-[#666] font-bold text-[14px] text-center hover:bg-gray-50 transition-all rounded-sm"
                    >
                        쇼핑 계속하기
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderComplete;
