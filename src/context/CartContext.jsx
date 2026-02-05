import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    // ⭐️ [추가] 선택된 아이템 ID들을 전역에서 관리 (페이지 이동 시 유지용)
    const [selectedIds, setSelectedIds] = useState([]);
    // ⭐️ [추가] 최초 로드 여부 파악
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. 로컬스토리지를 읽어오는 공통 함수
    const loadCart = () => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);

        // ⭐️ 최초 로드 시에만 모든 아이템을 선택 상태로 설정
        if (!isInitialized && savedCart.length > 0) {
            setSelectedIds(savedCart.map(item => item.id));
            setIsInitialized(true);
        }
    };

    // 2. 초기 로드 및 실시간 스토리지 감지
    useEffect(() => {
        loadCart();
        const handleStorageChange = () => loadCart();

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('cartUpdate', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cartUpdate', handleStorageChange);
        };
    }, [isInitialized]); // 초기화 플래그에 따라 재실행 방지

    // 3. 상태 업데이트 및 스토리지 저장 통합 함수
    const saveCart = (newItems) => {
        // ⭐️ 상품이 삭제된 경우 selectedIds에서도 해당 ID를 제거
        const newItemIds = newItems.map(item => item.id);
        setSelectedIds(prev => prev.filter(id => newItemIds.includes(id)));

        setCartItems(newItems);
        localStorage.setItem('cart', JSON.stringify(newItems));
        window.dispatchEvent(new Event('cartUpdate'));
    };

    // [로직] 장바구니 추가
    const addToCart = (product, quantity = 1) => {
        const user = localStorage.getItem('user');
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            window.location.href = '/shop/login';
            return;
        }

        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
        let newCart;

        if (existingItemIndex > -1) {
            newCart = [...cartItems];
            newCart[existingItemIndex].quantity += quantity;
        } else {
            newCart = [...cartItems, {
                id: product.id,
                name: product.name,
                price: typeof product.price === 'string' ? parseInt(product.price.replace(/,/g, '')) : product.price,
                image: product.image || product.img,
                quantity: quantity
            }];
            // ⭐️ 새로 추가된 상품은 자동으로 선택 목록에 추가
            setSelectedIds(prev => [...prev, product.id]);
        }

        saveCart(newCart);

        if (window.confirm('장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?')) {
            window.location.href = '/shop/cart';
        }
    };

    // [로직] 수량 조절
    const updateQuantity = (id, delta) => {
        const newCart = cartItems.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        );
        saveCart(newCart);
    };

    // [로직] 상품 삭제
    const removeItem = (id) => {
        if (window.confirm('장바구니에서 삭제하시겠습니까?')) {
            const newCart = cartItems.filter(item => item.id !== id);
            saveCart(newCart); // saveCart 내부에서 selectedIds도 함께 정리됨
        }
    };

    const cartCount = cartItems.length;

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            addToCart,
            updateQuantity,
            removeItem,
            selectedIds,   // ⭐️ 추가
            setSelectedIds // ⭐️ 추가
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);