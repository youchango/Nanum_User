import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [order, setOrder] = useState(null);

    useEffect(() => {
        // 상세 데이터 Mock-up
        setOrder({
            orderId: orderId,
            orderDate: "2026.02.05 14:30",
            status: "배송중",
            trackingNo: "1234-5678-9012",
            courier: "CJ대한통운",
            deliveryInfo: {
                receiver: "김나눔",
                phone: "010-1234-5678",
                address: "(06043) 서울특별시 강남구 가로수길 15, 3층 나눔빌딩",
                memo: "문 앞에 놓아주시고 벨은 누르지 말아주세요."
            },
            paymentInfo: {
                method: "신용카드 (현대카드 / 4512-****-****-1234)",
                totalPrice: 67800,
                subtotal: 64800,
                shipping: 3000,
                discount: 0
            },
            items: [
                { id: 1, name: "Nanum 쌀 (백미) 10kg", price: 36000, img: "/images/product1.jpg", quantity: 1, category: "식품" },
                { id: 3, name: "내추럴 린넨 에이프런", price: 28800, img: "/images/product3.jpg", quantity: 1, category: "주방/의류" }
            ]
        });
        window.scrollTo(0, 0);
    }, [orderId]);

    const goBackToList = () => {
        navigate('/shop/mypage/orders', { state: location.state });
    };

    // [로직] 배송 조회 외부 연결 활성화
    const handleTracking = () => {
        if (!order?.trackingNo) return;
        const trackingUrl = `https://www.doortodoor.co.kr/parcel/doortodoor.do?f_invc_no=${order.trackingNo}`;
        window.open(trackingUrl, '_blank');
    };

    if (!order) return (
        <div className="py-40 text-center font-sans text-gray-400 uppercase tracking-widest text-sm">
            Loading Order Details...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfcfc] py-10 md:py-20 px-4 md:px-6 font-sans text-[#333]">
            <div className="max-w-[900px] mx-auto">

                {/* 상단 헤더 */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-8 gap-4">
                    <div>
                        <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">Order Detail</h2>
                        <p className="text-gray-400 text-[13px] font-light leading-relaxed">
                            주문일시: <span className="text-[#333] font-medium mr-4">{order.orderDate}</span><br className="md:hidden" />
                            주문번호: <span className="text-[#968064] font-bold">{order.orderId}</span>
                        </p>
                    </div>
                    <button
                        onClick={goBackToList}
                        className="w-fit text-[12px] text-gray-400 hover:text-black underline underline-offset-4 font-bold transition-colors uppercase tracking-widest"
                    >
                        ← Back to List
                    </button>
                </header>

                <div className="flex flex-col gap-12">

                    {/* 📦 현재 주문 상태 요약 */}
                    <section className="bg-white border border-gray-100 p-6 md:p-8 flex justify-between items-center shadow-sm rounded-sm">
                        <div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1 block">Status</span>
                            <h3 className="text-[22px] font-black text-[#333] tracking-tight">{order.status}</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1 block">Tracking</span>
                            <p className="text-[13px] md:text-[14px] font-medium text-gray-600">{order.courier} <span className="hidden sm:inline">|</span> {order.trackingNo}</p>
                        </div>
                    </section>

                    {/* 1. 주문 상품 내역 */}
                    <section>
                        <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] mb-5 border-l-2 border-[#333] pl-3">Ordered Items</h3>
                        <div className="bg-white border border-gray-100 divide-y divide-gray-50 shadow-sm overflow-hidden">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-5 md:p-8 flex items-center gap-6 group">
                                    <Link to={`/shop/product/${item.id}`} className="w-16 h-20 md:w-24 md:h-32 bg-[#f9f9f9] overflow-hidden border border-gray-50 shrink-0">
                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    </Link>
                                    <div className="flex-grow">
                                        <span className="text-[9px] md:text-[10px] text-[#968064] font-bold uppercase tracking-tighter">{item.category}</span>
                                        <Link to={`/shop/product/${item.id}`} className="block text-[14px] md:text-[17px] font-bold mb-1 hover:underline underline-offset-2 transition-colors">
                                            {item.name}
                                        </Link>
                                        <p className="text-[12px] md:text-[13px] text-gray-400 font-light">{item.price.toLocaleString()}원 · {item.quantity}개</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[16px] font-black italic">{(item.price * item.quantity).toLocaleString()}원</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. 상세 정보 영역 (배송지 / 결제 금액) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* 배송 정보 */}
                        <section className="flex flex-col h-full">
                            <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] mb-5">Delivery Info</h3>
                            <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm flex-grow">
                                <div className="space-y-6">
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-300 uppercase mb-2 tracking-widest">Receiver</span>
                                        <p className="text-[14px] md:text-[15px] font-bold">{order.deliveryInfo.receiver} <span className="text-gray-300 font-normal mx-1 md:mx-2">|</span> {order.deliveryInfo.phone}</p>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-300 uppercase mb-2 tracking-widest">Address</span>
                                        <p className="text-[13px] md:text-[14px] leading-relaxed text-gray-600">{order.deliveryInfo.address}</p>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-300 uppercase mb-2 tracking-widest">Memo</span>
                                        <p className="text-[12px] md:text-[13px] text-gray-400 italic font-light leading-relaxed">"{order.deliveryInfo.memo}"</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 결제 요약 */}
                        <section className="flex flex-col h-full">
                            <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] mb-5">Payment Summary</h3>
                            <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm flex-grow">
                                <div className="space-y-4 text-[13px] md:text-[14px]">
                                    <div className="flex justify-between text-gray-500">
                                        <span>상품 합계</span>
                                        <span>{order.paymentInfo.subtotal.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>배송비</span>
                                        <span>+ {order.paymentInfo.shipping.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex justify-between text-[#E23600]">
                                        <span>할인 금액</span>
                                        <span>- {order.paymentInfo.discount.toLocaleString()}원</span>
                                    </div>
                                    <div className="pt-6 border-t border-gray-100 flex justify-between items-end mt-4">
                                        <span className="font-bold text-[14px] md:text-[15px] uppercase tracking-tighter">Total</span>
                                        <span className="text-[20px] md:text-[24px] font-black text-[#968064] leading-none">{order.paymentInfo.totalPrice.toLocaleString()}원</span>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-dashed border-gray-100">
                                        <p className="text-[11px] text-gray-400 text-center font-medium leading-relaxed">{order.paymentInfo.method}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ⭐️ 3. 하단 액션 버튼 그룹 (모바일에서도 가로 3열 정렬) */}
                    <div className="mt-6 grid grid-cols-3 gap-2 md:gap-4">
                        <button
                            onClick={handleTracking}
                            className="py-4 md:py-5 bg-[#333] text-white font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] shadow-sm flex items-center justify-center text-center"
                        >
                            배송 조회
                        </button>

                        <button className="py-4 md:py-5 border border-gray-200 text-[#333] font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center text-center">
                            1:1 문의
                        </button>

                        {order.status === "배송완료" ? (
                            <button className="py-4 md:py-5 border border-[#968064] text-[#968064] font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] hover:bg-orange-50 transition-all flex items-center justify-center text-center">
                                후기 작성
                            </button>
                        ) : (
                            <button className="py-4 md:py-5 border border-red-100 text-red-400 font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] hover:bg-red-50 transition-all flex items-center justify-center text-center">
                                주문 취소
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetail;