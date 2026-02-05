import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePostcode from "../hooks/usePostcode.js";

const MyPageEdit = () => {
    const navigate = useNavigate();
    const { openPostcode } = usePostcode();

    // 1. 초기 데이터 (마케팅 동의 여부 추가)
    const mockUser = {
        memberId: 'nanum_user77',
        memberName: '김나눔',
        mobilePhone: '010-1234-5678',
        email: 'hello@nanum.com',
        zipcode: '12345',
        address: '서울시 강남구 테헤란로 123',
        addressDetail: '나눔빌딩 7층',
        marketingAgreed: true // 추가된 필드
    };

    const [formData, setFormData] = useState({
        ...mockUser,
        password: '',
        confirmPassword: ''
    });

    const [isPwMatch, setIsPwMatch] = useState(null);

    useEffect(() => {
        if (formData.confirmPassword) {
            setIsPwMatch(formData.password === formData.confirmPassword);
        } else {
            setIsPwMatch(null);
        }
    }, [formData.password, formData.confirmPassword]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // 체크박스일 경우 checked 값을 사용
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddressSearch = () => {
        openPostcode((data) => {
            setFormData(prev => ({
                ...prev,
                zipcode: data.zonecode,
                address: data.address,
                addressDetail: ''
            }));
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        console.log("수정 요청 데이터:", formData);
        alert("정보 수정이 완료되었습니다!");
        navigate('/shop/mypage');
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] py-20 px-6 font-sans text-[#333]">
            <div className="max-w-[550px] mx-auto bg-white border border-gray-100 p-8 md:p-12 shadow-sm">

                <header className="text-center mb-12">
                    <h2 className="text-[28px] font-bold tracking-tight mb-2 uppercase">Edit Profile</h2>
                    <p className="text-gray-400 text-sm font-light">회원님의 소중한 정보를 안전하게 관리하세요.</p>
                </header>

                <form className="flex flex-col gap-8" onSubmit={handleSave}>

                    {/* 기본 정보 섹션 */}
                    <div className="flex flex-col gap-5">
                        <h3 className="text-[13px] font-black text-[#968064] uppercase tracking-widest border-b border-gray-50 pb-2">기본 정보</h3>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">ID</label>
                            <input type="text" value={formData.memberId} readOnly className="w-full bg-[#f5f5f5] border border-gray-100 px-4 py-3.5 text-sm text-gray-400 cursor-not-allowed outline-none" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Name</label>
                            <input name="memberName" type="text" value={formData.memberName} onChange={handleChange} className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none" />
                        </div>

                        {/* ⭐️ 이메일 필드 추가 */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Email</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none" placeholder="example@nanum.com" />
                        </div>
                    </div>

                    {/* 비밀번호 변경 섹션 */}
                    <div className="flex flex-col gap-5 bg-[#fafafa] p-6 rounded-sm">
                        <h3 className="text-[13px] font-black text-[#968064] uppercase tracking-widest">비밀번호 변경</h3>
                        <div className="flex flex-col gap-3">
                            <input name="password" type="password" placeholder="새 비밀번호 (변경 시에만 입력)" value={formData.password} onChange={handleChange} className="w-full border border-gray-200 bg-white px-4 py-3.5 text-sm focus:border-[#333] outline-none" />
                            <input name="confirmPassword" type="password" placeholder="새 비밀번호 확인" value={formData.confirmPassword} onChange={handleChange} className={`w-full border bg-white px-4 py-3.5 text-sm outline-none ${isPwMatch === true ? 'border-green-500' : isPwMatch === false ? 'border-red-400' : 'border-gray-200'}`} />
                            {isPwMatch === false && <p className="text-[11px] text-red-500 ml-1">비밀번호가 일치하지 않습니다.</p>}
                        </div>
                    </div>

                    {/* 연락처 및 주소 섹션 */}
                    <div className="flex flex-col gap-5">
                        <h3 className="text-[13px] font-black text-[#968064] uppercase tracking-widest border-b border-gray-50 pb-2">연락처 및 주소</h3>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Phone</label>
                            <input name="mobilePhone" type="tel" value={formData.mobilePhone} onChange={handleChange} className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Address</label>
                            <div className="flex gap-2">
                                <input type="text" value={formData.zipcode} readOnly className="w-24 bg-[#f9f9f9] border border-gray-200 px-4 py-3.5 text-sm text-gray-500" />
                                <button type="button" onClick={handleAddressSearch} className="px-6 py-3.5 border border-[#333] text-[12px] font-bold hover:bg-[#333] hover:text-white active:scale-95 transition-all">주소 검색</button>
                            </div>
                            <input type="text" value={formData.address} readOnly className="w-full bg-[#f9f9f9] border border-gray-200 px-4 py-3.5 text-sm text-gray-500 mt-1" />
                            <input name="addressDetail" type="text" placeholder="상세주소를 입력하세요" value={formData.addressDetail} onChange={handleChange} className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none mt-1" />
                        </div>
                    </div>

                    {/* ⭐️ 마케팅 수신 동의 섹션 추가 */}
                    <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
                        <h3 className="text-[13px] font-black text-[#968064] uppercase tracking-widest">수신 동의 설정</h3>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="marketingAgreed"
                                checked={formData.marketingAgreed}
                                onChange={handleChange}
                                className="w-5 h-5 accent-[#333]"
                            />
                            <span className="text-[14px] text-gray-600 group-hover:text-[#333] transition-colors">
                                [선택] 마케팅 정보 수신 동의 (이벤트, 할인 혜택 등 알림)
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 border border-gray-200 text-gray-400 font-bold text-[14px] hover:bg-gray-50">취소</button>
                        <button type="submit" className="flex-[2] py-4 bg-[#343434] text-white font-bold text-[14px] hover:bg-black transition-all shadow-md active:scale-[0.98]">저장하기</button>
                    </div>
                </form>

                <div className="mt-12 text-center border-t border-gray-50 pt-8">
                    <button type="button" onClick={() => navigate('/shop/mypage/withdrawal')} className="text-[12px] text-gray-300 underline hover:text-red-400 transition-colors">회원 탈퇴를 원하시나요?</button>
                </div>
            </div>
        </div>
    );
};

export default MyPageEdit;