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
    },
    refresh: async () => {
        // 💡 axios 설정에 withCredentials: true가 있으면
        // 브라우저가 쿠키에 있는 refreshToken을 알아서 서버로 보냅니다.
        const response = await api.post('/auth/refresh');
        return response.data;
    },

    // src/api/authService.js 업데이트
    // src/api/authService.js
    signup: async (signupData) => {
        try {
            const response = await api.post('/auth/signup', {
                memberName: signupData.memberName || "",
                memberId: signupData.memberId || "",
                password: signupData.password || "",
                mobilePhone: signupData.mobilePhone || "",
                zipcode: signupData.zipcode || "",
                address: signupData.address || "",
                addressDetail: signupData.addressDetail || "",
                email: signupData.email || "",
                memberType: "U", // 일반 사용자
                // 명세서에 있는 나머지 필드들도 반드시 포함 (null 보다는 빈 문자열)
                businessNumber: "",
                companyName: "",
                ceoName: "",
                phone: ""
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: '가입 규격이 맞지 않습니다.' };
        }
    },
};