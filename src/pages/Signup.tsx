import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PolicyModal from '../components/PolicyModal';
import { POLICY_DATA } from '../data/policyData';
import { authService } from '../api/authService';
import memberService from '../api/memberService';
import usePostcode from '../hooks/usePostcode';

const Signup = () => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const { openPostcode } = usePostcode();


    // [상태 관리] 명세서 규격 반영
    const [memberType, setMemberType] = useState(null); // null=미선택, 'U'=일반, 'B'=기업
    const [emailCodeSent, setEmailCodeSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailVerifyCode, setEmailVerifyCode] = useState('');
    const [emailCountdown, setEmailCountdown] = useState(0);

    useEffect(() => {
        if (emailCountdown <= 0) return;
        const t = setInterval(() => setEmailCountdown(prev => prev - 1), 1000);
        return () => clearInterval(t);
    }, [emailCountdown]);

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
        // 기업회원 전용
        companyName: '',
        ceoName: '',
        businessNumber: '',
        businessType: '',
        businessItem: '',
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
            const response = await authService.checkId(formData.memberId, memberType);

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
        if (!emailVerified) {
            alert('이메일 인증을 완료해주세요.');
            return;
        }
        if (!formData.address) {
            alert('주소 검색을 통해 주소를 입력해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            // 2. 백엔드 전송 데이터 구성
            // 기업회원 추가 검증
            if (memberType === 'B') {
                if (!formData.companyName.trim()) { alert('상호명을 입력해주세요.'); setIsLoading(false); return; }
                if (!formData.ceoName.trim()) { alert('대표자명을 입력해주세요.'); setIsLoading(false); return; }
                if (!formData.businessNumber.trim()) { alert('사업자등록번호를 입력해주세요.'); setIsLoading(false); return; }
            }

            const submitData = {
                ...formData,
                memberType,
                phone: "",
                marketingYn: agreements.marketing ? "Y" : "N"
            };

            // 3. API 호출
            const response = await authService.signup(submitData);

            // 4. 성공 시 처리 (백엔드 응답 규격 "200" 또는 "SUCCESS" 확인)
            if (response.status === "200" || response.message === "OK" || response.status === "SUCCESS") {
                alert(`${formData.memberName}님, 회원가입이 완료되었습니다.\n로그인 페이지로 이동합니다.`);

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

    // 미선택 상태 → 유형 선택 화면
    if (!memberType) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] px-6 py-20 font-sans text-[#343434]">
                <div className="max-w-[500px] mx-auto bg-white p-8 md:p-12 border border-gray-100 shadow-sm">
                    <div className="text-center mb-12">
                        <h2 className="text-[26px] font-bold tracking-tight mb-3">회원가입</h2>
                        <p className="text-[14px] text-gray-400 font-light">가입 유형을 선택해주세요.</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <button onClick={() => setMemberType('U')}
                                className="w-full py-8 border border-gray-200 rounded-sm hover:border-[#333] hover:bg-[#fafafa] transition-all group">
                            <p className="text-[18px] font-bold text-[#333] group-hover:text-[#968064] mb-2">일반 회원</p>
                            <p className="text-[13px] text-gray-400 font-light">개인 고객으로 가입합니다.</p>
                        </button>
                        <button onClick={() => setMemberType('B')}
                                className="w-full py-8 border border-gray-200 rounded-sm hover:border-[#333] hover:bg-[#fafafa] transition-all group">
                            <p className="text-[18px] font-bold text-[#333] group-hover:text-[#968064] mb-2">기업 회원</p>
                            <p className="text-[13px] text-gray-400 font-light">사업자 정보를 등록하고 기업 전용 혜택을 받습니다.</p>
                        </button>
                    </div>
                    <div className="mt-8 text-center">
                        <button onClick={() => navigate('/shop/login')} className="text-[13px] text-gray-400 underline hover:text-[#333]">이미 계정이 있으신가요?</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] px-6 py-20 font-sans text-[#343434]">
            <div className="max-w-[500px] mx-auto bg-white p-8 md:p-12 border border-gray-100 shadow-sm">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <button onClick={() => setMemberType(null)} className="text-gray-400 hover:text-[#333] text-[14px]">&larr;</button>
                        <h2 className="text-[26px] font-bold tracking-tight">
                            {memberType === 'B' ? '기업 회원가입' : '회원가입'}
                        </h2>
                    </div>
                    <p className="text-[14px] text-gray-400 font-light">나눔의 새로운 가족이 되어주세요.</p>
                </div>

                <form className="flex flex-col gap-6" onSubmit={handleSignup}>
                    {/* 기업회원 전용 - 사업자 정보 */}
                    {memberType === 'B' && (
                        <div className="flex flex-col gap-4 bg-[#fafafa] p-5 rounded-sm border border-gray-100 mb-2">
                            <h3 className="text-[13px] font-bold text-[#968064] uppercase tracking-widest">사업자 정보</h3>
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-[#666] ml-1">상호명 <span className="text-[#968064]">*</span></label>
                                <input name="companyName" type="text" value={formData.companyName} onChange={handleChange}
                                       className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none bg-white" placeholder="상호명" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-[#666] ml-1">대표자명 <span className="text-[#968064]">*</span></label>
                                <input name="ceoName" type="text" value={formData.ceoName} onChange={handleChange}
                                       className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none bg-white" placeholder="대표자명" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-[#666] ml-1">사업자등록번호 <span className="text-[#968064]">*</span></label>
                                <input name="businessNumber" type="text" value={formData.businessNumber} onChange={handleChange}
                                       className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none bg-white" placeholder="000-00-00000" maxLength={12} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-[#999] ml-1">업태</label>
                                    <input name="businessType" type="text" value={formData.businessType} onChange={handleChange}
                                           className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none bg-white" placeholder="업태" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-[#999] ml-1">종목</label>
                                    <input name="businessItem" type="text" value={formData.businessItem} onChange={handleChange}
                                           className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none bg-white" placeholder="종목" />
                                </div>
                            </div>
                        </div>
                    )}

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

                    {/* 이메일 (필수 + 인증) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#999] ml-1">이메일 <span className="text-red-400">*</span></label>
                        <div className="flex gap-2">
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => { handleChange(e); setEmailVerified(false); setEmailCodeSent(false); }}
                                className="flex-1 border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none bg-[#f9f9f9]"
                                placeholder="example@nanum.com"
                                disabled={emailVerified}
                                required
                            />
                            <button type="button"
                                disabled={emailVerified || emailCountdown > 0}
                                onClick={async () => {
                                    if (!formData.email || !formData.email.includes('@')) { alert('올바른 이메일을 입력해주세요.'); return; }
                                    try {
                                        const res = await memberService.sendEmailCode({ email: formData.email, purpose: 'SIGNUP' });
                                        const result = res.data;
                                        if (result.status === 'SUCCESS') {
                                            setEmailCodeSent(true);
                                            setEmailCountdown(180);
                                            alert('인증번호가 발송되었습니다.' + (result.data?.devCode ? ` (개발모드: ${result.data.devCode})` : ''));
                                        } else {
                                            alert(result.message);
                                        }
                                    } catch (err) { alert(err.response?.data?.message || '인증번호 발송에 실패했습니다.'); }
                                }}
                                className={`shrink-0 px-4 py-3.5 text-[13px] font-bold transition-all ${
                                    emailVerified ? 'bg-green-50 text-green-600 border border-green-200' :
                                    emailCountdown > 0 ? 'bg-gray-100 text-gray-400 border border-gray-200' :
                                    'bg-[#343434] text-white hover:bg-black'
                                }`}>
                                {emailVerified ? '인증완료' : emailCountdown > 0 ? `${Math.floor(emailCountdown/60)}:${String(emailCountdown%60).padStart(2,'0')}` : emailCodeSent ? '재발송' : '인증요청'}
                            </button>
                        </div>
                        {emailCodeSent && !emailVerified && (
                            <div className="flex gap-2">
                                <input type="text" value={emailVerifyCode}
                                    onChange={(e) => setEmailVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex-1 border border-gray-200 px-4 py-3 text-sm focus:border-[#333] outline-none bg-[#f9f9f9] tracking-[0.3em] text-center font-mono"
                                    placeholder="인증번호 6자리" maxLength={6} />
                                <button type="button"
                                    onClick={async () => {
                                        if (emailVerifyCode.length !== 6) { alert('인증번호 6자리를 입력해주세요.'); return; }
                                        try {
                                            const res = await memberService.verifyEmailCode({ email: formData.email, purpose: 'SIGNUP', code: emailVerifyCode });
                                            if (res.data.status === 'SUCCESS') {
                                                setEmailVerified(true);
                                                setEmailCountdown(0);
                                            } else {
                                                alert(res.data.message);
                                            }
                                        } catch (err) { alert(err.response?.data?.message || '인증 실패'); }
                                    }}
                                    className="shrink-0 px-4 py-3 text-[13px] font-bold bg-[#968064] text-white hover:bg-[#7a6850] transition-all">
                                    확인
                                </button>
                            </div>
                        )}
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