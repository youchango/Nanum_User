import api from './config';
import type { ApiResponse } from '../types/common';

const cartService = {
    /** 장바구니 목록 조회 */
    getCartList: (): Promise<ApiResponse<any[]>> => 
        api.get<ApiResponse<any[]>>('/cart').then(res => res.data),

    /** 장바구니 추가 (forceUpdate: 중복 시 수량 합산 여부) */
    addToCart: (productId: number | string, quantity: number, optionId: number | null = null, forceUpdate = false): Promise<ApiResponse<any>> =>
        api.post<ApiResponse<any>>('/cart', { productId, optionId, quantity, forceUpdate }).then(res => res.data),

    /** 수량 변경 */
    updateQuantity: (cartId: number, quantity: number): Promise<ApiResponse<any>> =>
        api.put<ApiResponse<any>>(`/cart/${cartId}`, { quantity }).then(res => res.data),

    /** 단건 삭제 */
    deleteItem: (cartId: number): Promise<ApiResponse<any>> => 
        api.delete<ApiResponse<any>>(`/cart/${cartId}`).then(res => res.data),

    /** 다건 삭제 */
    deleteItems: (cartIds: number[]): Promise<ApiResponse<any>> => 
        api.delete<ApiResponse<any>>('/cart', { data: cartIds }).then(res => res.data),
};

export default cartService;
