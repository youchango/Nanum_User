import api from './config';

export const authService = {
    // POST /api/v1/auth/login
    login: async (loginId, password) => {
        try {
            const response = await api.post('/auth/login', {
                loginId,
                password
            });
            return response.data; // { status, message, data: { accessToken, ... } }
        } catch (error) {
            // 400, 401, 500 등 에러 처리
            throw error.response?.data || { message: '네트워크 에러가 발생했습니다.' };
        }
    }
};