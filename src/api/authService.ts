import api from './config';
import type { ApiResponse } from '../types/common';
import type { LoginResult, SignupRequest } from '../types/auth';

export const authService = {
    // POST /api/v1/auth/login
    login: async (loginId: string, password: string): Promise<ApiResponse<LoginResult>> => {
        try {
            const response = await api.post<ApiResponse<LoginResult>>('/auth/login', {
                loginId,
                password
            });
            return response.data; // { status, message, data: { accessToken, ... } }
        } catch (error: any) {
            // 400, 401, 500 등 에러 처리
            throw error.response?.data || { message: '네트워크 에러가 발생했습니다.' };
        }
    },
    refresh: async (): Promise<ApiResponse<any>> => {
        // 💡 axios 설정에 withCredentials: true가 있으면
        // 브라우저가 쿠키에 있는 refreshToken을 알아서 서버로 보냅니다.
        const response = await api.post<ApiResponse<any>>('/auth/refresh');
        return response.data;
    },

    signup: async (signupData: SignupRequest): Promise<ApiResponse<any>> => {
        try {
            const response = await api.post<ApiResponse<any>>('/auth/signup', {
                memberName: signupData.memberName || "",
                memberId: signupData.memberId || "",
                password: signupData.password || "",
                mobilePhone: signupData.mobilePhone || "",
                zipcode: signupData.zipcode || "",
                address: signupData.address || "",
                addressDetail: signupData.addressDetail || "",
                email: signupData.email || "",
                memberType: signupData.memberType || "U",
                businessNumber: signupData.businessNumber || "",
                companyName: signupData.companyName || "",
                ceoName: signupData.ceoName || "",
                businessType: signupData.businessType || "",
                businessItem: signupData.businessItem || "",
                marketingYn: signupData.marketingYn || "N",
                phone: ""
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: '가입 규격이 맞지 않습니다.' };
        }
    },
    checkId: async (memberId: string, memberType: string = 'U'): Promise<ApiResponse<boolean>> => {
        try {
            const response = await api.get<ApiResponse<boolean>>('/members/check-id', {
                // ⭐️ params 객체로 넘겨야 ?memberId=xxx&memberType=U 형태로 변환됩니다.
                params: {
                    memberId: memberId,
                    memberType: memberType
                }
            });
            return response.data; // { status: "200", data: true/false ... }
        } catch (error: any) {
            // 상세 에러 로그 확인을 위해 에러 전체를 던집니다.
            throw error;
        }
    },
};