import type { PageResponse } from './common';

export interface Product {
    id: number;
    productId: string;
    name: string;          // UI에서 사용
    productName: string;   // DTO에서 사용
    categoryCode: string;
    categoryName?: string;
    description: string | null;
    price: number;         // UI에서 사용 (할인가 등)
    retailPrice: number;   // 정가
    unitPrice: number;     // 판매가
    suggestedPrice: number; // 권장소비자가 (UI의 suggestedPrice)
    stockQuantity: number;
    productStatus: 'SALE' | 'SOLDOUT' | 'STOP';
    mainImageUrl: string | null;
    imageUrls: string[] | null;
    images?: ProductImage[]; // UI에서 사용
    options?: ProductOption[];
    optionYn?: 'Y' | 'N';
    deleteYn?: 'Y' | 'N';
    applyYn?: 'Y' | 'N';
}

export interface ProductImage {
    id: number;
    url: string;
    filePath: string;
    isMain: 'Y' | 'N';
}

export interface ProductOption {
    optionId: number;
    title1: string;
    name1: string;
    title2?: string;
    name2?: string;
    extraPrice: number;
    stockQuantity: number;
}

export interface ProductListItem {
    id: number;
    productId: string;
    name: string;
    productName: string;
    price: number;
    retailPrice: number;
    unitPrice: number;
    suggestedPrice: number;
    categoryName: string;
    mainImageUrl: string | null;
    images?: ProductImage[];
    productStatus: string;
    siteCd: string;
}

export interface ProductSitePrice {
    siteId: number;
    siteCd: string;
    shopName: string;
    unitPrice: number;
    retailPrice: number;
}

export interface Review {
    id: number;
    reviewId: number;      // API에서 반환하는 ID
    productId: string;
    memberCode: string;
    memberName: string;
    rating: number;
    title: string;
    content: string;
    imageUrl: string | null;
    likeCount: number;
    isLiked: boolean;      // UI에서 사용 (likedByMe와 동일 의미)
    likedByMe: boolean;
    createdAt: string;
}

export type ProductPage = PageResponse<ProductListItem>;
export type ReviewPage = PageResponse<Review>;
