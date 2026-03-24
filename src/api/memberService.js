import api from './config';

const memberService = {
    getProfile: () => api.get('/members/me'),
    updateProfile: (data) => api.put('/members/me', data),
    withdraw: (password) => api.post('/members/withdraw', { password }),

    // 이메일 인증
    sendEmailCode: (data) => api.post('/members/send-email-code', data),
    verifyEmailCode: (data) => api.post('/members/verify-email-code', data),

    // SMS 인증
    sendCode: (data) => api.post('/members/send-code', data),
    verifyCode: (data) => api.post('/members/verify-code', data),

    // 비밀번호 재설정
    resetPassword: (data) => api.post('/members/reset-password', data),
};

export default memberService;
