import api from './config';

const SITE_CD = import.meta.env.VITE_SITE_CD || 'NANUM';
const inquiryService = {
    getInquiries: (page = 0, size = 10) => api.get('/inquiries', { params: { page, size, siteCd: SITE_CD } }),
    getInquiry: (id) => api.get(`/inquiries/${id}`),
    createInquiry: (data) => api.post('/inquiries', { ...data, siteCd: SITE_CD }),
    getProductInquiries: (productId, page = 0, size = 10) =>
        api.get(`/inquiries/product/${productId}`, { params: { page, size, siteCd: SITE_CD } }),
};

export default inquiryService;
