import React, { useState, useEffect, useCallback } from 'react';
import taxBillService from '../api/taxBillService';
import { formatDate } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';

const MAX_INFO = 5;

const EMPTY_FORM = {
    bizRegNum: '', bizName: '', bizRepName: '',
    bizCategory: '', bizDetailCategory: '',
    bizAddress: '', bizEmail: '', bizMobile: '', damName: '',
};

const TaxBillManage = () => {
    const [infoList, setInfoList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const fetchInfoList = useCallback(async () => {
        try {
            const res = await taxBillService.getInfoList();
            setInfoList(res.data || []);
        } catch (e) {
            console.error('세금계산서 정보 조회 실패:', e);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchInfoList();
            setLoading(false);
        };
        load();
    }, [fetchInfoList]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const openCreateModal = () => {
        if (infoList.length >= MAX_INFO) {
            alert(`세금계산서 정보는 최대 ${MAX_INFO}개까지 등록할 수 있습니다.`);
            return;
        }
        setEditId(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEditModal = (info) => {
        setEditId(info.id);
        setForm({
            bizRegNum: info.bizRegNum || '',
            bizName: info.bizName || '',
            bizRepName: info.bizRepName || '',
            bizCategory: info.bizCategory || '',
            bizDetailCategory: info.bizDetailCategory || '',
            bizAddress: info.bizAddress || '',
            bizEmail: info.bizEmail || '',
            bizMobile: info.bizMobile || '',
            damName: info.damName || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.bizRegNum.trim()) { alert('사업자등록번호를 입력해주세요.'); return; }
        if (!form.bizName.trim()) { alert('상호명을 입력해주세요.'); return; }
        if (!form.bizRepName.trim()) { alert('대표자명을 입력해주세요.'); return; }
        try {
            if (editId) {
                await taxBillService.updateInfo(editId, form);
            } else {
                await taxBillService.createInfo(form);
            }
            setShowModal(false);
            await fetchInfoList();
        } catch (e) {
            alert(e.response?.data?.message || '저장에 실패했습니다.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('삭제하시겠습니까?')) return;
        try {
            await taxBillService.deleteInfo(id);
            await fetchInfoList();
        } catch (e) {
            alert(e.response?.data?.message || '삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return <MyPageLayout><div className="py-20 text-center text-gray-400 text-sm">로딩 중...</div></MyPageLayout>;
    }

    return (
        <MyPageLayout>
            <header className="mb-8">
                <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight uppercase text-[#343434]">세금계산서 정보</h2>
            </header>

            {true && (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[13px] text-gray-500">{infoList.length} / {MAX_INFO}</p>
                        <button onClick={openCreateModal}
                                className="px-6 py-3 bg-[#333] text-white text-[12px] font-bold hover:bg-black transition-all active:scale-95 uppercase tracking-widest">
                            새 정보 등록
                        </button>
                    </div>

                    {infoList.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {infoList.map(info => (
                                <div key={info.id} className="bg-white border border-gray-100 p-5 md:p-6 shadow-sm rounded-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="text-[15px] font-bold text-[#333]">{info.bizName}</h4>
                                            <p className="text-[13px] text-gray-500 mt-1">{info.bizRegNum}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(info)} className="text-[12px] text-[#968064] font-bold underline underline-offset-2">수정</button>
                                            <button onClick={() => handleDelete(info.id)} className="text-[12px] text-red-400 font-bold underline underline-offset-2">삭제</button>
                                        </div>
                                    </div>
                                    <div className="text-[12px] text-gray-400 space-y-0.5">
                                        <p>대표: {info.bizRepName} {info.damName ? `/ 담당: ${info.damName}` : ''}</p>
                                        {info.bizCategory && <p>업태: {info.bizCategory} / 종목: {info.bizDetailCategory}</p>}
                                        {info.bizAddress && <p>주소: {info.bizAddress}</p>}
                                        {info.bizEmail && <p>이메일: {info.bizEmail}</p>}
                                        {info.bizMobile && <p>연락처: {info.bizMobile}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-400 text-[13px] border border-dashed border-gray-200 rounded-sm">
                            등록된 세금계산서 정보가 없습니다.
                        </div>
                    )}
                </>
            )}


            {/* 등록/수정 모달 */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
                    <div className="bg-white w-full max-w-[500px] mx-4 max-h-[85vh] rounded-sm shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-[16px] font-bold text-[#333]">{editId ? '정보 수정' : '새 정보 등록'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black text-xl">&times;</button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input value={form.bizRegNum} onChange={e => handleChange('bizRegNum', e.target.value)} placeholder="사업자등록번호 *" maxLength={20}
                                       className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                <input value={form.bizName} onChange={e => handleChange('bizName', e.target.value)} placeholder="상호명 *" maxLength={100}
                                       className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input value={form.bizRepName} onChange={e => handleChange('bizRepName', e.target.value)} placeholder="대표자명 *" maxLength={30}
                                       className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                <input value={form.damName} onChange={e => handleChange('damName', e.target.value)} placeholder="담당자명" maxLength={30}
                                       className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input value={form.bizCategory} onChange={e => handleChange('bizCategory', e.target.value)} placeholder="업태" maxLength={50}
                                       className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                <input value={form.bizDetailCategory} onChange={e => handleChange('bizDetailCategory', e.target.value)} placeholder="종목" maxLength={100}
                                       className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                            </div>
                            <input value={form.bizAddress} onChange={e => handleChange('bizAddress', e.target.value)} placeholder="사업장 주소" maxLength={200}
                                   className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input value={form.bizEmail} onChange={e => handleChange('bizEmail', e.target.value)} placeholder="이메일" type="email" maxLength={100}
                                       className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                                <input value={form.bizMobile} onChange={e => handleChange('bizMobile', e.target.value)} placeholder="연락처" maxLength={20}
                                       className="border border-gray-200 px-4 py-3 text-[13px] outline-none focus:border-[#333]" />
                            </div>
                        </div>
                        <div className="flex gap-2 p-6 border-t">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 border border-gray-200 text-gray-500 text-[13px] font-medium rounded-sm hover:bg-gray-50">취소</button>
                            <button onClick={handleSave} className="flex-[2] py-3.5 bg-[#343434] text-white text-[13px] font-medium rounded-sm hover:bg-black">저장</button>
                        </div>
                    </div>
                </div>
            )}
        </MyPageLayout>
    );
};

export default TaxBillManage;
