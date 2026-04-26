import { useState, useCallback, useRef } from 'react';

const useModalFeedback = () => {
    const [feedback, setFeedback] = useState({ type: null, message: null });
    const counterRef = useRef(0);

    const showSuccess = useCallback((message) => {
        counterRef.current += 1;
        setFeedback({ type: 'success', message, _key: counterRef.current });
    }, []);

    const showError = useCallback((message) => {
        counterRef.current += 1;
        setFeedback({ type: 'error', message, _key: counterRef.current });
    }, []);

    const clearFeedback = useCallback(() => {
        setFeedback({ type: null, message: null });
    }, []);

    return {
        feedbackType: feedback.type,
        feedbackMessage: feedback.message,
        feedbackKey: feedback._key,
        showSuccess,
        showError,
        clearFeedback,
    };
};

export default useModalFeedback;
