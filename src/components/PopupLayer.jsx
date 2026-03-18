import React, { useState, useEffect } from 'react';
import displayService from '../api/displayService';

const PopupLayer = () => {
    const [popups, setPopups] = useState([]);

    useEffect(() => {
        const fetchPopups = async () => {
            try {
                const res = await displayService.getPopups();
                const data = res.data?.data || [];
                // Filter out popups that should not be shown based on localStorage
                const visible = data.filter((popup) => {
                    const { id, closeType } = popup;
                    if (closeType === 'DAY') {
                        const closedDate = localStorage.getItem(`popup_${id}_closed_date`);
                        if (closedDate) {
                            const today = new Date().toISOString().slice(0, 10);
                            if (closedDate === today) return false;
                        }
                    } else if (closeType === 'ONCE') {
                        if (localStorage.getItem(`popup_${id}_closed_once`)) return false;
                    }
                    // closeType === 'NEVER' -> always show
                    return true;
                });
                setPopups(visible);
            } catch (error) {
                console.error('팝업 로드 실패', error);
            }
        };
        fetchPopups();
    }, []);

    const handleClose = (popup) => {
        setPopups((prev) => prev.filter((p) => p.id !== popup.id));
    };

    const handleCloseToday = (popup) => {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`popup_${popup.id}_closed_date`, today);
        handleClose(popup);
    };

    const handleCloseOnce = (popup) => {
        localStorage.setItem(`popup_${popup.id}_closed_once`, 'true');
        handleClose(popup);
    };

    if (popups.length === 0) return null;

    return (
        <>
            {popups.map((popup) => {
                const imageUrl = popup.files?.[0]?.imageUrl;
                const isCenter = (!popup.posX || popup.posX === 0) && (!popup.posY || popup.posY === 0);

                const positionStyle = isCenter
                    ? {
                          position: 'fixed',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                      }
                    : {
                          position: 'fixed',
                          top: `${popup.posY}px`,
                          left: `${popup.posX}px`,
                      };

                return (
                    <div
                        key={popup.id}
                        style={{
                            ...positionStyle,
                            width: popup.width ? `${popup.width}px` : '400px',
                            zIndex: 9998,
                        }}
                        className="bg-white shadow-2xl rounded-lg overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => handleClose(popup)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors text-lg leading-none"
                        >
                            &times;
                        </button>

                        {/* Content area */}
                        <div
                            style={{
                                height: popup.height ? `${popup.height}px` : 'auto',
                                cursor: popup.linkUrl ? 'pointer' : 'default',
                            }}
                            onClick={() => {
                                if (popup.linkUrl) {
                                    window.open(popup.linkUrl, '_blank', 'noopener,noreferrer');
                                }
                            }}
                            className="overflow-hidden"
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={popup.title || '팝업'}
                                    className="w-full h-full object-cover"
                                />
                            ) : popup.contentHtml ? (
                                <div
                                    className="p-4"
                                    dangerouslySetInnerHTML={{ __html: popup.contentHtml }}
                                />
                            ) : null}
                        </div>

                        {/* Footer buttons */}
                        <div className="flex border-t border-gray-200 text-[13px]">
                            {popup.closeType === 'DAY' && (
                                <button
                                    onClick={() => handleCloseToday(popup)}
                                    className="flex-1 py-3 text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200"
                                >
                                    오늘 하루 열지 않음
                                </button>
                            )}
                            {popup.closeType === 'ONCE' && (
                                <button
                                    onClick={() => handleCloseOnce(popup)}
                                    className="flex-1 py-3 text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200"
                                >
                                    다시 보지 않음
                                </button>
                            )}
                            <button
                                onClick={() => handleClose(popup)}
                                className="flex-1 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default PopupLayer;
