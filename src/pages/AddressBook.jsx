import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import addressService from '../api/addressService';
import usePostcode from '../hooks/usePostcode';
import { formatDate } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';

const MAX_ADDRESSES = 10;

const EMPTY_FORM = {
    addressName: '',
    receiverName: '',
    receiverPhone: '',
    zipcode: '',
    address: '',
    addressDetail: '',
    isDefault: false,
};

const AddressBook = () => {
    const navigate = useNavigate();
    const { openPostcode } = usePostcode();

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            const res = await addressService.getAddresses();
            setAddresses(res.data?.data || []);
        } catch (err) {
            console.error('배송지 조회 실패:', err);
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const openForm = (addr = null) => {
        if (addr) {
            setEditingId(addr.id);
            setForm({
                addressName: addr.addressName || '',
                receiverName: addr.receiverName || '',
                receiverPhone: addr.receiverPhone || '',
                zipcode: addr.zipcode || '',
                address: addr.address || '',
                addressDetail: addr.addressDetail || '',
                isDefault: addr.isDefault || false,
            });
        } else {
            if (addresses.length >= MAX_ADDRESSES) {
                alert(`배송지는 최대 ${MAX_ADDRESSES}개까지 등록할 수 있습니다.`);
                return;
            }
            setEditingId(null);
            setForm(EMPTY_FORM);
        }
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSearchAddress = () => {
        openPostcode(({ zonecode, address }) => {
            setForm((prev) => ({ ...prev, zipcode: zonecode, address }));
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.receiverName.trim()) {
            alert('수령인을 입력해주세요.');
            return;
        }
        if (!form.receiverPhone.trim()) {
            alert('연락처를 입력해주세요.');
            return;
        }
        if (!form.zipcode || !form.address) {
            alert('주소를 검색해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                addressName: form.addressName.trim() || null,
                receiverName: form.receiverName.trim(),
                receiverPhone: form.receiverPhone.trim(),
                zipcode: form.zipcode,
                address: form.address,
                addressDetail: form.addressDetail.trim(),
                isDefault: form.isDefault,
            };

            if (editingId) {
                await addressService.updateAddress(editingId, payload);
            } else {
                await addressService.createAddress(payload);
            }

            closeForm();
            await fetchAddresses();
        } catch (err) {
            const msg = err.response?.data?.message || '배송지 저장에 실패했습니다.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('이 배송지를 삭제하시겠습니까?')) {
            try {
                await addressService.deleteAddress(id);
                await fetchAddresses();
            } catch (err) {
                const msg = err.response?.data?.message || '배송지 삭제에 실패했습니다.';
                alert(msg);
            }
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await addressService.setDefault(id);
            await fetchAddresses();
        } catch (err) {
            const msg = err.response?.data?.message || '기본 배송지 설정에 실패했습니다.';
            alert(msg);
        }
    };

    if (loading) {
        return (
            <MyPageLayout>
                    <header className="mb-8 md:mb-10">
                        <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">Address Book</h2>
                        <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">자주 쓰는 배송지를 관리하세요.</p>
                    </header>
                    <div className="py-32 text-center text-gray-400">불러오는 중...</div>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout>
                <header className="mb-8 md:mb-10">
                    <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">Address Book</h2>
                    <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">자주 쓰는 배송지를 관리하세요.</p>
                </header>

                {/* 상단 버튼 */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[13px] text-gray-400">
                        {addresses.length} / {MAX_ADDRESSES}
                    </span>
                    <button
                        onClick={() => openForm()}
                        className="px-6 py-3 bg-[#333] text-white text-[12px] font-bold hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
                    >
                        + 새 배송지 추가
                    </button>
                </div>

                {/* 배송지 목록 */}
                {addresses.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className="bg-white border border-gray-100 shadow-sm p-5 md:p-6 rounded-sm"
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {addr.isDefault && (
                                                <span className="inline-block bg-[#968064] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                                    기본
                                                </span>
                                            )}
                                            <span className="text-[15px] font-bold text-[#343434]">
                                                {addr.addressName || '배송지'}
                                            </span>
                                        </div>
                                        <div className="text-[13px] text-gray-600 mb-1">
                                            {addr.receiverName} | {addr.receiverPhone}
                                        </div>
                                        <div className="text-[13px] text-gray-500">
                                            ({addr.zipcode}) {addr.address} {addr.addressDetail}
                                        </div>
                                        {addr.createdAt && (
                                            <div className="text-[11px] text-gray-300 mt-2">
                                                등록일 {formatDate(addr.createdAt)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => openForm(addr)}
                                            className="px-4 py-2 border border-gray-200 text-[12px] font-bold text-[#333] hover:bg-gray-50 transition-all"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="px-4 py-2 border border-gray-200 text-[12px] font-bold text-gray-400 hover:text-red-400 hover:border-red-200 transition-all"
                                        >
                                            삭제
                                        </button>
                                        {!addr.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(addr.id)}
                                                className="px-4 py-2 border border-[#968064] text-[12px] font-bold text-[#968064] hover:bg-[#968064] hover:text-white transition-all"
                                            >
                                                기본배송지 설정
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center border-t border-b border-dashed border-gray-200">
                        <p className="text-gray-300 font-light mb-8">등록된 배송지가 없습니다.</p>
                        <button
                            onClick={() => openForm()}
                            className="px-10 py-4 border border-[#333] text-[13px] font-bold hover:bg-[#333] hover:text-white transition-all"
                        >
                            배송지 추가하기
                        </button>
                    </div>
                )}

                {/* 하단 네비게이션 */}
                <div className="mt-10">
                    <button
                        onClick={() => navigate('/shop/mypage/edit')}
                        className="text-[13px] text-gray-400 hover:text-black transition-colors"
                    >
                        ← 마이페이지
                    </button>
                </div>

                {/* 모달 폼 */}
                {showForm && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        {/* 백드롭 */}
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={closeForm}
                        />

                        {/* 모달 본체 */}
                        <div className="relative bg-white w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-xl rounded-sm">
                            <div className="p-6 md:p-8">
                                <h3 className="text-[18px] md:text-[20px] font-bold text-[#343434] mb-6">
                                    {editingId ? '배송지 수정' : '새 배송지 추가'}
                                </h3>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    {/* 배송지명 */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            배송지명 <span className="text-gray-300 normal-case">(선택)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.addressName}
                                            onChange={(e) => handleChange('addressName', e.target.value)}
                                            placeholder="예: 집, 회사"
                                            maxLength={20}
                                            className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f9f9f9] focus:bg-white focus:border-[#333] transition-colors"
                                        />
                                    </div>

                                    {/* 수령인 */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            수령인 <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.receiverName}
                                            onChange={(e) => handleChange('receiverName', e.target.value)}
                                            placeholder="수령인 이름"
                                            maxLength={20}
                                            className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f9f9f9] focus:bg-white focus:border-[#333] transition-colors"
                                        />
                                    </div>

                                    {/* 연락처 */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            연락처 <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.receiverPhone}
                                            onChange={(e) => handleChange('receiverPhone', e.target.value)}
                                            placeholder="010-0000-0000"
                                            maxLength={20}
                                            className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f9f9f9] focus:bg-white focus:border-[#333] transition-colors"
                                        />
                                    </div>

                                    {/* 주소 */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            주소 <span className="text-red-400">*</span>
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={form.zipcode}
                                                readOnly
                                                placeholder="우편번호"
                                                className="flex-1 border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f0f0f0] text-gray-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSearchAddress}
                                                className="px-5 py-3 bg-[#333] text-white text-[12px] font-bold hover:bg-black transition-all shrink-0"
                                            >
                                                주소 검색
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={form.address}
                                            readOnly
                                            placeholder="기본 주소"
                                            className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f0f0f0] text-gray-500 mb-2"
                                        />
                                        <input
                                            type="text"
                                            value={form.addressDetail}
                                            onChange={(e) => handleChange('addressDetail', e.target.value)}
                                            placeholder="상세 주소를 입력해주세요"
                                            maxLength={100}
                                            className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f9f9f9] focus:bg-white focus:border-[#333] transition-colors"
                                        />
                                    </div>

                                    {/* 기본배송지 체크 */}
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={form.isDefault}
                                            onChange={(e) => handleChange('isDefault', e.target.checked)}
                                            className="w-4 h-4 accent-[#968064]"
                                        />
                                        <span className="text-[13px] text-gray-600">기본 배송지로 설정</span>
                                    </label>

                                    {/* 버튼 */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeForm}
                                            className="flex-1 py-4 border border-gray-200 text-[#333] text-[12px] font-bold hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest"
                                        >
                                            취소
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`flex-1 py-4 text-white text-[12px] font-bold transition-all active:scale-95 uppercase tracking-widest ${
                                                submitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#333] hover:bg-black'
                                            }`}
                                        >
                                            {submitting ? '저장 중...' : '저장'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
        </MyPageLayout>
    );
};

export default AddressBook;
