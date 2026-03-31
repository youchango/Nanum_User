import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import orderService from '../api/orderService';
import { formatDateTime } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';
import type { Order, OrderItem } from '../types/order';
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '../constants/statusMaps';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError(false);
            try {
                if (!orderId) throw new Error('주문 번호가 없습니다.');
                const res = await orderService.getOrder(orderId);
                const data = res.data;
                if (!data) throw new Error('주문 데이터가 없습니다.');

                setOrder({
                    orderId: data.orderId,
                    orderNo: data.orderNo,
                    orderName: data.orderName,
                    orderDate: formatDateTime(data.createdAt),
                    status: data.status,
                    statusText: (ORDER_STATUS_MAP as any)[data.status] || data.status,
                    trackingNo: data.trackingNumber || '',
                    deliveryInfo: {
                        receiver: data.receiverName,
                        phone: data.receiverPhone,
                        address: data.receiverZipcode
                            ? `(${data.receiverZipcode}) ${data.receiverAddress} ${data.receiverDetail || ''}`
                            : `${data.receiverAddress || ''} ${data.receiverDetail || ''}`,
                        memo: data.deliveryMemo || ''
                    },
                    paymentInfo: {
                        method: (PAYMENT_METHOD_MAP as any)[data.paymentMethod || ''] || data.paymentMethod || '',
                        paymentStatus: data.paymentStatus || '',
                        totalPrice: data.paymentPrice || 0,
                        subtotal: data.totalPrice || 0,
                        shipping: data.deliveryPrice || 0,
                        discount: Math.max(0, (data.totalPrice || 0) + (data.deliveryPrice || 0) - (data.paymentPrice || 0))
                    },
                    items: (data.items || []).map((item) => ({
                        id: item.productId,
                        productId: String(item.productId),
                        productName: item.productName,
                        optionName: item.optionName,
                        price: item.pricePerUnit || 0,
                        quantity: item.quantity,
                        totalPrice: item.totalPrice || 0,
                    }))
                });
            } catch (err: any) {
                console.error('주문 상세 조회 실패:', err);
                setOrder(null);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
        window.scrollTo(0, 0);
    }, [orderId]);

    const goBackToList = () => {
        navigate('/shop/mypage/orders', { state: location.state });
    };

    const handleTracking = () => {
        if (!order?.trackingNo) return;
        const trackingUrl = `https://www.doortodoor.co.kr/parcel/doortodoor.do?f_invc_no=${order.trackingNo}`;
        window.open(trackingUrl, '_blank');
    };

    if (loading) return (
        <MyPageLayout>
            <div className="py-40 text-center text-gray-400 uppercase tracking-widest text-sm">
                Loading Order Details...
            </div>
        </MyPageLayout>
    );

    if (error || !order) return (
        <MyPageLayout>
            <div className="py-20 text-center">
                <p className="text-gray-400 mb-6">주문 정보를 불러올 수 없습니다.</p>
                <button onClick={goBackToList} className="px-8 py-3 bg-[#333] text-white text-[13px] font-bold hover:bg-black">
                    목록으로 돌아가기
                </button>
            </div>
        </MyPageLayout>
    );

    const isDelivered = order.status === 'DELIVERED';
    const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';
    const canCancel = order.status === 'PAYMENT_WAIT' || order.status === 'PREPARING';
    const hasTracking = !!order.trackingNo;

    const handleCancel = async () => {
        if (!order) return;
        if (!window.confirm('주문을 취소하시겠습니까?')) return;
        try {
            await orderService.cancelOrder(order.orderId || orderId || '');
            alert('주문이 취소되었습니다.');
            // 상태 갱신
            setOrder((prev: any) => ({
                ...prev,
                status: 'CANCELLED',
                statusText: '취소됨',
            }));
        } catch (e: any) {
            const msg = e.response?.data?.message || '주문 취소에 실패했습니다.';
            alert(msg);
        }
    };

    return (
        <MyPageLayout>
                {/* 상단 헤더 */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-8 gap-4">
                    <div>
                        <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">Order Detail</h2>
                        <p className="text-gray-400 text-[13px] font-light leading-relaxed">
                            주문일시: <span className="text-[#333] font-medium mr-4">{order.orderDate}</span><br className="md:hidden" />
                            주문번호: <span className="text-[#968064] font-bold">{order.orderNo}</span>
                        </p>
                    </div>
                    <button
                        onClick={goBackToList}
                        className="w-fit text-[12px] text-gray-400 hover:text-black underline underline-offset-4 font-bold transition-colors uppercase tracking-widest"
                    >
                        &larr; Back to List
                    </button>
                </header>

                <div className="flex flex-col gap-12">

                    {/* 현재 주문 상태 요약 */}
                    <section className="bg-white border border-gray-100 p-6 md:p-8 flex justify-between items-center shadow-sm rounded-sm">
                        <div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1 block">Status</span>
                            <h3 className="text-[22px] font-black text-[#333] tracking-tight">{order.statusText}</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1 block">Tracking</span>
                            <p className="text-[13px] md:text-[14px] font-medium text-gray-600">
                                {hasTracking
                                    ? <>{order.trackingNo}</>
                                    : <span className="text-gray-300 italic">운송장 미등록</span>
                                }
                            </p>
                        </div>
                    </section>

                    {/* 1. 주문 상품 내역 */}
                    <section>
                        <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] mb-5 border-l-2 border-[#333] pl-3">Ordered Items</h3>
                        <div className="bg-white border border-gray-100 divide-y divide-gray-50 shadow-sm overflow-hidden">
                            {(order.items || []).map((item: OrderItem, idx: number) => (
                                <div key={idx} className="p-5 md:p-8 flex items-center gap-6 group">
                                    <Link to={`/shop/product/${item.id}`} className="w-16 h-20 md:w-24 md:h-32 bg-[#f9f9f9] overflow-hidden border border-gray-50 shrink-0 flex items-center justify-center">
                                        <span className="text-[10px] text-gray-300 text-center px-1">No Image</span>
                                    </Link>
                                    <div className="flex-grow">
                                        <Link to={`/shop/product/${item.productId}`} className="block text-[14px] md:text-[17px] font-bold mb-1 hover:underline underline-offset-2 transition-colors">
                                            {item.productName}
                                            {item.optionName && <span className="text-gray-400 font-normal text-[12px] ml-2">({item.optionName})</span>}
                                        </Link>
                                        <p className="text-[12px] md:text-[13px] text-gray-400 font-light">{(item.price || 0).toLocaleString()}원 · {item.quantity}개</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[16px] font-black italic">{(item.totalPrice || (item.price || 0) * item.quantity).toLocaleString()}원</p>
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
                                        <p className="text-[12px] md:text-[13px] text-gray-400 italic font-light leading-relaxed">
                                            {order.deliveryInfo.memo ? `"${order.deliveryInfo.memo}"` : '-'}
                                        </p>
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
                                        <span>{order.paymentInfo.shipping > 0 ? `+ ${order.paymentInfo.shipping.toLocaleString()}원` : '무료 배송'}</span>
                                    </div>
                                    {order.paymentInfo.discount > 0 && (
                                        <div className="flex justify-between text-[#E23600]">
                                            <span>할인 금액</span>
                                            <span>- {order.paymentInfo.discount.toLocaleString()}원</span>
                                        </div>
                                    )}
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

                    {/* 3. 하단 액션 버튼 그룹 */}
                    <div className="mt-6 grid grid-cols-3 gap-2 md:gap-4">
                        {/* 1. 주문 목록 / 주문 취소 */}
                        {isCancelled ? (
                            <button disabled className="py-4 md:py-5 border border-gray-100 text-gray-300 font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] cursor-not-allowed flex items-center justify-center text-center">
                                취소 완료
                            </button>
                        ) : canCancel ? (
                            <button onClick={handleCancel} className="py-4 md:py-5 border border-red-100 text-red-400 font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] hover:bg-red-50 transition-all flex items-center justify-center text-center">
                                주문 취소
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/shop/mypage/orders')}
                                className="py-4 md:py-5 border border-gray-200 text-[#333] font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center text-center"
                            >
                                주문 목록
                            </button>
                        )}

                        {/* 2. 배송 조회 */}
                        <button
                            onClick={handleTracking}
                            disabled={!hasTracking}
                            className={`py-4 md:py-5 font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] transition-all active:scale-[0.98] shadow-sm flex items-center justify-center text-center ${
                                hasTracking
                                    ? 'bg-[#333] text-white hover:bg-black'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            배송 조회
                        </button>

                        {/* 3. 교환/반품/환불 (배송완료) or 1:1 문의 */}
                        {isDelivered ? (
                            <button
                                onClick={() => navigate('/shop/mypage/claim/new', {
                                    state: { orderId: order.orderId, orderNo: order.orderNo, items: order.items }
                                })}
                                className="py-4 md:py-5 border border-gray-200 text-[#333] font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center text-center"
                            >
                                교환/반품/환불
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/shop/mypage/inquiry/new', {
                                    state: { orderNo: order.orderNo, orderId: order.orderId }
                                })}
                                className="py-4 md:py-5 border border-gray-200 text-[#333] font-bold text-[10px] md:text-[13px] uppercase tracking-tighter md:tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center text-center"
                            >
                                1:1 문의
                            </button>
                        )}
                    </div>

                </div>
        </MyPageLayout>
    );
};

export default OrderDetail;
