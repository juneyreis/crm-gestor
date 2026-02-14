import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import Button from '../Button';

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "warning",
    showCancel = true
}) {
    if (!isOpen) return null;

    const variantStyles = {
        warning: {
            icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
            bg: "bg-amber-50 dark:bg-amber-900/10",
            button: "primary" // Usando primary para destaque, Button.jsx já tem estilo azul
        },
        danger: {
            icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
            bg: "bg-red-50 dark:bg-red-900/10",
            button: "danger"
        },
        success: {
            icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
            bg: "bg-green-50 dark:bg-green-900/10",
            button: "success"
        }
    };

    const currentVariant = variantStyles[variant] || variantStyles.warning;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-gray-100 dark:border-slate-700">
                {/* Header decorativo */}
                <div className={`${currentVariant.bg} p-4 flex flex-col items-center justify-center text-center`}>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg mb-2">
                        {currentVariant.icon}
                    </div>
                </div>

                <div className="px-6 pb-2 pt-2 text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 flex flex-col-reverse sm:flex-row gap-3">
                    {showCancel && (
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            className="flex-1 w-full sm:w-auto justify-center"
                        >
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        variant={currentVariant.button}
                        onClick={onConfirm}
                        className="flex-1 w-full sm:w-auto justify-center"
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
