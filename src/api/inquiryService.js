import api from './config';

const inquiryService = {
    getInquiries: (page = 0, size = 10) => api.get('/inquiries', { params: { page, size } }),
    getInquiry: (id) => api.get(`/inquiries/${id}`),
    createInquiry: (data) => api.post('/inquiries', data),
    getProductInquiries: (productId, page = 0, size = 10) =>
        api.get(`/inquiries/product/${productId}`, { params: { page, size } }),
};

export default inquiryService;
