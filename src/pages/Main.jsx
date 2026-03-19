import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryService } from '../api/categoryService';
import productService from '../api/productService';
import displayService from '../api/displayService';
import { useCart } from '../context/CartContext';
import PopupLayer from '../components/PopupLayer';

const Main = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState([]); // ⭐️ 서버 카테고리 상태

    const defaultBanners = [
        { id: 1, title: "일상에 나눔을 더하다", desc: "Traditional & Modern Lifestyle", bg: "#ece0d1" },
        { id: 2, title: "정갈한 식탁의 시작", desc: "Premium Organic Selection", bg: "#f4f1ee" },
        { id: 3, title: "자연을 닮은 오브제", desc: "Eco-Friendly Living Item", bg: "#e5e7eb" }
    ];
    const [banners, setBanners] = useState([]);
    const [bannerLoaded, setBannerLoaded] = useState(false);


    const [featuredProducts, setFeaturedProducts] = useState([]);

    const [currentBanner, setCurrentBanner] = useState(0);
    const timerRef = useRef(null);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // ⭐️ 1depth 카테고리 로드
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getCategoryTree();
                setCategories(data);
            } catch (error) {
                console.error("메인 카테고리 로드 실패");
            }
        };
        fetchCategories();
    }, []);

    // 배너 API 로드
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await displayService.getBanners('MAIN_TOP');
                const data = res.data?.data || [];
                if (data.length > 0) {
                    const apiBanners = data
                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                        .map((b) => ({
                            id: b.id,
                            imageUrl: b.files?.[0]?.imageUrl || null,
                            linkUrl: b.linkUrl || null,
                            title: '',
                            desc: '',
                            bg: '#f4f1ee',
                        }));
                    setBanners(apiBanners);
                } else {
                    setBanners(defaultBanners);
                }
            } catch (error) {
                console.error('배너 로드 실패, 기본 배너 사용');
                setBanners(defaultBanners);
            } finally {
                setBannerLoaded(true);
            }
        };
        fetchBanners();
    }, []);

    // 메인 상품 로드
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productService.getMainProducts({ recordSize: 8 });
                const data = res.data?.data || [];
                setFeaturedProducts(data.map(p => ({
                    id: p.productId,
                    name: p.name,
                    price: p.price,
                    suggestedPrice: p.suggestedPrice,
                    img: p.images?.find(i => i.type === 'MAIN')?.imageUrl || '/images/no-image.jpg',
                    categoryName: p.categoryName,
                })));
            } catch (error) {
                console.error("메인 상품 로드 실패");
            }
        };
        fetchProducts();
    }, []);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
    }, [banners.length]);

    useEffect(() => {
        startTimer();
        return () => clearInterval(timerRef.current);
    }, [startTimer]);

    const handleSearch = (e) => {
        e.preventDefault();
        if(!searchQuery.trim()) return;
        navigate(`/shop/products?search=${searchQuery}`);
    };

    const handleManualChange = (index) => { setCurrentBanner(index); startTimer(); };
    const nextSlide = () => handleManualChange(currentBanner === banners.length - 1 ? 0 : currentBanner + 1);
    const prevSlide = () => handleManualChange(currentBanner === 0 ? banners.length - 1 : currentBanner - 1);

    const handleStart = (e) => {
        const clientX = e.type === 'touchstart' ? e.targetTouches[0].clientX : e.clientX;
        setTouchStart(clientX); setTouchEnd(clientX); setIsDragging(true);
    };
    const handleMove = (e) => {
        if (!isDragging) return;
        const clientX = e.type === 'touchmove' ? e.targetTouches[0].clientX : e.clientX;
        setTouchEnd(clientX);
    };
    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const distance = touchStart - touchEnd;
        if (Math.abs(distance) > 50) {
            if (distance > 0) nextSlide();
            else prevSlide();
        }
    };

    return (
        <div className="w-full select-none pt-[60px] md:pt-[76px] bg-white">

            {/* 팝업 레이어 */}
            <PopupLayer />

            {/* 🔍 검색 영역 */}
            <div className="px-4 py-4 md:py-6 max-w-[1200px] mx-auto">
                <form onSubmit={handleSearch} className="relative group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="어떤 상품을 찾으시나요?"
                        className="w-full h-12 md:h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-[14px] md:text-[16px] focus:ring-2 focus:ring-[#968064]/20 transition-all outline-none"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#968064] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </form>
            </div>

            {/* 🍱 ⭐️ 실시간 퀵 카테고리 바 */}
            <div className="px-4 mb-8 overflow-x-auto no-scrollbar">
                <div className="flex justify-start md:justify-center gap-6 md:gap-12 min-w-max mx-auto max-w-[1200px]">
                    {/* '전체보기'는 고정으로 하나 둠 */}
                    <Link to="/shop/products" className="flex flex-col items-center gap-2 group">
                        <div className="w-11 h-11 md:w-12 md:h-12 bg-[#f5f5f5] rounded-xl flex items-center justify-center group-hover:bg-[#ebe6e0] transition-colors">
                            <span className="text-[12px] md:text-[13px] font-semibold text-[#555]">All</span>
                        </div>
                        <span className="text-[12px] md:text-[13px] font-medium text-gray-600 group-hover:text-[#968064]">전체보기</span>
                    </Link>

                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/shop/products?category=${cat.id}`}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-11 h-11 md:w-12 md:h-12 bg-[#f5f5f5] rounded-xl flex items-center justify-center group-hover:bg-[#ebe6e0] transition-colors">
                                <span className="text-[15px] md:text-[16px] font-semibold text-[#555]">{cat.name.charAt(0)}</span>
                            </div>
                            <span className="text-[12px] md:text-[13px] font-medium text-gray-500 group-hover:text-[#968064] whitespace-nowrap">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 📸 배너 섹션 */}
            {!bannerLoaded ? (
                <div className="h-[250px] md:h-[450px] w-full bg-[#f4f1ee] border-y border-gray-50" />
            ) :
            <section
                className="relative h-[250px] md:h-[450px] w-full overflow-hidden bg-white cursor-grab active:cursor-grabbing border-y border-gray-50"
                onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
                onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
            >
                <div className="flex transition-transform duration-700 ease-in-out h-full pointer-events-none" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="w-full h-full flex-shrink-0 relative flex flex-col items-center justify-center text-center px-4"
                            style={{
                                backgroundColor: banner.imageUrl ? 'transparent' : banner.bg,
                                backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            {/* Image banner: show VIEW MORE button only */}
                            {banner.imageUrl ? (
                                <div className="relative z-10 pointer-events-auto">
                                    <Link
                                        to={banner.linkUrl || '/shop/products'}
                                        className="px-5 py-1.5 md:px-8 md:py-2 border border-white text-white text-[11px] md:text-[12px] font-bold hover:bg-white hover:text-[#333] transition-all rounded-sm inline-block backdrop-blur-sm bg-black/10"
                                    >
                                        VIEW MORE
                                    </Link>
                                </div>
                            ) : (
                                <div className="relative z-10 pointer-events-auto">
                                    <span className="text-[10px] md:text-[14px] font-bold text-[#968064] tracking-[0.2em] uppercase mb-1 md:mb-2 block">{banner.desc}</span>
                                    <h1 className="text-[20px] md:text-[36px] font-black text-[#333] leading-tight mb-4 md:mb-6">{banner.title}</h1>
                                    <Link to={banner.linkUrl || '/shop/products'} className="px-5 py-1.5 md:px-8 md:py-2 border border-[#333] text-[#333] text-[11px] md:text-[12px] font-bold hover:bg-[#333] hover:text-white transition-all rounded-sm inline-block">VIEW MORE</Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
                    <div className="text-[10px] md:text-[11px] font-bold text-[#333] tracking-widest">{currentBanner + 1} / {banners.length}</div>
                </div>
            </section>
            }

            {/* 추천 상품 섹션 */}
            <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex flex-col items-center mb-12">
                        <h2 className="text-[20px] md:text-[28px] font-bold text-[#333] tracking-wider uppercase">New Arrival</h2>
                        <div className="w-10 h-[2px] bg-[#968064] mt-3"></div>
                        <p className="text-gray-400 mt-4 text-[13px] md:text-[14px]">나눔이 제안하는 이번 시즌 정갈한 아이템</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-16">
                        {featuredProducts.map((product) => {
                            const discountRate = product.suggestedPrice && product.suggestedPrice > product.price
                                ? Math.floor(((product.suggestedPrice - product.price) / product.suggestedPrice) * 100)
                                : null;
                            return (
                                <Link key={product.id} to={`/shop/product/${product.id}`} className="group">
                                    <div className="aspect-[3/4] bg-[#f9f9f9] overflow-hidden mb-4 relative">
                                        {discountRate && (
                                            <div className="absolute top-0 right-0 bg-[#E23600] text-white text-[11px] font-bold px-3 py-1.5 z-10 shadow-sm">{discountRate}% OFF</div>
                                        )}
                                        {product.img && product.img !== '/images/no-image.jpg' ? (
                                            <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No Image</div>
                                        )}
                                        <button
                                            className="absolute bottom-0 left-0 w-full bg-[#333]/90 py-4 text-white text-[12px] font-bold translate-y-full group-hover:translate-y-0 transition-transform"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ id: product.id, name: product.name, price: product.price, image: product.img }, 1); }}
                                        >장바구니 담기</button>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-[#968064] font-bold uppercase mb-1">{product.categoryName}</p>
                                        <h3 className="text-[14px] md:text-[15px] font-medium text-[#333] mb-1 line-clamp-1 group-hover:text-[#968064] transition-colors">{product.name}</h3>
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                            <p className="text-[14px] md:text-[16px] font-bold text-[#333]">{product.price?.toLocaleString()}원</p>
                                            {product.suggestedPrice > product.price && (
                                                <p className="text-[12px] text-gray-400 line-through font-light">{product.suggestedPrice?.toLocaleString()}원</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-20 text-center">
                        <Link to="/shop/products" className="inline-block px-12 py-4 border border-gray-200 text-[13px] font-bold text-[#666] hover:bg-gray-50 transition-all">
                            전체 상품 보러가기
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Main;