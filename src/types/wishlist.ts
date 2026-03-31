export interface WishlistItem {
    wishlistId: number;
    productId: string | number;
    productName: string;
    unitPrice: number;
    retailPrice?: number;
    thumbnailUrl?: string;
    createdAt?: string;
}

export interface WishlistPage {
    content: WishlistItem[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}
