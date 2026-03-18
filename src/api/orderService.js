import api from './config';

const orderService = {
    /** 주문 생성 (기존 1-step — backward compat) */
    createOrder: (data) => api.post('/orders', data),

    /** Phase 1: 주문 준비 (임시 저장, orderNo 발급) */
    prepareOrder: (data) => api.post('/orders/prepare', data),

    /** Phase 3: 주문 확정 (PG 결제 후 실주문 생성) */
    confirmOrder: (data) => api.post('/orders/confirm', data),

    /** 주문 목록 조회 (페이징 + 날짜 필터) */
    getOrders: (params = {}) => api.get('/orders', { params }),

    /** 주문 상세 조회 */
    getOrder: (orderId) => api.get(`/orders/${orderId}`),

    /** 주문 취소 */
    cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel`),
};

export default orderService;
