import api from './config';

const claimService = {
    createClaim: (data) => api.post('/claims', data),
    getMyClaims: (page = 0, size = 10) => api.get('/claims', { params: { page, size } }),
    getClaimDetail: (id) => api.get(`/claims/${id}`),
};

export default claimService;
