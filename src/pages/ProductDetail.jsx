import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import productService from '../api/productService';
import wishlistService from '../api/wishlistService';
import inquiryService from '../api/inquiryService';
import { formatDate } from '../utils/dateFormat';
import { maskName } from '../utils/stringUtils';

/* ───────── Tab Components ───────── */

const DescriptionTab = ({ product }) => {
    if (!product?.description) {
        return (
            <div className="py-20 text-center text-gray-400 font-light text-[15px]">
                상세 정보가 준비중입니다.
            </div>
        );
    }
    return (
        <div className="py-10 px-2 md:px-6 text-[15px] text-[#444] leading-[1.9] font-light"
            style={{ whiteSpace: 'pre-wrap' }}>
            {product.description}
        </div>
    );
};

const StarRating = ({ rating, onChange, size = 'text-lg' }) => {
    const [hover, setHover] = useState(0);
    return (
        <span className={`inline-flex gap-0.5 ${size}`}>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    className={`cursor-pointer select-none transition-colors ${(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => onChange && setHover(star)}
                    onMouseLeave={() => onChange && setHover(0)}
                >★</span>
            ))}
        </span>
    );
};

const StarDisplay = ({ rating }) => (
    <span className="inline-flex gap-0.5 text-sm">
        {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className={rating >= star ? 'text-yellow-400' : 'text-gray-200'}>★</span>
        ))}
    </span>
);

const ReviewTab = ({ productId, onCountChange }) => {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchReviews = useCallback(async (p = 0) => {
        setLoading(true);
        try {
            const res = await productService.getReviews(productId, p, 10);
            const data = res.data?.data || {};
            setReviews(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            onCountChange?.(data.totalElements || 0);
        } catch (e) {
            console.error('리뷰 조회 실패:', e);
        } finally {
            setLoading(false);
        }
    }, [productId, onCountChange]);

    useEffect(() => {
        fetchReviews(page);
    }, [page, fetchReviews]);

    const handleLike = async (review) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }
        try {
            if (review.isLiked) {
                await productService.removeReviewLike(productId, review.reviewId);
            } else {
                await productService.toggleReviewLike(productId, review.reviewId);
            }
            fetchReviews(page);
        } catch (e) {
            console.error('좋아요 처리 실패:', e);
        }
    };

    return (
        <div className="py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <p className="text-[15px] text-gray-500 font-light">
                    총 <span className="font-bold text-[#333]">{totalElements}</span>건의 구매후기
                </p>
            </div>

            {/* Review List */}
            {loading ? (
                <div className="py-20 text-center text-gray-400 font-light text-sm">불러오는 중...</div>
            ) : reviews.length === 0 ? (
                <div className="py-20 text-center text-gray-400 font-light text-[15px]">
                    등록된 구매후기가 없습니다.
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {reviews.map((review) => (
                        <div key={review.reviewId} className="py-6">
                            <div className="flex items-center gap-3 mb-2">
                                <StarDisplay rating={review.rating} />
                                <span className="text-[13px] text-gray-400 font-light">{maskName(review.memberName)}</span>
                                <span className="text-[12px] text-gray-300">|</span>
                                <span className="text-[13px] text-gray-400 font-light">{formatDate(review.createdAt)}</span>
                            </div>
                            <h4 className="text-[15px] font-semibold text-[#333] mb-1.5">{review.title}</h4>
                            <p className="text-[14px] text-[#555] leading-[1.8] font-light whitespace-pre-wrap">{review.content}</p>
                            <button
                                onClick={() => handleLike(review)}
                                className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[12px] transition-colors ${review.isLiked
                                        ? 'border-red-200 text-red-400 bg-red-50'
                                        : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                                    }`}
                            >
                                <span>{review.isLiked ? '♥' : '♡'}</span>
                                <span>{review.likeCount || 0}</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-1 mt-10">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="w-9 h-9 flex items-center justify-center text-[13px] text-gray-400 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-30"
                    >‹</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`w-9 h-9 flex items-center justify-center text-[13px] rounded-sm border transition-colors ${page === i
                                    ? 'bg-[#343434] text-white border-[#343434] font-bold'
                                    : 'text-gray-400 border-gray-200 hover:bg-gray-50'
                                }`}
                        >{i + 1}</button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="w-9 h-9 flex items-center justify-center text-[13px] text-gray-400 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-30"
                    >›</button>
                </div>
            )}
        </div>
    );
};

