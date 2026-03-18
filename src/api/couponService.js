import api from './config';

const couponService = {
    getAvailable: (page = 0, size = 10) => api.get('/coupons', { params: { page, size } }),
    getAll: (page = 0, size = 10) => api.get('/coupons/all', { params: { page, size } }),
};

export default couponService;
