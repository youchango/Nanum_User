import api from './config';

const taxBillService = {
    /** 세금계산서 정보 목록 */
    getInfoList: () => api.get('/tax-bill/info'),

    /** 세금계산서 정보 등록 */
    createInfo: (data) => api.post('/tax-bill/info', data),

    /** 세금계산서 정보 수정 */
    updateInfo: (id, data) => api.put(`/tax-bill/info/${id}`, data),

    /** 세금계산서 정보 삭제 */
    deleteInfo: (id) => api.delete(`/tax-bill/info/${id}`),

    /** 발행 신청 */
    applyTaxBill: (data) => api.post('/tax-bill/apply', data),

    /** 신청 목록 */
    getApplyList: (page = 0, size = 10) => api.get('/tax-bill/apply', { params: { page, size } }),

    /** 신청 상세 */
    getApplyDetail: (id) => api.get(`/tax-bill/apply/${id}`),
};

export default taxBillService;
