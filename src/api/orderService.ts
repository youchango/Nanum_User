import api from './config';
import type { ApiResponse, PageResponse } from '../types/common';
import type { Order, OrderPrepareResult, OrderRequest } from '../types/order';

const orderService = {
    /** 주문 생성 (기존 1-step — backward compat) */
    createOrder: (data: OrderRequest): Promise<ApiResponse<Order>> =>
        api.post<ApiResponse<Order>>('/orders', data).then(res => res.data),

    /** Phase 1: 주문 준비 (임시 저장, orderNo 발급) */
    prepareOrder: (data: OrderRequest): Promise<ApiResponse<OrderPrepareResult>> =>
        api.post<ApiResponse<OrderPrepareResult>>('/orders/prepare', data).then(res => res.data),

    /** Phase 3: 주문 확정 (PG 결제 후 실주문 생성) */
    confirmOrder: (data: { orderNo: string; paymentKey: string; amount: number }): Promise<ApiResponse<Order>> =>
        api.post<ApiResponse<Order>>('/orders/confirm', data).then(res => res.data),

    /** 주문 목록 조회 (페이징 + 날짜 필터) */
    getOrders: (params: { page?: number; size?: number; startDate?: string; endDate?: string } = {}): Promise<ApiResponse<PageResponse<Order>>> =>
        api.get<ApiResponse<PageResponse<Order>>>('/orders', { params }).then(res => res.data),

    /** 주문 상세 조회 */
    getOrder: (orderId: string | number): Promise<ApiResponse<Order>> =>
        api.get<ApiResponse<Order>>(`/orders/${orderId}`).then(res => res.data),

    /** 주문 취소 */
    cancelOrder: (orderId: string | number): Promise<ApiResponse<void>> =>
        api.post<ApiResponse<void>>(`/orders/${orderId}/cancel`).then(res => res.data),
};

export default orderService;
