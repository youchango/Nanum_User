import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import cartService from '../api/cartService';
import type { CartContextType, CartItem, AddProduct } from '../types/cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const isLoggedIn = (): boolean => !!localStorage.getItem('accessToken');

    // 서버에서 장바구니 목록 조회
    const fetchCart = useCallback(async (): Promise<void> => {
        if (!isLoggedIn()) {
            setCartItems([]);
            setSelectedIds([]);
            return;
        }
        try {
            setLoading(true);
            const res = await cartService.getCartList();
            const items: CartItem[] = res.data || [];
            setCartItems(items);
            setSelectedIds(prev => {
                if (prev.length === 0 && items.length > 0) {
                    return items.map(item => item.cartId);
                }
                // 기존 선택 유지하되, 삭제된 항목 제거
                const validIds = items.map(item => item.cartId);
                return prev.filter(id => validIds.includes(id));
            });
        } catch (e) {
            console.error('장바구니 조회 실패:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // 로그인 상태 변경 시 장바구니 로드
    useEffect(() => {
        fetchCart();
        const handleAuthChange = () => fetchCart();
        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, [fetchCart]);

    // 장바구니 추가
    const addToCart = async (product: AddProduct, quantity: number = 1): Promise<void> => {
        if (!isLoggedIn()) {
            alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
            const currentPath = window.location.pathname;
            window.location.href = `/shop/login?redirect=${currentPath}`;
            return;
        }

        try {
            await cartService.addToCart(product.id, quantity, product.optionId || null, false);
            await fetchCart();
            if (window.confirm('장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?')) {
                window.location.href = '/shop/cart';
            }
        } catch (e: any) {
            if (e.response?.status === 409) {
                // 이미 장바구니에 있는 상품 → 수량 합산 여부 확인
                if (window.confirm('이미 장바구니에 담긴 상품입니다. 수량을 추가하시겠습니까?')) {
                    try {
                        await cartService.addToCart(product.id, quantity, product.optionId || null, true);
                        await fetchCart();
                        if (window.confirm('수량이 추가되었습니다. 장바구니로 이동하시겠습니까?')) {
                            window.location.href = '/shop/cart';
                        }
                    } catch (retryErr: any) {
                        alert('장바구니 추가에 실패했습니다.');
                        console.error(retryErr);
                    }
                }
            } else {
                alert('장바구니 추가에 실패했습니다.');
                console.error(e);
            }
        }
    };

    // 수량 변경
    const updateQuantity = async (cartId: number, delta: number): Promise<void> => {
        const item = cartItems.find(i => i.cartId === cartId);
        if (!item) return;

        const newQty = Math.max(1, item.quantity + delta);
        if (newQty === item.quantity) return;

        // 낙관적 업데이트
        setCartItems(prev =>
            prev.map(i => i.cartId === cartId ? { ...i, quantity: newQty, totalPrice: i.unitPrice * newQty } : i)
        );

        try {
            await cartService.updateQuantity(cartId, newQty);
        } catch (e) {
            console.error('수량 변경 실패:', e);
            await fetchCart(); // 실패 시 서버 데이터로 복원
        }
    };

    // 단건 삭제
    const removeItem = async (cartId: number): Promise<void> => {
        try {
            await cartService.deleteItem(cartId);
            await fetchCart();
        } catch (e) {
            alert('삭제에 실패했습니다.');
            console.error(e);
        }
    };

    // 다건 삭제
    const removeItems = async (cartIds: number[]): Promise<void> => {
        if (cartIds.length === 0) return;
        try {
            await cartService.deleteItems(cartIds);
            await fetchCart();
        } catch (e) {
            alert('삭제에 실패했습니다.');
            console.error(e);
        }
    };

    const cartCount = cartItems.length;

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            loading,
            addToCart,
            updateQuantity,
            removeItem,
            removeItems,
            selectedIds,
            setSelectedIds,
            fetchCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
