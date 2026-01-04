import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
    title?: string;
    message?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    resetError,
    title = 'Something went wrong',
    message = 'We encountered an unexpected error. Please try again.',
}) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (resetError) resetError();
        navigate('/');
    };

    const handleRefresh = () => {
        if (resetError) {
            resetError();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-600 mb-6">{message}</p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <Home className="h-4 w-4" />
                            Go Home
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && error && (
                        <details className="mt-6 text-left">
                            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
                                Error Details (Development Only)
                            </summary>
                            <div className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-48">
                                <div className="font-semibold text-red-600 mb-2">{error.name}: {error.message}</div>
                                <pre className="text-gray-700 whitespace-pre-wrap">
                                    {error.stack}
                                </pre>
                            </div>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
};
