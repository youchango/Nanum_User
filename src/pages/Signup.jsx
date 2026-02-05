import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PolicyModal from '../components/PolicyModal';
import { POLICY_DATA } from '../data/policyData';
import { authService } from '../api/authService';
import usePostcode from '../hooks/usePostcode';

const Signup = () => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const { openPostcode } = usePostcode();


    // [상태 관리] 명세서 규격 반영
    const [formData, setFormData] = useState({
        memberId: '',
        password: '',
        confirmPassword: '',
        memberName: '',
        mobilePhone: '',
        email: '',
        zipcode: '',
        address: '',
        addressDetail: '',
        memberType: 'U' // 일반 사용자 고정
    });

    const [idStatus, setIdStatus] = useState(null); // null, 'success', 'error'
    const [idMessage, setIdMessage] = useState('');
    const [isPwMatch, setIsPwMatch] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPostcodeLoaded, setIsPostcodeLoaded] = useState(false);

    const [agreements, setAgreements] = useState({
        all: false, terms: false, privacy: false, marketing: false
    });

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '' });

    // [로직] Daum 주소 API 스크립트 동적 로드
    useEffect(() => {
        if (window.daum && window.daum.Postcode) {
            setIsPostcodeLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        script.onload = () => setIsPostcodeLoaded(true);
        document.body.appendChild(script);
    }, []);

    // [로직] 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'memberId') {
            setIdStatus(null);
            setIdMessage('');
        }
    };

    // [로직] 주소 검색창 열기
    const handleAddressSearch = () => {
        openPostcode((data) => {
            setFormData(prev => ({
                ...prev,
                zipcode: data.zonecode,
                address: data.address,
                addressDetail: '' // 주소 선택 시 상세주소 초기화
            }));
        });
    };

    // [로직] 휴대폰 번호 하이픈 자동 생성
    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        let formatted = '';
        if (value.length <= 3) formatted = value;
        else if (value.length <= 7) formatted = value.slice(0, 3) + '-' + value.slice(3);
        else formatted = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);

        setFormData(prev => ({ ...prev, mobilePhone: formatted }));
    };

    // [로직] 아이디 중복 확인 (추후 API 연결 가능)
    const checkDuplicateId = async () => {
        // 1. 유효성 검사
        if (!formData.memberId || formData.memberId.length < 4) {
            setIdStatus('error');
            setIdMessage('아이디는 최소 4자 이상이어야 합니다.');
            return;
        }

        try {
            setIsLoading(true); // 로딩 상태 활성화

            // 2. API 호출
            const response = await authService.checkId(formData.memberId, formData.memberType);

            // 3. 응답 처리 (data: true -> 중복, data: false -> 사용 가능)
            if (response.data === true) {
                setIdStatus('error');
                setIdMessage('이미 사용 중인 아이디입니다.');
            } else {
                setIdStatus('success');
                setIdMessage('사용 가능한 아이디입니다.');
            }
        } catch (err) {
            console.error("아이디 중복 확인 실패:", err);
            setIdStatus('error');
            setIdMessage(err.message || '서버와의 통신에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // [로직] 비밀번호 일치 체크
    useEffect(() => {
        if (formData.confirmPassword.length > 0) {
            setIsPwMatch(formData.password === formData.confirmPassword);
        } else {
            setIsPwMatch(null);
        }
    }, [formData.password, formData.confirmPassword]);

    // [로직] 약관 동의 핸들러
    const handleAllCheck = (e) => {
        const isChecked = e.target.checked;
        setAgreements({ all: isChecked, terms: isChecked, privacy: isChecked, marketing: isChecked });
    };

    const handleCheck = (name) => {
        setAgreements(prev => {
            const newState = { ...prev, [name]: !prev[name] };
            newState.all = newState.terms && newState.privacy && newState.marketing;
            return newState;
        });
    };

    // [로직] 가입하기 버튼 클릭 시 실제 API 호출
    const handleSignup = async (e) => {
        e.preventDefault();

        // 1. 사전 검증
        if (idStatus !== 'success') {
            alert('아이디 중복확인을 완료해주세요.');
            return;
        }
        if (!isPwMatch) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!formData.address) {
            alert('주소 검색을 통해 주소를 입력해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            // 2. 백엔드 전송 데이터 구성
            const submitData = {
                ...formData,
                // 하이픈 제거가 필요하다면: mobilePhone: formData.mobilePhone.replace(/-/g, ''),
                memberType: "U",
                businessNumber: "",
                companyName: "",
                ceoName: "",
                phone: ""
            };

            // 3. API 호출
            const response = await authService.signup(submitData);

            // 4. 성공 시 처리 (백엔드 응답 규격 "200" 또는 "SUCCESS" 확인)
            if (response.status === "200" || response.message === "OK" || response.status === "SUCCESS") {
                alert(`🎉 ${formData.memberName}님, 가입을 축하드립니다!\n로그인 페이지로 이동합니다.`);

                // 로그인 페이지로 이동 시 아이디를 들고 갈 수도 있습니다 (선택 사항)
                navigate('/shop/login', { state: { savedId: formData.memberId } });
            }

        } catch (err) {
            console.error("❌ 가입 에러 상세:", err);

            // 중복 아이디 에러 처리
            if (err.message === formData.memberId) {
                alert(`[${err.message}]는 이미 등록된 아이디입니다. 다른 아이디를 사용해주세요.`);
                setIdStatus('error');
                setIdMessage('이미 사용 중인 아이디입니다.');
            } else {
                const errorMsg = err.message && !err.message.includes('?')
                    ? err.message
                    : '가입 양식이 올바르지 않거나 서버 오류가 발생했습니다.';
                alert(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] px-6 py-20 font-sans text-[#343434]">
            <div className="max-w-[500px] mx-auto bg-white p-8 md:p-12 border border-gray-100 shadow-sm">
                <div className="text-center mb-12">
                    <h2 className="text-[26px] font-bold tracking-tight mb-3">회원가입</h2>
                    <p className="text-[14px] text-gray-400 font-light">나눔의 새로운 가족이 되어주세요.</p>
                </div>

                <form className="flex flex-col gap-6" onSubmit={handleSignup}>
                    {/* 아이디 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#666] ml-1">아이디 <span className="text-[#968064]">*</span></label>
                        <div className="flex gap-2">
                            <input
                                name="memberId"
                                type="text"
                                value={formData.memberId}
                                onChange={handleChange}
                                className={`flex-grow border px-4 py-3.5 text-sm outline-none transition-all bg-[#f9f9f9] ${idStatus === 'success' ? 'border-green-500' : idStatus === 'error' ? 'border-red-500' : 'focus:border-[#333] border-gray-200'}`}
                                placeholder="4~20자 영문, 숫자"
                            />
                            <button type="button" onClick={checkDuplicateId} className="px-4 py-3 border border-[#343434] text-[#343434] text-[12px] font-bold hover:bg-[#343434] hover:text-white transition-all active:scale-95">중복확인</button>
                        </div>
                        {idMessage && <p className={`text-[11px] ml-1 ${idStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>{idMessage}</p>}
                    </div>

                    {/* 휴대폰 번호 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#666] ml-1">휴대폰 번호 <span className="text-[#968064]">*</span></label>
                        <input
                            ref={inputRef}
                            type="tel"
                            value={formData.mobilePhone}
                            onChange={handlePhoneChange}
                            maxLength={13}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9]"
                            placeholder="010-0000-0000"
                        />
                    </div>

                    {/* 주소 섹션 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#666] ml-1">주소 <span className="text-[#968064]">*</span></label>
                        <div className="flex gap-2 mb-1">
                            <input
                                name="zipcode"
                                type="text"
                                value={formData.zipcode}
                                readOnly
                                className="w-24 border border-gray-200 px-4 py-3.5 text-sm bg-[#f1f1f1] outline-none"
                                placeholder="우편번호"
                            />
                            <button type="button" onClick={handleAddressSearch} className="px-4 py-3 border border-gray-300 text-[12px] font-bold hover:bg-gray-50">주소 검색</button>
                        </div>
                        <input
                            name="address"
                            type="text"
                            value={formData.address}
                            readOnly
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm bg-[#f1f1f1] outline-none mb-1"
                            placeholder="기본 주소"
                        />
                        <input
                            name="addressDetail"
                            type="text"
                            value={formData.addressDetail}
                            onChange={handleChange}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9]"
                            placeholder="상세 주소를 입력해주세요"
                        />
                    </div>

                    {/* 비밀번호 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#666] ml-1">비밀번호 <span className="text-[#968064]">*</span></label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none bg-[#f9f9f9]"
                            placeholder="8자 이상 입력"
                        />
                        <label className="text-[12px] font-bold text-[#666] ml-1 mt-2">비밀번호 확인 <span className="text-[#968064]">*</span></label>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full border px-4 py-3.5 text-sm outline-none transition-all bg-[#f9f9f9] ${isPwMatch === true ? 'border-green-500 bg-white' : isPwMatch === false ? 'border-red-500 bg-white' : 'border-gray-200 focus:border-[#333]'}`}
                            placeholder="비밀번호 재입력"
                        />
                        {formData.confirmPassword && <p className={`text-[11px] ml-1 ${isPwMatch ? 'text-green-600' : 'text-red-500'}`}>{isPwMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}</p>}
                    </div>

                    {/* 이름 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#666] ml-1">이름 <span className="text-[#968064]">*</span></label>
                        <input
                            name="memberName"
                            type="text"
                            value={formData.memberName}
                            onChange={handleChange}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none bg-[#f9f9f9]"
                            placeholder="실명을 입력해주세요"
                        />
                    </div>

                    {/* 이메일 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#999] ml-1">이메일 <span className="font-normal text-[11px]">(선택)</span></label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none bg-[#f9f9f9]"
                            placeholder="example@nanum.com"
                        />
                    </div>

                    {/* 약관 동의 */}
                    <div className="mt-4 border-t border-gray-100 pt-8">
                        <label className="flex items-center gap-3 cursor-pointer mb-6 group">
                            <input type="checkbox" checked={agreements.all} onChange={handleAllCheck} className="w-5 h-5 accent-[#333]" />
                            <span className="text-[15px] font-bold text-[#333]">전체 동의합니다.</span>
                        </label>
                        <div className="flex flex-col gap-4 ml-1">
                            {['terms', 'privacy', 'marketing'].map((item, idx) => (
                                <div key={item} className="flex justify-between items-center">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={agreements[item]} onChange={() => handleCheck(item)} className="w-4 h-4 accent-[#333]" />
                                        <span className="text-[13px] text-[#666]">
                                            {idx === 0 && '[필수] 이용약관 동의'}
                                            {idx === 1 && '[필수] 개인정보 수집 및 이용 동의'}
                                            {idx === 2 && '[선택] 마케팅 정보 수신 동의'}
                                        </span>
                                    </label>
                                    {idx < 2 && (
                                        <button type="button" onClick={() => setModalConfig({ isOpen: true, type: item })} className="text-[11px] text-gray-400 underline hover:text-[#333]">보기</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-[#343434] text-white font-bold text-[16px] mt-8 hover:bg-black transition-all active:scale-[0.98] shadow-lg disabled:bg-gray-400"
                    >
                        {isLoading ? '가입 처리 중...' : '가입하기'}
                    </button>
                </form>

                <PolicyModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig({ isOpen: false, type: '' })}
                    title={modalConfig.type === 'terms' ? POLICY_DATA.terms.title : POLICY_DATA.privacy.title}
                    content={modalConfig.type === 'terms' ? POLICY_DATA.terms.content : POLICY_DATA.privacy.content}
                />
            </div>
        </div>
    );
};

export default Signup;