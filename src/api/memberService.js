import api from './config';

const memberService = {
    getProfile: () => api.get('/members/me'),
    updateProfile: (data) => api.put('/members/me', data),
    withdraw: (password) => api.post('/members/withdraw', { password }),
    sendCode: (data) => api.post('/members/send-code', data),
    verifyCode: (data) => api.post('/members/verify-code', data),
    resetPassword: (data) => api.post('/members/reset-password', data),
};

export default memberService;
