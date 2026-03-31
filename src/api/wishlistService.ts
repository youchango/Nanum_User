import api from './config';
import type { ApiResponse, PageResponse } from '../types/common';
import type { WishlistItem } from '../types/wishlist';

const SITE_CD = (import.meta.env.VITE_SITE_CD as string) || 'NANUM';

const wishlistService = {
    /** 찜 목록 조회 (페이지네이션) */
    getWishlist: (page: number = 1, size: number = 10): Promise<ApiResponse<PageResponse<WishlistItem>>> =>
        api.get<ApiResponse<PageResponse<WishlistItem>>>('/wishlist', { params: { page, size, siteCd: SITE_CD } }).then(res => res.data),

    /** 찜 토글 (추가/제거) */
    toggleWishlist: (productId: string | number): Promise<ApiResponse<boolean>> =>
        api.post<ApiResponse<boolean>>('/wishlist', { productId, siteCd: SITE_CD }).then(res => res.data),

    /** 찜 삭제 */
    deleteWishlist: (productId: string | number): Promise<ApiResponse<void>> =>
        api.delete<ApiResponse<void>>(`/wishlist/${productId}`, { params: { siteCd: SITE_CD } }).then(res => res.data),
};

export default wishlistService;