const QnATab = ({ productId }) => {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', isSecret: false });
    const [submitting, setSubmitting] = useState(false);

    const fetchInquiries = useCallback(async (p = 0) => {
        setLoading(true);
        try {
            const res = await inquiryService.getProductInquiries(productId, p, 10);
            const data = res.data?.data || {};
            setInquiries(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (e) {
            console.error('상품 문의 조회 실패:', e);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchInquiries(page);
    }, [page, fetchInquiries]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/shop/login');
            return;
        }
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }
        setSubmitting(true);
        try {
            await inquiryService.createInquiry({
                type: 'PRODUCT',
                productId,
                title: formData.title,
                content: formData.content,
                isSecret: formData.isSecret ? 'Y' : 'N',
            });
            setFormData({ title: '', content: '', isSecret: false });
            setShowForm(false);
            setPage(0);
            fetchInquiries(0);
        } catch (e) {
            console.error('문의 등록 실패:', e);
            alert('문의 등록에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <p className="text-[15px] text-gray-500 font-light">
                    총 <span className="font-bold text-[#333]">{totalElements}</span>건의 상품문의
                </p>
                <button
                    onClick={() => {
                        const token = localStorage.getItem('accessToken');
                        if (!token) {
                            alert('로그인이 필요한 서비스입니다.');
                            navigate('/shop/login');
                            return;
                        }
                        setShowForm(!showForm);
                    }}
                    className="px-5 py-2.5 border border-[#343434] text-[#343434] text-[13px] font-medium rounded-sm hover:bg-gray-50 transition-colors"
                >
                    문의하기
                </button>
            </div>

            {/* Inline Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-6 bg-[#fcfcfc] border border-gray-100 rounded-sm">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="제목을 입력해주세요"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-sm text-[14px] outline-none focus:border-[#343434] transition-colors"
                            maxLength={100}
                        />
                    </div>
                    <div className="mb-4">
                        <textarea
                            placeholder="문의 내용을 입력해주세요"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-200 rounded-sm text-[14px] outline-none focus:border-[#343434] transition-colors resize-none"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.isSecret}
                                onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                                className="w-4 h-4 accent-[#343434]"
                            />
                            <span className="text-[13px] text-gray-500 font-light">비밀글</span>
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setFormData({ title: '', content: '', isSecret: false }); }}
                                className="px-5 py-2.5 border border-gray-200 text-gray-400 text-[13px] rounded-sm hover:bg-gray-50 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2.5 bg-[#343434] text-white text-[13px] font-medium rounded-sm hover:bg-black transition-colors disabled:opacity-50"
                            >
                                {submitting ? '등록 중...' : '등록'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Inquiry List */}
            {loading ? (
                <div className="py-20 text-center text-gray-400 font-light text-sm">불러오는 중...</div>
            ) : inquiries.length === 0 ? (
                <div className="py-20 text-center text-gray-400 font-light text-[15px]">
                    등록된 상품문의가 없습니다.
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {inquiries.map((inq) => (
                        <div key={inq.id} className="py-5">
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                            >
                                <span className={`text-[12px] px-2 py-0.5 rounded-sm font-medium ${inq.status === 'COMPLETE'
                                        ? 'bg-green-50 text-green-600 border border-green-200'
                                        : 'bg-gray-50 text-gray-400 border border-gray-200'
                                    }`}>
                                    {inq.statusDesc || (inq.status === 'COMPLETE' ? '답변완료' : '답변대기')}
                                </span>
                                {inq.isSecret === 'Y' && (
                                    <span className="text-[12px] px-2 py-0.5 rounded-sm font-medium bg-yellow-50 text-yellow-600 border border-yellow-200 inline-flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        비밀글
                                    </span>
                                )}
                                <span className="flex-1 text-[14px] text-[#333] font-medium truncate">{inq.title}</span>
                                <span className="text-[13px] text-gray-400 font-light shrink-0">{maskName(inq.writerName)}</span>
                                <span className="text-[12px] text-gray-300 shrink-0">|</span>
                                <span className="text-[13px] text-gray-400 font-light shrink-0">{formatDate(inq.createdAt)}</span>
                                <span className={`text-gray-300 text-[12px] transition-transform ${expandedId === inq.id ? 'rotate-180' : ''}`}>
                                    &#9660;
                                </span>
                            </div>
                            {expandedId === inq.id && (
                                <div className="mt-4 ml-1">
                                    <div className="px-5 py-4 bg-[#fafafa] border-l-2 border-gray-200 rounded-sm">
                                        <p className="text-[14px] text-[#555] leading-[1.8] font-light whitespace-pre-wrap">{inq.content}</p>
                                    </div>
                                    {inq.answer && (
                                        <div className="mt-3 px-5 py-4 bg-[#f5f9f5] border-l-2 border-green-300 rounded-sm">
                                            <p className="text-[12px] font-semibold text-green-600 mb-1.5">관리자 답변</p>
                                            <p className="text-[14px] text-[#555] leading-[1.8] font-light whitespace-pre-wrap">{inq.answer}</p>
                                            {inq.answeredAt && (
                                                <p className="text-[12px] text-gray-400 font-light mt-2">{formatDate(inq.answeredAt)}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-1 mt-10">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="w-9 h-9 flex items-center justify-center text-[13px] text-gray-400 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-30"
                    >&lsaquo;</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`w-9 h-9 flex items-center justify-center text-[13px] rounded-sm border transition-colors ${page === i
                                    ? 'bg-[#343434] text-white border-[#343434] font-bold'
                                    : 'text-gray-400 border-gray-200 hover:bg-gray-50'
                                }`}
                        >{i + 1}</button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="w-9 h-9 flex items-center justify-center text-[13px] text-gray-400 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-30"
                    >&rsaquo;</button>
                </div>
            )}
        </div>
    );
};

const ShippingInfoTab = () => {
    const infoSections = [
        {
            title: '배송 안내',
            items: [
                { label: '배송비', value: '50,000원 이상 구매 시 무료 / 미만 시 3,000원' },
                { label: '배송기간', value: '결제 완료 후 2~3 영업일 (주말/공휴일 제외)' },
                { label: '배송방법', value: '택배 배송' },
            ],
        },
        {
            title: '교환/반품 안내',
            items: [
                { label: '신청기한', value: '상품 수령 후 7일 이내' },
                { label: '배송비', value: '편도 3,000원 (왕복 시 6,000원)' },
                { label: '교환/반품 불가', value: '사용 또는 훼손된 상품, 세탁한 상품, 고객 부주의로 파손된 상품' },
            ],
        },
    ];

    return (
        <div className="py-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {infoSections.map((section) => (
                <div key={section.title} className="p-6 bg-[#fcfcfc] border border-gray-100 rounded-sm">
                    <h4 className="text-[15px] font-bold text-[#333] mb-5 pb-3 border-b border-gray-100">
                        {section.title}
                    </h4>
                    <div className="flex flex-col gap-4">
                        {section.items.map((item) => (
                            <div key={item.label} className="flex gap-3">
                                <span className="text-[13px] font-semibold text-[#968064] min-w-[90px] shrink-0">
                                    {item.label}
                                </span>
                                <span className="text-[13px] text-[#555] font-light leading-[1.7]">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ───────── Main Component ───────── */

const ProductDetail = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const initialTab = searchParams.get('tab') === 'review' ? 1 : 0;

    const [quantity, setQuantity] = useState(1); // 옵션 없는 상품용
    const [selectedOption, setSelectedOption] = useState(null); // 옵션 선택 중간 상태
    const [selectedItems, setSelectedItems] = useState([]); // 선택된 옵션 목록 [{option, quantity}]
    const [activeTab, setActiveTab] = useState(initialTab);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWished, setIsWished] = useState(false);
    const [reviewCount, setReviewCount] = useState(0);

    const isInactive = product?.deleteYn === 'Y' || product?.applyYn !== 'Y';

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await productService.getProduct(id);
                setProduct(res.data?.data);
                window.scrollTo(0, 0);
            } catch (e) {
                console.error('상품 조회 실패:', e);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        const checkWishlist = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token || !product) return;
            try {
                const res = await wishlistService.getWishlist(0, 100);
                const list = res.data?.data?.content || res.data?.data || [];
                const found = list.some(item => item.productId === product.productId);
                setIsWished(found);
            } catch (e) {
                console.error('위시리스트 조회 실패:', e);
            }
        };
        checkWishlist();
    }, [product]);

    const handleReviewCountChange = useCallback((count) => {
        setReviewCount(count);
    }, []);

    const getMainImage = () => {
        if (product?.images && product.images.length > 0) {
            const main = product.images.find(img => img.isMain === 'Y') || product.images[0];
            return main.url || main.filePath;
        }
        return null;
    };

    const discountRate = product?.suggestedPrice && product.suggestedPrice > product.price
        ? Math.floor(((product.suggestedPrice - product.price) / product.suggestedPrice) * 100)
        : null;

    const handleQuantity = (type) => {
        if (type === 'plus') setQuantity(quantity + 1);
        else if (type === 'minus' && quantity > 1) setQuantity(quantity - 1);
    };

    const hasOptions = product?.optionYn === 'Y' && product?.options?.length > 0;

    // 옵션 선택 완료 시 목록에 추가
    const addSelectedItem = (opt) => {
        const exists = selectedItems.find(si => si.option.optionId === opt.optionId);
        if (exists) {
            setSelectedItems(prev => prev.map(si =>
                si.option.optionId === opt.optionId ? { ...si, quantity: si.quantity + 1 } : si
            ));
        } else {
            setSelectedItems(prev => [...prev, { option: opt, quantity: 1 }]);
        }
        setSelectedOption(null);
    };

    const updateItemQuantity = (optionId, delta) => {
        setSelectedItems(prev => prev.map(si =>
            si.option.optionId === optionId
                ? { ...si, quantity: Math.max(1, si.quantity + delta) }
                : si
        ));
    };

    const removeItem = (optionId) => {
        setSelectedItems(prev => prev.filter(si => si.option.optionId !== optionId));
    };

    const getOptionLabel = (opt) =>
        `${opt.name1 || ''}${opt.name2 ? ' / ' + opt.name2 : ''}`;

    const totalAmount = hasOptions
        ? selectedItems.reduce((sum, si) => sum + (product.price + (si.option.extraPrice || 0)) * si.quantity, 0)
        : product ? product.price * quantity : 0;

    const handleAddToCart = () => {
        if (hasOptions) {
            if (selectedItems.length === 0) { alert('옵션을 선택해주세요.'); return; }
            selectedItems.forEach(si => {
                addToCart({
                    id: product.productId,
                    name: product.name,
                    price: product.price + (si.option.extraPrice || 0),
                    image: getMainImage(),
                    optionId: si.option.optionId,
                    optionName: getOptionLabel(si.option),
                }, si.quantity);
            });
        } else {
            addToCart({
                id: product.productId,
                name: product.name,
                price: product.price,
                image: getMainImage(),
            }, quantity);
        }
    };

    const handleDirectOrder = () => {
        if (hasOptions && selectedItems.length === 0) { alert('옵션을 선택해주세요.'); return; }
        const user = localStorage.getItem('user');
        const orderItems = hasOptions
            ? selectedItems.map(si => ({
                id: product.productId,
                name: product.name,
                price: product.price + (si.option.extraPrice || 0),
                image: getMainImage(),
                quantity: si.quantity,
                optionId: si.option.optionId,
                optionName: getOptionLabel(si.option),
            }))
            : [{
                id: product.productId,
                name: product.name,
                price: product.price,
                image: getMainImage(),
                quantity: quantity,
            }];
        const orderData = { isDirect: true, orderItems };

        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/shop/login', {
                state: { from: '/shop/checkout', directOrderData: orderData }
            });
            return;
        }
        navigate('/shop/checkout', { state: orderData });
    };

    const handleWishToggle = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }
        try {
            const res = await wishlistService.toggleWishlist(product.productId);
            setIsWished(res.data?.data === true);
        } catch (e) {
            console.error('위시리스트 토글 실패:', e);
        }
    };

    const tabs = ['상세정보', `구매후기(${reviewCount})`, '상품문의', '배송/교환안내'];

    if (loading) return <div className="py-40 text-center text-gray-400 font-light">상품 정보를 불러오는 중...</div>;
    if (!product) return <div className="py-40 text-center text-gray-400 font-light">상품을 찾을 수 없습니다.</div>;

    const imgSrc = getMainImage();

    return (
        <div className="w-full bg-white pb-24 md:pb-20 font-sans">
            <div className="max-w-[1290px] mx-auto px-6 py-10 md:py-20">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-20">

                    {/* [좌측] 이미지 영역 */}
                    <div className="flex-1">
                        <div className="relative aspect-square bg-[#f9f9f9] overflow-hidden flex items-center justify-center border border-gray-50 group">
                            {discountRate && (
                                <div className="absolute top-0 left-0 bg-[#E23600] text-white text-[14px] font-bold px-5 py-2.5 z-10">
                                    {discountRate}% OFF
                                </div>
                            )}
                            {imgSrc ? (
                                <img src={imgSrc} alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="text-gray-300 text-lg uppercase tracking-widest font-bold px-4 text-center">
                                    {product.name}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* [우측] 상품 정보 영역 */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="border-b border-gray-100 pb-8">
                            <span className="text-[#968064] text-[13px] font-bold tracking-[0.2em] uppercase mb-3 block">
                                {product.categoryName} Collection
                            </span>
                            <h2 className="text-[28px] md:text-[36px] font-medium text-[#333] mb-4 tracking-tight leading-tight">
                                {product.name}
                            </h2>

                            {isInactive && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 rounded-sm flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    <span className="text-[14px] font-medium">현재 판매가 중단되었거나 삭제된 상품입니다.</span>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                {discountRate && (
                                    <span className="text-[26px] md:text-[32px] font-bold text-[#E23600]">
                                        {discountRate}%
                                    </span>
                                )}
                                <span className="text-[26px] md:text-[32px] font-bold text-[#333]">
                                    {product.price?.toLocaleString()}원
                                </span>
                                {product.suggestedPrice > product.price && (
                                    <span className="text-[16px] md:text-[18px] text-gray-400 line-through font-light mt-1.5">
                                        {product.suggestedPrice?.toLocaleString()}원
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 옵션 선택 (셀렉트박스 방식) */}
                        {hasOptions && (() => {
                            const title1 = product.options[0]?.title1;
                            const title2 = product.options[0]?.title2;
                            const name1Set = [...new Set(product.options.map(o => o.name1))];
                            const selectedName1 = selectedOption?.name1 || '';
                            const name2Options = title2 ? product.options.filter(o => o.name1 === selectedName1) : [];

                            return (
                                <div className="flex flex-col gap-3">
                                    {/* 1차 옵션 셀렉트 */}
                                    <select value={selectedName1}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!val) { setSelectedOption(null); return; }
                                            if (title2) {
                                                setSelectedOption({ name1: val });
                                            } else {
                                                const opt = product.options.find(o => o.name1 === val);
                                                if (opt) addSelectedItem(opt);
                                            }
                                        }}
                                        className="w-full border border-gray-200 px-4 py-3 text-[13px] text-[#555] bg-white rounded-sm outline-none focus:border-[#333] transition-colors">
                                        <option value="">{title1} 선택</option>
                                        {name1Set.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>

                                    {/* 2차 옵션 셀렉트 */}
                                    {title2 && selectedName1 && (
                                        <select value=""
                                            onChange={(e) => {
                                                const optId = Number(e.target.value);
                                                if (!optId) return;
                                                const opt = product.options.find(o => o.optionId === optId);
                                                if (opt) { addSelectedItem(opt); setSelectedOption(null); }
                                            }}
                                            className="w-full border border-gray-200 px-4 py-3 text-[13px] text-[#555] bg-white rounded-sm outline-none focus:border-[#333] transition-colors">
                                            <option value="">{title2} 선택</option>
                                            {name2Options.map(opt => (
                                                <option key={opt.optionId} value={opt.optionId} disabled={opt.stockQuantity <= 0}>
                                                    {opt.name2}{opt.extraPrice > 0 ? ` (+${opt.extraPrice.toLocaleString()}원)` : ''}{opt.stockQuantity <= 0 ? ' (품절)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {/* 선택된 옵션 목록 */}
                                    {selectedItems.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-2">
                                            {selectedItems.map(si => (
                                                <div key={si.option.optionId} className="bg-[#f9f9f9] border border-gray-100 p-4 rounded-sm">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-[13px] text-[#555]">{getOptionLabel(si.option)}</span>
                                                        <button onClick={() => removeItem(si.option.optionId)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center border border-gray-200 bg-white overflow-hidden rounded-sm">
                                                            <button onClick={() => updateItemQuantity(si.option.optionId, -1)}
                                                                className="px-3 py-1.5 hover:bg-gray-100 text-sm border-r border-gray-200">-</button>
                                                            <span className="px-3 py-1.5 text-[13px] font-bold min-w-[36px] text-center">{si.quantity}</span>
                                                            <button onClick={() => updateItemQuantity(si.option.optionId, 1)}
                                                                className="px-3 py-1.5 hover:bg-gray-100 text-sm border-l border-gray-200">+</button>
                                                        </div>
                                                        <span className="text-[14px] font-bold text-[#333]">
                                                            {((product.price + (si.option.extraPrice || 0)) * si.quantity).toLocaleString()}원
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* 옵션 없는 상품: 수량 선택 */}
                        {!hasOptions && (
                            <div className="bg-[#fcfcfc] p-7 flex flex-col gap-5 border border-gray-50 rounded-sm">
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <span className="text-[#555]">구매 수량</span>
                                    <div className="flex items-center border border-gray-200 bg-white shadow-sm overflow-hidden rounded-sm">
                                        <button onClick={() => handleQuantity('minus')}
                                            className="px-4 py-2 hover:bg-gray-100 transition-colors border-r border-gray-200 text-lg">-</button>
                                        <input type="text" value={quantity} readOnly
                                            className="w-12 text-center outline-none text-[15px] font-bold text-[#333]" />
                                        <button onClick={() => handleQuantity('plus')}
                                            className="px-4 py-2 hover:bg-gray-100 transition-colors border-l border-gray-200 text-lg">+</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 총 금액 */}
                        <div className="flex justify-between items-end py-5 border-t border-gray-100">
                            <span className="text-[14px] font-bold text-gray-400 uppercase tracking-wider">
                                총 상품금액{hasOptions && selectedItems.length > 0 ? ` (${selectedItems.reduce((s, si) => s + si.quantity, 0)}개)` : ''}
                            </span>
                            <span className="text-[28px] font-black text-[#333]">
                                {totalAmount.toLocaleString()}원
                            </span>
                        </div>

                        {/* 구매 액션 버튼 */}
                        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 flex gap-2 z-[100] md:relative md:bg-transparent md:border-none md:p-0 md:mt-4 md:z-auto">
                            <button onClick={handleWishToggle}
                                className="group w-14 h-14 border border-gray-200 flex items-center justify-center hover:border-red-400 bg-white transition-all shrink-0 rounded-sm active:scale-95">
                                <span className={`text-2xl transition-colors ${isWished ? 'text-red-500' : 'text-gray-300 group-hover:text-red-500'}`}>&#9829;</span>
                            </button>
                            <button onClick={isInactive ? null : handleAddToCart}
                                disabled={isInactive}
                                className={`flex-1 h-14 border border-[#343434] font-medium text-[14px] md:text-[15px] transition-all bg-white rounded-sm active:bg-gray-100 ${isInactive ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-200' : 'text-[#343434] hover:bg-gray-50'
                                    }`}>
                                {isInactive ? '구매 불가' : '장바구니'}
                            </button>
                            <button onClick={isInactive ? null : handleDirectOrder}
                                disabled={isInactive}
                                className={`flex-[2.5] h-14 font-bold text-[14px] md:text-[15px] transition-all shadow-md rounded-sm ${isInactive ? 'bg-gray-300 text-white cursor-not-allowed shadow-none' : 'bg-[#343434] text-white hover:bg-black active:scale-[0.97]'
                                    }`}>
                                {isInactive ? '판매 중지된 상품' : '바로 구매하기'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 하단 상세 탭 */}
                <div className="mt-28 border-t border-gray-100">
                    <div className="flex justify-center gap-6 md:gap-16 relative">
                        {tabs.map((tab, idx) => (
                            <button key={idx} onClick={() => setActiveTab(idx)}
                                className={`relative py-10 text-[14px] md:text-[16px] transition-all duration-300 tracking-tight ${activeTab === idx ? 'text-[#333] font-bold' : 'text-gray-300 hover:text-gray-500'
                                    }`}>
                                {tab}
                                {activeTab === idx && (
                                    <span className="absolute top-0 left-0 w-full h-[3px] bg-[#333] transition-all" />
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab === 0 && <DescriptionTab product={product} />}
                    {activeTab === 1 && <ReviewTab productId={product.productId} onCountChange={handleReviewCountChange} />}
                    {activeTab === 2 && <QnATab productId={product.productId} />}
                    {activeTab === 3 && <ShippingInfoTab />}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
