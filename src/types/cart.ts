export interface CartItem {
    cartId: number;
    productId: string;
    productName: string;
    optionId: number | null;
    optionName: string | null;
    quantity: number;
    unitPrice: number;
    retailPrice: number;
    totalPrice: number;
    mainImageUrl: string | null;
}

export interface AddProduct {
    id: string | number;
    name?: string;
    price?: number;
    image?: string;
    img?: string; // backward compat
    optionId?: number | null;
}

export interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    loading: boolean;
    addToCart: (product: AddProduct, quantity?: number) => Promise<void>;
    updateQuantity: (cartId: number, delta: number) => Promise<void>;
    removeItem: (cartId: number) => Promise<void>;
    removeItems: (cartIds: number[]) => Promise<void>;
    selectedIds: number[];
    setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
    fetchCart: () => Promise<void>;
}
