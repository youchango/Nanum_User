import api from './config';

const memberService = {
    getProfile: () => api.get('/members/me'),
    updateProfile: (data) => api.put('/members/me', data),
    withdraw: (password) => api.post('/members/withdraw', { password }),
    resetPassword: (data) => api.post('/members/reset-password', data),
};

export default memberService;
