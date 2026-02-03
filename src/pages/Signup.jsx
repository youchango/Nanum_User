import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PolicyModal from '../components/PolicyModal';
import { POLICY_DATA } from '../data/policyData';

const Signup = () => {
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // 상태 관리
    const [userId, setUserId] = useState('');
    const [idStatus, setIdStatus] = useState(null);
    const [idMessage, setIdMessage] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPwMatch, setIsPwMatch] = useState(null);
    const [pwMessage, setPwMessage] = useState('');

    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const [agreements, setAgreements] = useState({
        all: false, terms: false, privacy: false, marketing: false
    });

    // 모달 상태 관리 추가
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '' });

    // [로직] 모달 열기 함수
    const openModal = (type) => setModalConfig({ isOpen: true, type });

    // [로직] 휴대폰 번호 숫자만 입력 + 하이픈 자동 생성
    const handlePhoneChange = (e) => {
        const input = e.target;
        const selectionStart = input.selectionStart;
        const originalValue = input.value;
        const value = originalValue.replace(/[^0-9]/g, '');

        let formattedValue = '';
        if (value.length <= 3) {
            formattedValue = value;
        } else if (value.length <= 7) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length <= 11) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
        } else {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }

        setPhone(formattedValue);

        setTimeout(() => {
            if (inputRef.current) {
                let nextCursorPosition = selectionStart;
                const isDeleting = originalValue.length > formattedValue.length;

                if (isDeleting && originalValue[selectionStart] === '-') {
                    nextCursorPosition--;
                } else if (!isDeleting && formattedValue[selectionStart - 1] === '-') {
                    nextCursorPosition++;
                }

                inputRef.current.setSelectionRange(nextCursorPosition, nextCursorPosition);
            }
        }, 0);
    };

    // [로직] 아이디 중복 확인
    const checkDuplicateId = () => {
        if (!userId) {
            setIdStatus('error');
            setIdMessage('아이디를 입력해주세요.');
            return;
        }
        if (userId.length < 4) {
            setIdStatus('error');
            setIdMessage('아이디는 최소 4자 이상이어야 합니다.');
            return;
        }
        if (userId === 'admin' || userId === 'test') {
            setIdStatus('error');
            setIdMessage('이미 사용 중인 아이디입니다.');
        } else {
            setIdStatus('success');
            setIdMessage('사용 가능한 아이디입니다.');
        }
    };

    // [로직] 비밀번호 일치 체크
    useEffect(() => {
        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                setIsPwMatch(true);
                setPwMessage('비밀번호가 일치합니다.');
            } else {
                setIsPwMatch(false);
                setPwMessage('비밀번호가 일치하지 않습니다.');
            }
        } else {
            setIsPwMatch(null);
            setPwMessage('');
        }
    }, [password, confirmPassword]);

    // [로직] 약관 전체 동의
    const handleAllCheck = (e) => {
        const isChecked = e.target.checked;
        setAgreements({ all: isChecked, terms: isChecked, privacy: isChecked, marketing: isChecked });
    };

    // [로직] 개별 약관 동의
    const handleCheck = (name) => {
        setAgreements(prev => {
            const newState = { ...prev, [name]: !prev[name] };
            newState.all = newState.terms && newState.privacy && newState.marketing;
            return newState;
        });
    };

    // [로직] 가입하기 버튼 클릭
    const handleSignup = (e) => {
        e.preventDefault();
        if (idStatus !== 'success') { alert('아이디 중복확인을 완료해주세요.'); return; }
        if (!password || password.length < 8) { alert('비밀번호는 8자 이상이어야 합니다.'); return; }
        if (!isPwMatch) { alert('비밀번호가 일치하지 않습니다.'); return; }
        if (!userName) { alert('이름을 입력해주세요.'); return; }
        if (phone.length < 12) { alert('휴대폰 번호를 정확히 입력해주세요.'); return; }
        if (!agreements.terms || !agreements.privacy) { alert('필수 약관에 동의해주세요.'); return; }

        alert(`🎉 축하합니다! ${userName}님, 가입이 완료되었습니다.`);
        navigate('/shop/login');
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] px-6 py-20 font-sans text-[#343434]">
            <div className="max-w-[480px] mx-auto bg-white p-8 md:p-12 border border-gray-100 shadow-sm">

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
                                type="text"
                                value={userId}
                                maxLength={20}
                                onChange={(e) => { setUserId(e.target.value); setIdStatus(null); }}
                                className={`flex-grow border px-4 py-3.5 text-sm outline-none transition-all bg-[#f9f9f9] ${idStatus === 'success' ? 'border-green-500 bg-white' : idStatus === 'error' ? 'border-red-500 bg-white' : 'border-gray-200 focus:border-[#333]'}`}
                                placeholder="4~20자 영문, 숫자"
                            />
                            <button type="button" onClick={checkDuplicateId} className="px-4 py-3 border border-[#343434] text-[#343434] text-[12px] font-bold hover:bg-[#343434] hover:text-white transition-all active:scale-95">중복확인</button>
                        </div>
                        {idMessage && <p className={`text-[11px] ml-1 ${idStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>{idMessage}</p>}
                    </div>

                    {/* 휴대폰 번호 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#666] ml-1">휴대폰 번호 <span className="text-[#968064]">*</span></label>
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                maxLength={13}
                                className="flex-grow border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9]"
                                placeholder="010-0000-0000"
                            />
                            <button type="button" className="px-4 py-3 border border-gray-300 text-gray-500 text-[12px] font-medium hover:bg-gray-50">인증번호 받기</button>
                        </div>
                    </div>

                    {/* 비밀번호 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#666] ml-1">비밀번호 <span className="text-[#968064]">*</span></label>
                        <input
                            type="password"
                            value={password}
                            maxLength={30}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9]"
                            placeholder="8자 이상 30자 이하"
                        />
                        <label className="text-[12px] font-bold text-[#666] ml-1 mt-2">비밀번호 확인 <span className="text-[#968064]">*</span></label>
                        <input
                            type="password"
                            value={confirmPassword}
                            maxLength={30}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full border px-4 py-3.5 text-sm outline-none transition-all bg-[#f9f9f9] ${isPwMatch === true ? 'border-green-500 bg-white' : isPwMatch === false ? 'border-red-500 bg-white' : 'border-gray-200 focus:border-[#333]'}`}
                            placeholder="비밀번호 재입력"
                        />
                        {pwMessage && <p className={`text-[11px] ml-1 ${isPwMatch ? 'text-green-600' : 'text-red-500'}`}>{pwMessage}</p>}
                    </div>

                    {/* 이름 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#666] ml-1">이름 <span className="text-[#968064]">*</span></label>
                        <input
                            type="text"
                            value={userName}
                            maxLength={15}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9]"
                            placeholder="성함을 입력해주세요"
                        />
                    </div>

                    {/* 이메일 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#999] ml-1">이메일 <span className="font-normal text-[11px]">(선택)</span></label>
                        <input
                            type="email"
                            value={email}
                            maxLength={50}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9]"
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
                                    {/* '보기' 버튼 클릭 시 모달 열기 연결 */}
                                    {idx < 2 && (
                                        <button
                                            type="button"
                                            onClick={() => openModal(item)}
                                            className="text-[11px] text-gray-400 underline hover:text-[#333]"
                                        >
                                            보기
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full py-5 bg-[#343434] text-white font-bold text-[16px] mt-8 hover:bg-black transition-all active:scale-[0.98] shadow-lg">
                        가입하기
                    </button>
                </form>

                {/* 정책 모달 컴포넌트 추가 */}
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