export interface User {
    memberCode: string;
    memberId: string;
    memberName: string;
    memberType: 'U' | 'B' | 'V'; // USER, BIZ, VETERAN
    email?: string;
    mobilePhone?: string;
    zipcode?: string;
    address?: string;
    addressDetail?: string;
    marketingYn?: 'Y' | 'N';
}

export interface LoginResult {
    accessToken: string;
    refreshToken?: string;
    member: User;
}

export interface SignupRequest {
    memberName: string;
    memberId: string;
    password?: string;
    mobilePhone?: string;
    zipcode?: string;
    address?: string;
    addressDetail?: string;
    email?: string;
    memberType?: string;
    businessNumber?: string;
    companyName?: string;
    ceoName?: string;
    businessType?: string;
    businessItem?: string;
    marketingYn?: 'Y' | 'N';
}
