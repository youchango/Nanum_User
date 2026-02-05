import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/config';
const ProductList = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // 1. 상태 관리
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // 서버에서 받아올 카테고리
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCategoryId, setSelectedCategoryId] = useState({ main: null, sub: null });

    const observerRef = useRef();

    // ⭐️ 2. 카테고리 API 호출 및 데이터 가공
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // ⭐️ 기존 fetch 대신 api.get 사용
                // baseURL이 '/api/v1'으로 되어있다면 '/categories'만 적으면 됩니다.
                const response = await api.get('/categories');
                console.log(response);
                // axios는 응답 본문이 response.data에 들어있습니다.
                const result = response.data;

                if (result && result.data) {
                    const rawData = result.data;
                    const mainCategories = rawData
                        .filter(cat => cat.depth === 0)
                        .map(main => ({
                            id: main.categoryId,
                            name: main.categoryName,
                            // 자식 카테고리를 찾을 때 parentGroupId와 categoryId 비교 확인
                            subs: rawData.filter(sub => sub.depth === 1 && sub.parentGroupId === main.categoryId)
                        }));
                    setCategories(mainCategories);
                }
            } catch (error) {
                // ⭐️ 이제 403 에러가 나더라도 catch에서 잡히며,
                // 만약 401(만료)이라면 config.js의 인터셉터가 자동으로 재시도합니다.
                console.error("❌ 카테고리 로딩 실패:", error.response?.status || error.message);
            }
        };

        fetchCategories();
    }, []);

    // 3. 고정 상품 데이터 (기존과 동일)
    const fixedProducts = [
        { id: 1, name: "Nanum 쌀 (백미)", price: 36000, originalPrice: 45000, category: "쌀", subCategory: "백미", img: "/images/product1.jpg" },
        { id: 2, name: "따뜻한 베이지 머그", price: 18000, originalPrice: null, category: "키친", subCategory: "컵/잔", img: "/images/product2.jpg" },
        { id: 3, name: "내추럴 린넨 에이프런", price: 28800, originalPrice: 32000, category: "의류", subCategory: "린넨", img: "/images/product3.jpg" },
        { id: 4, name: "유기농 흑미 1kg", price: 24000, originalPrice: null, category: "쌀", subCategory: "흑미", img: "/images/product4.jpg" },
        { id: 5, name: "오가닉 코튼 수건 세트", price: 23200, originalPrice: 29000, category: "욕실", subCategory: "수건", img: "/images/product5.jpg" },
        { id: 6, name: "세라믹 화분 (S)", price: 15000, originalPrice: null, category: "리빙", subCategory: "인테리어", img: "/images/product6.jpg" },
        { id: 7, name: "빈티지 우드 트레이", price: 19800, originalPrice: 22000, category: "키친", subCategory: "조리도구", img: "/images/product7.jpg" },
        { id: 8, name: "핸드드립 세트", price: 52200, originalPrice: 58000, category: "키친", subCategory: "컵/잔", img: "/images/product8.jpg" },
        { id: 9, name: "천연 소이 캔들", price: 19000, originalPrice: null, category: "리빙", subCategory: "인테리어", img: "/images/product9.jpg" },
        { id: 10, name: "모던 세라믹 화병", price: 31500, originalPrice: 35000, category: "리빙", subCategory: "인테리어", img: "/images/product10.jpg" },
        { id: 11, name: "순면 발매트", price: 9600, originalPrice: 12000, category: "욕실", subCategory: "욕실소품", img: "/images/product11.jpg" },
        { id: 12, name: "리플 슬리퍼", price: 15000, originalPrice: null, category: "의류", subCategory: "홈웨어", img: "/images/product12.jpg" },
    ];

    const getDiscountRate = (price, originalPrice) => {
        if (!originalPrice) return null;
        return Math.floor(((originalPrice - price) / originalPrice) * 100);
    };

    // 4. 필터링 및 페칭 로직
    const getFilteredData = useCallback(() => {
        let data = [...fixedProducts];
        const mainCat = categories.find(c => c.id === selectedCategoryId.main);
        if (mainCat) {
            data = data.filter(p => p.category === mainCat.name);
            if (selectedCategoryId.sub) {
                const subCat = mainCat.subs.find(s => s.categoryId === selectedCategoryId.sub);
                if (subCat) data = data.filter(p => p.subCategory === subCat.categoryName);
            }
        }
        return data;
    }, [selectedCategoryId, categories]);

    const fetchProducts = useCallback((pageNum, isFirstLoad = false) => {
        const filtered = getFilteredData();
        const pageSize = 8;
        const start = isFirstLoad ? 0 : 12 + (pageNum - 2) * pageSize;
        const end = start + (isFirstLoad ? 12 : pageSize);
        const nextSlice = filtered.slice(start, end);

        if (isFirstLoad) {
            setProducts(nextSlice);
            setHasMore(nextSlice.length < filtered.length);
        } else {
            setLoading(true);
            setTimeout(() => {
                setProducts(prev => [...prev, ...nextSlice]);
                setLoading(false);
                if (end >= filtered.length) setHasMore(false);
            }, 300);
        }
    }, [getFilteredData]);

    useEffect(() => {
        setPage(1); setHasMore(true); fetchProducts(1, true);
    }, [selectedCategoryId, activeTab, fetchProducts]);

    useEffect(() => {
        if (page > 1) fetchProducts(page, false);
    }, [page, fetchProducts]);

    const lastElementRef = useCallback((node) => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observerRef.current.observe(node);
    }, [loading, hasMore]);

    return (
        <div className="w-full bg-white pb-20">
            {/* 상단 탭 및 카테고리 바 */}
            <section className="bg-[#f8f5f2] py-16 px-6 text-center">
                <h2 className="text-[32px] md:text-[38px] font-medium text-[#333] uppercase">SHOP</h2>
            </section>

            <section className="max-w-[1290px] mx-auto px-6 py-6 border-b border-gray-100 flex items-center gap-6 text-[13px] font-bold text-[#bbb]">
                <div className="flex gap-6 border-r pr-6 border-gray-200">
                    {['all', 'best', 'new'].map(tab => (
                        <button key={tab} onClick={() => { setActiveTab(tab); setSelectedCategoryId({ main: null, sub: null }); }}
                                className={`transition-all uppercase pb-1 ${activeTab === tab && !selectedCategoryId.main ? 'text-[#333] border-b-2 border-[#333]' : 'hover:text-[#333]'}`}>
                            {tab === 'all' ? '전체보기' : tab === 'best' ? '베스트' : '신상품'}
                        </button>
                    ))}
                </div>

                {/* ⭐️ 서버에서 가져온 카테고리 동적 렌더링 */}
                <div className="flex gap-8">
                    {categories.map((cat) => (
                        <div key={cat.id} className="relative group/cat py-1">
                            <button onClick={() => { setSelectedCategoryId({ main: cat.id, sub: null }); setActiveTab('all'); }}
                                    className={`transition-all pb-1 ${selectedCategoryId.main === cat.id ? 'text-[#968064] border-b-2 border-[#968064]' : 'hover:text-[#333]'}`}>{cat.name}</button>

                            {cat.subs && cat.subs.length > 0 && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-300 z-[100]">
                                    <ul className="bg-white border border-gray-100 shadow-xl py-3 min-w-[120px] text-center rounded-sm">
                                        <li className={`px-4 py-2 text-[12px] cursor-pointer hover:text-[#968064] ${selectedCategoryId.main === cat.id && !selectedCategoryId.sub ? 'text-[#968064] font-bold' : 'text-[#888]'}`}
                                            onClick={() => setSelectedCategoryId({ main: cat.id, sub: null })}>전체보기</li>
                                        {cat.subs.map(sub => (
                                            <li key={sub.categoryId} className={`px-4 py-2 text-[12px] cursor-pointer hover:text-[#968064] ${selectedCategoryId.sub === sub.categoryId ? 'text-[#968064] font-bold' : 'text-[#888]'}`}
                                                onClick={() => setSelectedCategoryId({ main: cat.id, sub: sub.categoryId })}>{sub.categoryName}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 상품 그리드 영역 (기존 할인 로직 포함 동일) */}
            <section className="max-w-[1290px] mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                    {products.map((item, index) => {
                        const discountRate = getDiscountRate(item.price, item.originalPrice);
                        return (
                            <div key={item.id} ref={products.length === index + 1 ? lastElementRef : null}
                                 className="group cursor-pointer flex flex-col"
                                 onClick={() => navigate(`/shop/product/${item.id}`)}>
                                {/* ... (중략: 이미지, 할인 뱃지, 장바구니 버튼 렌더링) */}
                                <div className="relative aspect-[3/4] bg-[#f9f9f9] mb-4 overflow-hidden shadow-sm">
                                    {discountRate && <div className="absolute top-0 right-0 bg-[#E23600] text-white text-[11px] font-bold px-3 py-1.5 z-10 shadow-sm">{discountRate}% OFF</div>}
                                    <img src={item.img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <button className="absolute bottom-0 left-0 w-full bg-[#333]/90 py-4 text-white text-[12px] font-bold translate-y-full group-hover:translate-y-0 transition-transform" onClick={(e) => { e.stopPropagation(); addToCart(item, 1); }}>장바구니 담기</button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] text-[#968064] font-bold uppercase">{item.category}</p>
                                    <h3 className="text-[14px] text-[#333] font-medium truncate">{item.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[15px] font-bold text-[#333]">{item.price.toLocaleString()}원</p>
                                        {item.originalPrice && <p className="text-[12px] text-gray-400 line-through font-light">{item.originalPrice.toLocaleString()}원</p>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {loading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#968064] border-t-transparent rounded-full animate-spin"></div></div>}
            </section>
        </div>
    );
};

export default ProductList;