import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { categoryService } from '../api/categoryService';
import productService from '../api/productService';

const ProductList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCategoryId, setSelectedCategoryId] = useState({ main: null, sub: null });
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // URL 파라미터 변경 감지
    useEffect(() => {
        const catId = searchParams.get('category') ? Number(searchParams.get('category')) : null;
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || '';

        if (catId) {
            setSelectedCategoryId({ main: catId, sub: null });
            setActiveTab('all');
        } else if (sort === 'best') {
            setActiveTab('best');
            setSelectedCategoryId({ main: null, sub: null });
        } else if (sort === 'new') {
            setActiveTab('new');
            setSelectedCategoryId({ main: null, sub: null });
        } else {
            // 파라미터 없음 → 전체 초기화
            setSelectedCategoryId({ main: null, sub: null });
            setActiveTab('all');
        }
        setSearchInput(search);
        setSearchQuery(search);
    }, [searchParams]);

    const observerRef = useRef();
    const PAGE_SIZE = 12;

    // 카테고리 로드
    useEffect(() => {
        const fetchCategories = async () => {
            const data = await categoryService.getCategoryTree();
            setCategories(data);
        };
        fetchCategories();
    }, []);

    const FIXED_COUNT = 12;

    // 상품 목록 서버 페이징 조회
    const fetchProducts = useCallback(async (pageNum, reset = false) => {
        setLoading(true);
        try {
            const isFixedTab = activeTab === 'best' || activeTab === 'new';
            const params = {
                page: isFixedTab ? 1 : pageNum,
                recordSize: isFixedTab ? FIXED_COUNT : PAGE_SIZE,
            };
            if (activeTab === 'best') params.sort = 'best';
            if (searchQuery.trim()) params.keyword = searchQuery.trim();
            if (selectedCategoryId.sub) {
                params.categoryId = selectedCategoryId.sub;
            } else if (selectedCategoryId.main) {
                params.categoryId = selectedCategoryId.main;
            }
            const res = await productService.getProducts(params);
            const pageData = res.data?.data || {};
            const content = pageData.content || [];

            if (reset) {
                setProducts(content);
            } else {
                setProducts(prev => [...prev, ...content]);
            }
            setHasMore(isFixedTab ? false : content.length >= PAGE_SIZE);
        } catch (e) {
            console.error('상품 조회 실패:', e);
            if (reset) setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCategoryId, searchQuery, activeTab]);

    // 필터 변경 시 초기화
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchProducts(1, true);
    }, [selectedCategoryId, activeTab, searchQuery]);

    // 페이지 증가 시 추가 로드
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page, false);
        }
    }, [page, fetchProducts]);

    const lastElementRef = useCallback((node) => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observerRef.current.observe(node);
    }, [loading, hasMore]);

    const getDiscountRate = (price, suggestedPrice) => {
        if (!suggestedPrice || suggestedPrice <= price) return null;
        return Math.floor(((suggestedPrice - price) / suggestedPrice) * 100);
    };

    const getMainImage = (item) => {
        if (item.images && item.images.length > 0) {
            const main = item.images.find(img => img.isMain === 'Y') || item.images[0];
            return main.url || main.filePath;
        }
        return null;
    };

    const handleAddToCart = (e, item) => {
        e.stopPropagation();
        addToCart({ id: item.productId, name: item.name, price: item.price, image: getMainImage(item) }, 1);
    };

    return (
        <div className="w-full bg-white pb-[300px] relative">
            <div className="sticky top-[60px] md:top-[76px] z-[500] bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-[1290px] mx-auto px-6 py-4 flex flex-col gap-4 bg-white">
                    {/* 검색창 */}
                    <form className="relative w-full" onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); }}>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="찾으시는 상품명을 입력하고 엔터를 누르세요."
                            className="w-full h-11 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-full text-[14px] outline-none focus:border-[#968064] focus:bg-white transition-all"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </form>

                    {/* 카테고리 바 (PC만) */}
                    <div className="relative text-[13px] font-bold text-[#bbb] py-1 hidden md:block">
                        <div className="flex items-start gap-6">
                            <div className="flex gap-5 border-r pr-5 border-gray-200 shrink-0 pt-0.5">
                                {['all', 'best', 'new'].map(tab => (
                                    <button key={tab} onClick={() => { setActiveTab(tab); setSelectedCategoryId({ main: null, sub: null }); }}
                                            className={`transition-all uppercase pb-1 whitespace-nowrap ${activeTab === tab && !selectedCategoryId.main ? 'text-[#333] border-b-2 border-[#333]' : 'hover:text-[#333]'}`}>
                                        {tab === 'all' ? '전체' : tab === 'best' ? '베스트' : '신상품'}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-x-5 gap-y-2 flex-wrap items-center">
                                {categories.map((cat) => (
                                    <button key={cat.id}
                                        onClick={() => { setSelectedCategoryId({ main: cat.id, sub: null }); setActiveTab('all'); }}
                                        className={`transition-all pb-1 whitespace-nowrap ${selectedCategoryId.main === cat.id ? 'text-[#968064] border-b-2 border-[#968064]' : 'hover:text-[#333]'}`}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* 모바일: 현재 카테고리 표시 */}
                    {selectedCategoryId.main && (
                        <p className="md:hidden text-[12px] text-[#968064] font-medium pt-2">{categories.find(c => c.id === selectedCategoryId.main)?.name}</p>
                    )}

                    {/* 2depth 서브카테고리 필 버튼 (PC/모바일 공통) */}
                    {categories.map((cat) => (
                        cat.subs && cat.subs.length > 0 && selectedCategoryId.main === cat.id && (
                            <div key={`sub-${cat.id}`} className="flex gap-2 flex-wrap pt-3 mt-2 border-t border-gray-100 text-[13px] font-bold">
                                <button className={`px-3 py-1 text-[12px] rounded-full border transition-colors ${!selectedCategoryId.sub ? 'bg-[#968064] text-white border-[#968064]' : 'text-[#888] border-gray-200 hover:border-[#968064] hover:text-[#968064]'}`}
                                    onClick={() => setSelectedCategoryId({ main: cat.id, sub: null })}>전체</button>
                                {cat.subs.map(sub => (
                                    <button key={sub.id}
                                        className={`px-3 py-1 text-[12px] rounded-full border transition-colors ${selectedCategoryId.sub === sub.id ? 'bg-[#968064] text-white border-[#968064]' : 'text-[#888] border-gray-200 hover:border-[#968064] hover:text-[#968064]'}`}
                                        onClick={() => setSelectedCategoryId({ main: cat.id, sub: sub.id })}>{sub.name}</button>
                                ))}
                            </div>
                        )
                    ))}
                </div>
            </div>

            <section className="max-w-[1290px] mx-auto px-6 py-12">
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                        {products.map((item, index) => {
                            const discountRate = getDiscountRate(item.price, item.suggestedPrice);
                            const imgSrc = getMainImage(item);
                            return (
                                <div key={item.productId} ref={products.length === index + 1 ? lastElementRef : null}
                                     className="group cursor-pointer flex flex-col"
                                     onClick={() => navigate(`/shop/product/${item.productId}`)}>
                                    <div className="relative aspect-[3/4] bg-[#f9f9f9] mb-4 overflow-hidden shadow-sm">
                                        {discountRate && <div className="absolute top-0 right-0 bg-[#E23600] text-white text-[11px] font-bold px-3 py-1.5 z-10 shadow-sm">{discountRate}% OFF</div>}
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No Image</div>
                                        )}
                                        <button className="absolute bottom-0 left-0 w-full bg-[#333]/90 py-4 text-white text-[12px] font-bold translate-y-full group-hover:translate-y-0 transition-transform"
                                                onClick={(e) => handleAddToCart(e, item)}>장바구니 담기</button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] text-[#968064] font-bold uppercase">{item.categoryName}</p>
                                        <h3 className="text-[14px] text-[#333] font-medium truncate">{item.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[15px] font-bold text-[#333]">{item.price?.toLocaleString()}원</p>
                                            {item.suggestedPrice > item.price && <p className="text-[12px] text-gray-400 line-through font-light">{item.suggestedPrice?.toLocaleString()}원</p>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : !loading ? (
                    <div className="py-40 text-center flex flex-col items-center">
                        <p className="text-gray-400 font-medium">검색 결과가 없습니다.</p>
                    </div>
                ) : null}
                {loading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#968064] border-t-transparent rounded-full animate-spin"></div></div>}
            </section>
        </div>
    );
};

export default ProductList;
