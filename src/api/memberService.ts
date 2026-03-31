import api from './config';
import type { ApiResponse } from '../types/common';

const memberService = {
    getProfile: (): Promise<ApiResponse<any>> => 
        api.get<ApiResponse<any>>('/members/me').then(res => res.data),
    
    updateProfile: (data: any): Promise<ApiResponse<any>> => 
        api.put<ApiResponse<any>>('/members/me', data).then(res => res.data),
    
    withdraw: (password: string): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/members/withdraw', { password }).then(res => res.data),

    // 이메일 인증
    sendEmailCode: (data: any): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/members/send-email-code', data).then(res => res.data),
    
    verifyEmailCode: (data: any): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/members/verify-email-code', data).then(res => res.data),

    // SMS 인증
    sendCode: (data: any): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/members/send-code', data).then(res => res.data),
    
    verifyCode: (data: any): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/members/verify-code', data).then(res => res.data),

    // 비밀번호 재설정
    resetPassword: (data: any): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/members/reset-password', data).then(res => res.data),
};

export default memberService;
