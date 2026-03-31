import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import orderService from '../api/orderService';
import addressService from '../api/addressService';
import pointService from '../api/pointService';
import couponService from '../api/couponService';
import taxBillService from '../api/taxBillService';
import usePostcode from '../hooks/usePostcode';
import { PAYMENT_METHOD_REVERSE_MAP } from '../constants/statusMaps';
import { requestPgPayment } from '../utils/pgPayment';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, fetchCart } = useCart();
    const { openPostcode } = usePostcode();

    const [orderItems, setOrderItems] = useState<any[]>([]);

    // Form state
    const [receiverName, setReceiverName] = useState('');
    const [receiverPhone, setReceiverPhone] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [address, setAddress] = useState('');
    const [addressDetail, setAddressDetail] = useState('');
    const [deliveryMemo, setDeliveryMemo] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('신용카드');
    const [agreement, setAgreement] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Address book state
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Tax bill state
    const [taxBillType, setTaxBillType] = useState<string>('NONE'); // NONE, TAX_BILL, CASH_RECEIPT
    const [taxInfo, setTaxInfo] = useState<any>(null);
    const [cashInfo, setCashInfo] = useState<any>(null);
    const [taxFormEditing, setTaxFormEditing] = useState<boolean>(false);
    const [taxForm, setTaxForm] = useState({
        bizRegNum: '', bizName: '', bizRepName: '', bizCategory: '', bizDetailCategory: '', bizAddress: '', bizEmail: '', bizMobile: '',
    });
    const [cashForm, setCashForm] = useState({
        purposeType: 'INCOME_DEDUCTION', identifyNumber: '',
    });

    // Point & Coupon state
    const [pointBalance, setPointBalance] = useState<number>(0);
    const [usedPoint, setUsedPoint] = useState<number>(0);
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
    const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
    const [couponDiscount, setCouponDiscount] = useState<number>(0);

    const fillFormWithAddress = (addr: any) => {
        setReceiverName(addr.receiverName || '');
        setReceiverPhone(addr.receiverPhone || '');
        setZipcode(addr.zipcode || '');
        setAddress(addr.address || '');
        setAddressDetail(addr.addressDetail || '');
    };

    const handleSelectAddress = (addr: any) => {
        setSelectedAddressId(addr.id);
        fillFormWithAddress(addr);
        setShowAddressModal(false);
    };

    const fillFormFromLocalStorage = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.name) setReceiverName(user.name);
                if (user.phone) setReceiverPhone(user.phone);
                if (user.zipcode) setZipcode(user.zipcode);
                if (user.address) setAddress(user.address);
                if (user.addressDetail) setAddressDetail(user.addressDetail);
            }
        } catch (e) { /* ignore */ }
    };

    const handleManualEntry = () => {
        setSelectedAddressId(null);
        setReceiverName('');
        setReceiverPhone('');
        setZipcode('');
        setAddress('');
        setAddressDetail('');
        setShowAddressModal(false);
    };

    // Fetch point balance & available coupons
    useEffect(() => {
        const loadPointsAndCoupons = async () => {
            try {
                const [pointRes, couponRes] = await Promise.allSettled([
                    pointService.getBalance(),
                    couponService.getAvailable(),
                ]);
                if (pointRes.status === 'fulfilled') setPointBalance((pointRes.value as any).data ?? 0);
                if (couponRes.status === 'fulfilled') setAvailableCoupons((couponRes.value as any).data || []);
            } catch (err) {
                console.error('포인트/쿠폰 로드 실패:', err);
            }
        };
        loadPointsAndCoupons();
    }, []);

    // Fetch saved addresses and pre-fill with default
    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const res = await addressService.getAddresses();
                const addresses = res.data || [];
                setSavedAddresses(addresses);

                const defaultAddr = addresses.find(a => a.isDefault === true);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                    fillFormWithAddress(defaultAddr);
                } else {
                    fillFormFromLocalStorage();
                }
            } catch (e) {
                fillFormFromLocalStorage();
            }
        };
        loadAddresses();
    }, []);

    // Load saved tax info when bill type selected
    const [savedTaxInfoList, setSavedTaxInfoList] = useState<any[]>([]);
    const [showTaxInfoModal, setShowTaxInfoModal] = useState<boolean>(false);
    const [taxModalEditId, setTaxModalEditId] = useState<number | string | null>(null); // null=목록, id=수정
    const [taxModalForm, setTaxModalForm] = useState({ bizRegNum: '', bizName: '', bizRepName: '', bizCategory: '', bizDetailCategory: '', bizAddress: '', bizEmail: '', bizMobile: '', damName: '' });

    const openTaxInfoModal = () => {
        setTaxModalEditId(null);
        setShowTaxInfoModal(true);
    };

    const startTaxEdit = (info: any) => {
        setTaxModalEditId(info.id);
        setTaxModalForm({
            bizRegNum: info.bizRegNum || '', bizName: info.bizName || '', bizRepName: info.bizRepName || '',
            bizCategory: info.bizCategory || '', bizDetailCategory: info.bizDetailCategory || '',
            bizAddress: info.bizAddress || '', bizEmail: info.bizEmail || '', bizMobile: info.bizMobile || '', damName: info.damName || '',
        });
    };

    const startTaxCreate = () => {
        setTaxModalEditId('new');
        setTaxModalForm({ bizRegNum: '', bizName: '', bizRepName: '', bizCategory: '', bizDetailCategory: '', bizAddress: '', bizEmail: '', bizMobile: '', damName: '' });
    };

    const handleTaxModalSave = async () => {
        if (!taxModalForm.bizRegNum.trim() || !taxModalForm.bizName.trim() || !taxModalForm.bizRepName.trim()) {
            alert('사업자등록번호, 상호명, 대표자명은 필수입니다.');
            return;
        }
        try {
            if (taxModalEditId === 'new') {
                await taxBillService.createInfo(taxModalForm);
            } else {
                await taxBillService.updateInfo(taxModalEditId as string | number, taxModalForm);
            }
            const res = await taxBillService.getInfoList();
            setSavedTaxInfoList(res.data || []);
            setTaxModalEditId(null);
        } catch (e: any) {
            alert(e.response?.data?.message || '저장에 실패했습니다.');
        }
    };

    const handleTaxModalDelete = async (id: any) => {
        if (!window.confirm('삭제하시겠습니까?')) return;
        try {
            await taxBillService.deleteInfo(id);
            const res = await taxBillService.getInfoList();
            const list = res.data || [];
            setSavedTaxInfoList(list);
            if (taxInfo?.id === id) { setTaxInfo(null); setTaxForm({ bizRegNum: '', bizName: '', bizRepName: '', bizCategory: '', bizDetailCategory: '', bizAddress: '', bizEmail: '', bizMobile: '' }); }
        } catch (e: any) {
            alert(e.response?.data?.message || '삭제에 실패했습니다.');
        }
    };

    useEffect(() => {
        if (taxBillType === 'TAX_BILL' && savedTaxInfoList.length === 0) {
            taxBillService.getInfoList().then((res) => {
                const list = res.data || [];
                setSavedTaxInfoList(list);
                if (list.length === 0) {
                    setTaxFormEditing(true);
                }
            }).catch(() => setTaxFormEditing(true));
        }
    }, [taxBillType]);

    const selectTaxInfo = (info: any) => {
        setTaxInfo(info);
        setTaxForm({
            bizRegNum: info.bizRegNum || '', bizName: info.bizName || '', bizRepName: info.bizRepName || '',
            bizCategory: info.bizCategory || '', bizDetailCategory: info.bizDetailCategory || '',
            bizAddress: info.bizAddress || '', bizEmail: info.bizEmail || '', bizMobile: info.bizMobile || '',
        });
        setTaxFormEditing(false);
    };

    // Reset tax bill type when payment method changes
    useEffect(() => {
        if (paymentMethod !== '가상계좌' && paymentMethod !== '무통장입금') {
            setTaxBillType('NONE');
        }
    }, [paymentMethod]);

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

    const subtotal = orderItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    const shippingPrice = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;

    const calculateCouponDiscount = () => {
        if (!selectedCouponId) return 0;
        const coupon = availableCoupons.find(c => c.memberCouponId === selectedCouponId);
        if (!coupon) return 0;
        if (coupon.minOrderPrice > 0 && subtotal < coupon.minOrderPrice) return 0;
        if (coupon.discountType === 'FIXED' || coupon.discountType === 'AMOUNT') {
            return Number(coupon.discountValue);
        }
        if (coupon.discountType === 'RATE' || coupon.discountType === 'PERCENT') {
            const discount = Math.floor(subtotal * coupon.discountValue / 100);
            return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
        }
        return 0;
    };

    const computedCouponDiscount = calculateCouponDiscount();
    const totalPrice = Math.max(0, subtotal + shippingPrice - usedPoint - computedCouponDiscount);

    const handlePostcode = () => {
        openPostcode(({ zonecode, address: addr }) => {
            setZipcode(zonecode);
            setAddress(addr);
        });
    };

    const handlePayment = async () => {
        if (orderItems.length === 0) {
            alert('결제할 상품이 없습니다.');
            return;
        }
        if (!receiverName.trim()) {
            alert('받는 분 성함을 입력해주세요.');
            return;
        }
        if (!receiverPhone.trim()) {
            alert('연락처를 입력해주세요.');
            return;
        }
        if (!zipcode) {
            alert('주소를 입력해주세요.');
            return;
        }
        if (!address) {
            alert('주소를 입력해주세요.');
            return;
        }
        if (!addressDetail.trim()) {
            alert('상세 주소를 입력해주세요.');
            return;
        }
        if (!paymentMethod) {
            alert('결제 수단을 선택해주세요.');
            return;
        }
        if (!agreement) {
            alert('주문 내용 확인 및 결제 진행에 동의해주세요.');
            return;
        }

        // 증빙 서류 유효성 검사
        if (taxBillType === 'TAX_BILL') {
            if (!taxForm.bizRegNum.trim()) {
                alert('사업자등록번호를 입력해주세요.');
                return;
            }
            if (!taxForm.bizName.trim()) {
                alert('상호명을 입력해주세요.');
                return;
            }
            if (!taxForm.bizRepName.trim()) {
                alert('대표자명을 입력해주세요.');
                return;
            }
            if (!taxForm.bizEmail.trim()) {
                alert('세금계산서 수신 이메일을 입력해주세요.');
                return;
            }
        }
        if (taxBillType === 'CASH_RECEIPT') {
            if (!cashForm.identifyNumber.trim()) {
                alert('현금영수증 식별번호를 입력해주세요.');
                return;
            }
        }

        const data = {
            receiverName: receiverName.trim(),
            receiverPhone: receiverPhone.trim(),
            receiverAddress: address,
            receiverDetail: addressDetail.trim(),
            receiverZipcode: zipcode,
            deliveryMemo: deliveryMemo.trim(),
            paymentMethod: (PAYMENT_METHOD_REVERSE_MAP as any)[paymentMethod],
            usedPoint: usedPoint || 0,
            memberCouponId: selectedCouponId || null,
            items: orderItems.map(item => ({
                productId: item.id,
                optionId: item.optionId || null,
                quantity: item.quantity,
            })),
        };

        setIsSubmitting(true);
        try {
            // Phase 1: Prepare order (임시 저장, orderNo 발급)
            const prepRes = await orderService.prepareOrder(data);
            const prepData: any = prepRes.data;
            // prepData = { orderNo, orderName, totalPrice, deliveryPrice, paymentPrice }

            // Phase 2: PG payment (mock for now)
            let pgResult;
            try {
                pgResult = await requestPgPayment({
                    orderNo: prepData.orderNo,
                    amount: prepData.paymentPrice,
                    orderName: prepData.orderName,
                    paymentMethod: (PAYMENT_METHOD_REVERSE_MAP as any)[paymentMethod],
                });
            } catch (pgError) {
                // PG 결제 실패/취소 — 주문 생성 안 됨, 안전
                alert('결제가 취소되었습니다.');
                return;
            }

            if (!pgResult?.success) {
                alert('결제에 실패했습니다.');
                return;
            }

            // Phase 3: Confirm order (실주문 생성)
            const confirmRes = await orderService.confirmOrder({
                orderNo: prepData.orderNo,
                paymentKey: pgResult.paymentKey,
            });
            const confirmData: any = confirmRes;
            // confirmData = { orderId, orderNo, orderName, paymentPrice }

            // 증빙 서류 신청 (기존 로직 유지)
            if (taxBillType !== 'NONE') {
                try {
                    const orderId = confirmData.orderId || confirmData;
                    if (orderId) {
                        const taxData = taxBillType === 'TAX_BILL'
                            ? { orderId, billType: 'TAX_BILL', ...taxForm }
                            : { orderId, billType: 'CASH_RECEIPT', ...cashForm };
                        await taxBillService.applyTaxBill(taxData);
                    }
                } catch (taxErr) {
                    console.error('증빙 서류 신청 실패:', taxErr);
                    // 주문은 성공했으므로 증빙 실패는 경고만
                }
            }

            // 백엔드에서 장바구니 삭제 처리됨 — 프론트는 목록만 갱신
            await fetchCart();

            // 직접 입력한 새 주소인 경우 배송지 저장 여부 확인
            if (selectedAddressId === null && zipcode && address) {
                if (window.confirm('이 배송지를 저장하시겠습니까?')) {
                    try {
                        await addressService.createAddress({
                            addressName: '',
                            receiverName: receiverName.trim(),
                            receiverPhone: receiverPhone.trim(),
                            zipcode,
                            address,
                            addressDetail: addressDetail.trim(),
                            isDefault: savedAddresses.length === 0,
                        });
                    } catch (e) {
                        console.error('배송지 저장 실패:', e);
                    }
                }
            }

            // 주문 상세 조회해서 완료 페이지에 전달
            try {
                const detailRes = await orderService.getOrder(confirmData.orderId || confirmData);
                const detail: any = detailRes.data;
                navigate('/shop/order-complete', {
                    replace: true,
                    state: {
                        orderId: confirmData.orderId || confirmData,
                        orderNo: detail?.orderNo || prepData.orderNo,
                        orderName: detail?.orderName || prepData.orderName,
                        paymentPrice: detail?.paymentPrice || prepData.paymentPrice,
                        paymentMethod,
                        receiverName: receiverName.trim(),
                        receiverPhone: receiverPhone.trim(),
                        zipcode,
                        address,
                        addressDetail: addressDetail.trim(),
                    }
                });
            } catch (e) {
                // 상세 조회 실패 시에도 완료 페이지로 이동
                navigate('/shop/order-complete', { replace: true, state: { orderId: confirmData.orderId || confirmData } });
            }
        } catch (e: any) {
            const msg = e.response?.data?.message || '주문에 실패했습니다. 다시 시도해주세요.';
            alert(msg);
            console.error('주문 실패:', e);
        } finally {
            setIsSubmitting(false);
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

                    {/* 배송지 정보 */}
                    <section className="bg-white p-5 md:p-8 border border-gray-100 shadow-sm rounded-sm">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <h3 className="text-base md:text-lg font-bold text-[#333]">배송지 정보</h3>
                            {savedAddresses.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(true)}
                                    className="text-[12px] text-[#968064] font-bold underline underline-offset-2 hover:text-[#333] transition-colors"
                                >
                                    배송지 변경
                                </button>
                            )}
                        </div>

                        {/* 선택된 배송지 요약 (기본배송지가 있을 때) */}
                        {selectedAddressId && receiverName && (
                            <div className="bg-[#fafaf5] border border-gray-100 px-4 py-3 mb-6 rounded-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[13px] font-bold text-[#333]">{receiverName}</span>
                                    <span className="text-[12px] text-gray-400">{receiverPhone}</span>
                                </div>
                                <p className="text-[12px] text-gray-500">({zipcode}) {address} {addressDetail}</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider ml-1">Receiver</label>
                                <input
                                    type="text"
                                    value={receiverName}
                                    onChange={(e) => setReceiverName(e.target.value)}
                                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:border-[#333] outline-none transition-all bg-[#fafafa] focus:bg-white h-[48px]"
                                    placeholder="받는 분 성함을 입력해주세요"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider ml-1">Contact</label>
                                <input
                                    type="text"
                                    value={receiverPhone}
                                    onChange={(e) => setReceiverPhone(e.target.value)}
                                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:border-[#333] outline-none transition-all bg-[#fafafa] focus:bg-white h-[48px]"
                                    placeholder="010-0000-0000"
                                />
                            </div>

                            {/* 주소 입력 영역 */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider ml-1">Address</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={zipcode}
                                        className="flex-grow border border-gray-200 px-4 py-3 text-sm bg-gray-100 text-gray-400 outline-none h-[48px] min-w-0"
                                        placeholder="우편번호"
                                        readOnly
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePostcode}
                                        className="px-4 md:px-6 bg-[#333] text-white text-[12px] font-bold whitespace-nowrap hover:bg-black transition-colors h-[48px] shrink-0 active:scale-95"
                                    >
                                        주소 찾기
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={address}
                                    className="w-full border border-gray-200 px-4 py-3 text-sm bg-[#fafafa] h-[48px] focus:bg-white focus:border-[#333] outline-none transition-all"
                                    placeholder="기본 주소"
                                    readOnly
                                />
                                <input
                                    type="text"
                                    value={addressDetail}
                                    onChange={(e) => setAddressDetail(e.target.value)}
                                    className="w-full border border-gray-200 px-4 py-3 text-sm h-[48px] focus:border-[#333] outline-none transition-all"
                                    placeholder="상세 주소를 입력해주세요"
                                />
                            </div>

                            {/* 배송 메모 */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider ml-1">Delivery Memo</label>
                                <input
                                    type="text"
                                    value={deliveryMemo}
                                    onChange={(e) => setDeliveryMemo(e.target.value)}
                                    className="w-full border border-gray-200 px-4 py-3 text-sm h-[48px] focus:border-[#333] outline-none transition-all bg-[#fafafa] focus:bg-white"
                                    placeholder="배송 메모를 입력해주세요 (선택)"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 포인트 사용 */}
                    <section className="bg-white p-5 md:p-8 border border-gray-100 shadow-sm rounded-sm">
                        <h3 className="text-base md:text-lg font-bold text-[#333] mb-6 border-b pb-4">포인트 사용</h3>
                        <div className="flex flex-col gap-4">
                            <p className="text-[13px] text-gray-500">
                                보유 포인트: <span className="font-bold text-[#968064]">{pointBalance.toLocaleString()} P</span>
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max={Math.min(pointBalance, subtotal + shippingPrice - computedCouponDiscount)}
                                    value={usedPoint}
                                    onChange={(e) => {
                                        const maxUsable = Math.max(0, subtotal + shippingPrice - computedCouponDiscount);
                                        const val = Math.max(0, Math.min(Number(e.target.value) || 0, pointBalance, maxUsable));
                                        setUsedPoint(val);
                                    }}
                                    className="flex-grow border border-gray-200 px-4 py-3 text-sm focus:border-[#333] outline-none transition-all bg-[#fafafa] focus:bg-white h-[48px]"
                                    placeholder="사용할 포인트를 입력하세요"
                                />
                                <button
                                    type="button"
                                    onClick={() => setUsedPoint(Math.min(pointBalance, Math.max(0, subtotal + shippingPrice - computedCouponDiscount)))}
                                    className="px-4 md:px-6 bg-[#333] text-white text-[12px] font-bold whitespace-nowrap hover:bg-black transition-colors h-[48px] shrink-0 active:scale-95"
                                >
                                    전액 사용
                                </button>
                            </div>
                            {usedPoint > 0 && (
                                <p className="text-[12px] text-[#E23600] font-medium">
                                    - {usedPoint.toLocaleString()} P 적용
                                </p>
                            )}
                        </div>
                    </section>

                    {/* 쿠폰 적용 */}
                    <section className="bg-white p-5 md:p-8 border border-gray-100 shadow-sm rounded-sm">
                        <h3 className="text-base md:text-lg font-bold text-[#333] mb-6 border-b pb-4">쿠폰 적용</h3>
                        {availableCoupons.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                <div
                                    onClick={() => { setSelectedCouponId(null); setCouponDiscount(0); }}
                                    className={`px-4 py-3 border rounded-sm cursor-pointer transition-all ${
                                        selectedCouponId === null
                                            ? 'border-[#333] bg-[#fafaf5]'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-[13px] font-medium text-gray-500">적용 안 함</span>
                                </div>
                                {availableCoupons.map((coupon) => {
                                    const isDisabled = coupon.minOrderPrice > 0 && subtotal < coupon.minOrderPrice;
                                    const isSelected = selectedCouponId === coupon.memberCouponId;
                                    const discountText = coupon.discountType === 'FIXED' || coupon.discountType === 'AMOUNT'
                                        ? `${Number(coupon.discountValue).toLocaleString()}원 할인`
                                        : coupon.discountType === 'RATE' || coupon.discountType === 'PERCENT'
                                            ? `${coupon.discountValue}% 할인${coupon.maxDiscount ? ` (최대 ${Number(coupon.maxDiscount).toLocaleString()}원)` : ''}`
                                            : `${Number(coupon.discountValue).toLocaleString()} 할인`;
                                    return (
                                        <div
                                            key={coupon.memberCouponId}
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    setSelectedCouponId(coupon.memberCouponId);
                                                }
                                            }}
                                            className={`px-4 py-3 border rounded-sm transition-all ${
                                                isDisabled
                                                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                                    : isSelected
                                                        ? 'border-[#333] bg-[#fafaf5] cursor-pointer'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[13px] font-bold text-[#333]">{coupon.couponName}</p>
                                                    <p className="text-[12px] text-[#968064] font-medium mt-0.5">{discountText}</p>
                                                    {coupon.minOrderPrice > 0 && (
                                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                                            {Number(coupon.minOrderPrice).toLocaleString()}원 이상 구매 시
                                                            {isDisabled && <span className="text-red-400 ml-1">(미달)</span>}
                                                        </p>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#968064]"><path d="M20 6 9 17l-5-5"/></svg>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {computedCouponDiscount > 0 && (
                                    <p className="text-[12px] text-[#E23600] font-medium mt-1">
                                        - {computedCouponDiscount.toLocaleString()}원 할인 적용
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-[13px] text-gray-400 italic">사용 가능한 쿠폰이 없습니다.</p>
                        )}
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

                    {/* 증빙 서류 (가상계좌/무통장입금 시만 표시) */}
                    {(paymentMethod === '가상계좌' || paymentMethod === '무통장입금') && (
                        <section className="bg-white p-5 md:p-8 border border-gray-100 shadow-sm rounded-sm">
                            <h3 className="text-base md:text-lg font-bold text-[#333] mb-6 border-b pb-4">증빙 서류</h3>
                            <div className="flex flex-col gap-5">
                                {/* 유형 선택 */}
                                <div className="flex gap-4">
                                    {[
                                        { value: 'NONE', label: '발행 안 함' },
                                        { value: 'TAX_BILL', label: '세금계산서' },
                                        { value: 'CASH_RECEIPT', label: '현금영수증' },
                                    ].map((opt) => (
                                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="radio"
                                                name="taxBillType"
                                                value={opt.value}
                                                checked={taxBillType === opt.value}
                                                onChange={(e) => setTaxBillType(e.target.value)}
                                                className="w-4 h-4 accent-[#968064]"
                                            />
                                            <span className="text-[13px] text-gray-600">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* 세금계산서 폼 */}
                                {taxBillType === 'TAX_BILL' && (
                                    <div className="border border-gray-100 rounded-sm p-4 md:p-5 bg-[#fafafa]">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-2">
                                                <select
                                                    value={taxInfo?.id || ''}
                                                    onChange={(e) => {
                                                        const selected = savedTaxInfoList.find(i => i.id === Number(e.target.value));
                                                        if (selected) selectTaxInfo(selected);
                                                    }}
                                                    className="flex-grow border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333] bg-white"
                                                >
                                                    <option value="">사업자 정보를 선택해주세요</option>
                                                    {savedTaxInfoList.map(info => (
                                                        <option key={info.id} value={info.id}>{info.bizName} ({info.bizRegNum})</option>
                                                    ))}
                                                </select>
                                                <button type="button" onClick={openTaxInfoModal}
                                                        className="px-4 bg-[#333] text-white text-[12px] font-bold whitespace-nowrap hover:bg-black transition-colors shrink-0">
                                                    정보 관리
                                                </button>
                                            </div>
                                            {taxInfo && (
                                                <div className="text-[13px] text-gray-600 space-y-1 bg-white p-3 border border-gray-100 rounded-sm">
                                                    <p>사업자등록번호: {taxForm.bizRegNum}</p>
                                                    <p>상호: {taxForm.bizName} / 대표: {taxForm.bizRepName}</p>
                                                    {taxForm.bizEmail && <p>이메일: {taxForm.bizEmail}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 현금영수증 폼 */}
                                {taxBillType === 'CASH_RECEIPT' && (
                                    <div className="border border-gray-100 rounded-sm p-4 md:p-5 bg-[#fafafa]">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="radio"
                                                        name="cashPurpose"
                                                        value="INCOME_DEDUCTION"
                                                        checked={cashForm.purposeType === 'INCOME_DEDUCTION'}
                                                        onChange={(e) => setCashForm(prev => ({ ...prev, purposeType: e.target.value }))}
                                                        className="w-4 h-4 accent-[#968064]"
                                                    />
                                                    <span className="text-[13px] text-gray-600">소득공제</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="radio"
                                                        name="cashPurpose"
                                                        value="EXPENSE_PROOF"
                                                        checked={cashForm.purposeType === 'EXPENSE_PROOF'}
                                                        onChange={(e) => setCashForm(prev => ({ ...prev, purposeType: e.target.value }))}
                                                        className="w-4 h-4 accent-[#968064]"
                                                    />
                                                    <span className="text-[13px] text-gray-600">지출증빙</span>
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                value={cashForm.identifyNumber}
                                                onChange={(e) => setCashForm(prev => ({ ...prev, identifyNumber: e.target.value }))}
                                                placeholder={cashForm.purposeType === 'INCOME_DEDUCTION' ? '휴대폰 번호 (010-0000-0000)' : '사업자등록번호 (000-00-00000)'}
                                                maxLength={20}
                                                className="border border-gray-200 px-4 py-3 text-[13px] outline-none bg-white focus:border-[#333] transition-colors"
                                            />
                                            <p className="text-[11px] text-gray-400">
                                                {cashForm.purposeType === 'INCOME_DEDUCTION'
                                                    ? '소득공제용: 휴대폰 번호를 입력해주세요.'
                                                    : '지출증빙용: 사업자등록번호를 입력해주세요.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
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
                            {usedPoint > 0 && (
                                <div className="flex justify-between text-[#E23600] font-medium">
                                    <span>포인트 할인</span>
                                    <span>- {usedPoint.toLocaleString()}원</span>
                                </div>
                            )}
                            {computedCouponDiscount > 0 && (
                                <div className="flex justify-between text-[#E23600] font-medium">
                                    <span>쿠폰 할인</span>
                                    <span>- {computedCouponDiscount.toLocaleString()}원</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-8 border-t border-gray-100 mt-4">
                                <span className="font-bold text-gray-800 text-base">최종 결제 금액</span>
                                <span className="text-[24px] md:text-[28px] font-black text-[#968064]">{totalPrice.toLocaleString()}원</span>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-5">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreement}
                                    onChange={(e) => setAgreement(e.target.checked)}
                                    className="mt-1 accent-[#333] w-4 h-4 shrink-0"
                                />
                                <span className="text-[11px] text-gray-400 group-hover:text-gray-600 transition-colors leading-relaxed">
                                    주문 내용을 확인하였으며, 정보 제공 및 결제 진행에 동의합니다. (필수)
                                </span>
                            </label>
                            <button
                                onClick={handlePayment}
                                disabled={isSubmitting}
                                className="w-full py-5 bg-[#333] text-white font-bold text-base hover:bg-black transition-all active:scale-95 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        주문 처리 중...
                                    </>
                                ) : (
                                    `${totalPrice.toLocaleString()}원 결제하기`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 배송지 선택 모달 */}
            {showAddressModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={() => setShowAddressModal(false)}>
                    <div className="bg-white w-full max-w-[500px] mx-4 max-h-[80vh] rounded-sm shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-[16px] font-bold text-[#333]">배송지 선택</h3>
                            <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-black text-xl">&times;</button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-2">
                            {savedAddresses.map((addr) => (
                                <button
                                    key={addr.id}
                                    type="button"
                                    onClick={() => handleSelectAddress(addr)}
                                    className={`w-full text-left px-4 py-4 border rounded-sm transition-all ${
                                        selectedAddressId === addr.id
                                            ? 'border-[#333] bg-[#fafaf5]'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[14px] font-bold text-[#333]">{addr.addressName || '배송지'}</span>
                                        {addr.isDefault === true && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-[#968064] text-white rounded-sm font-medium">기본</span>
                                        )}
                                    </div>
                                    <p className="text-[13px] text-gray-600 font-medium">{addr.receiverName} <span className="text-gray-400 font-normal">{addr.receiverPhone}</span></p>
                                    <p className="text-[12px] text-gray-400 mt-1">({addr.zipcode}) {addr.address} {addr.addressDetail}</p>
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={handleManualEntry}
                                className={`w-full text-left px-4 py-4 border rounded-sm transition-all ${
                                    selectedAddressId === null
                                        ? 'border-[#333] bg-[#fafaf5]'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <span className="text-[14px] font-bold text-[#333]">직접 입력</span>
                                <p className="text-[12px] text-gray-400 mt-1">새로운 배송지를 직접 입력합니다</p>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 세금계산서 정보 관리 모달 */}
            {showTaxInfoModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={() => { setShowTaxInfoModal(false); setTaxModalEditId(null); }}>
                    <div className="bg-white w-full max-w-[550px] mx-4 max-h-[85vh] rounded-sm shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-[16px] font-bold text-[#333]">
                                {taxModalEditId === 'new' ? '새 사업자 정보 등록' : taxModalEditId ? '사업자 정보 수정' : '사업자 정보 관리'}
                            </h3>
                            <button onClick={() => { setShowTaxInfoModal(false); setTaxModalEditId(null); }} className="text-gray-400 hover:text-black text-xl">&times;</button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {/* 목록 화면 */}
                            {taxModalEditId === null && (
                                <div className="p-6 flex flex-col gap-3">
                                    {savedTaxInfoList.map(info => (
                                        <div key={info.id} className="border border-gray-100 p-4 rounded-sm flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-[14px] font-bold text-[#333]">{info.bizName}</p>
                                                <p className="text-[12px] text-gray-500 mt-0.5">{info.bizRegNum} / {info.bizRepName}</p>
                                                {info.bizEmail && <p className="text-[11px] text-gray-400 mt-0.5">{info.bizEmail}</p>}
                                            </div>
                                            <div className="flex gap-2 shrink-0 ml-3">
                                                <button onClick={() => { selectTaxInfo(info); setShowTaxInfoModal(false); }}
                                                        className="text-[11px] text-[#968064] font-bold border border-[#968064] px-3 py-1.5 rounded-sm hover:bg-orange-50">선택</button>
                                                <button onClick={() => startTaxEdit(info)}
                                                        className="text-[11px] text-gray-500 font-bold border border-gray-200 px-3 py-1.5 rounded-sm hover:bg-gray-50">수정</button>
                                                <button onClick={() => handleTaxModalDelete(info.id)}
                                                        className="text-[11px] text-red-400 font-bold border border-red-100 px-3 py-1.5 rounded-sm hover:bg-red-50">삭제</button>
                                            </div>
                                        </div>
                                    ))}
                                    {savedTaxInfoList.length === 0 && (
                                        <p className="py-8 text-center text-gray-400 text-[13px]">등록된 사업자 정보가 없습니다.</p>
                                    )}
                                </div>
                            )}

                            {/* 등록/수정 폼 */}
                            {taxModalEditId !== null && (
                                <div className="p-6 flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input value={taxModalForm.bizRegNum} onChange={e => setTaxModalForm(p => ({ ...p, bizRegNum: e.target.value }))} placeholder="사업자등록번호 *" maxLength={20} className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                        <input value={taxModalForm.bizName} onChange={e => setTaxModalForm(p => ({ ...p, bizName: e.target.value }))} placeholder="상호명 *" maxLength={100} className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input value={taxModalForm.bizRepName} onChange={e => setTaxModalForm(p => ({ ...p, bizRepName: e.target.value }))} placeholder="대표자명 *" maxLength={30} className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                        <input value={taxModalForm.damName} onChange={e => setTaxModalForm(p => ({ ...p, damName: e.target.value }))} placeholder="담당자명" maxLength={30} className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input value={taxModalForm.bizCategory} onChange={e => setTaxModalForm(p => ({ ...p, bizCategory: e.target.value }))} placeholder="업태" maxLength={50} className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                        <input value={taxModalForm.bizDetailCategory} onChange={e => setTaxModalForm(p => ({ ...p, bizDetailCategory: e.target.value }))} placeholder="종목" maxLength={100} className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                    </div>
                                    <input value={taxModalForm.bizAddress} onChange={e => setTaxModalForm(p => ({ ...p, bizAddress: e.target.value }))} placeholder="사업장 주소" maxLength={200} className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input value={taxModalForm.bizEmail} onChange={e => setTaxModalForm(p => ({ ...p, bizEmail: e.target.value }))} placeholder="이메일" type="email" maxLength={100} className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                        <input value={taxModalForm.bizMobile} onChange={e => setTaxModalForm(p => ({ ...p, bizMobile: e.target.value }))} placeholder="연락처" maxLength={20} className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 p-6 border-t">
                            {taxModalEditId === null ? (
                                <>
                                    <button onClick={() => { setShowTaxInfoModal(false); }} className="flex-1 py-3.5 border border-gray-200 text-gray-500 text-[13px] font-medium rounded-sm hover:bg-gray-50">닫기</button>
                                    <button onClick={startTaxCreate} className="flex-[2] py-3.5 bg-[#343434] text-white text-[13px] font-medium rounded-sm hover:bg-black">새 정보 추가</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setTaxModalEditId(null)} className="flex-1 py-3.5 border border-gray-200 text-gray-500 text-[13px] font-medium rounded-sm hover:bg-gray-50">뒤로</button>
                                    <button onClick={handleTaxModalSave} className="flex-[2] py-3.5 bg-[#343434] text-white text-[13px] font-medium rounded-sm hover:bg-black">저장</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
