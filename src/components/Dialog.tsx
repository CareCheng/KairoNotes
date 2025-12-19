// 内置对话框组件 - 统一的 UI 风格
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/Dialog.css';

export type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface DialogButton {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
}

export interface DialogProps {
  isOpen: boolean;
  type?: DialogType;
  title: string;
  message: string;
  buttons?: DialogButton[];
  onClose: () => void;
  showCloseButton?: boolean;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  confirm: Info,
};

const colorMap = {
  info: 'var(--accent-color)',
  success: 'var(--success-color)',
  warning: 'var(--warning-color)',
  error: 'var(--error-color)',
  confirm: 'var(--accent-color)',
};

export function Dialog({
  isOpen,
  type = 'info',
  title,
  message,
  buttons,
  onClose,
  showCloseButton = true,
}: DialogProps) {
  const { t } = useTranslation();
  const Icon = iconMap[type];

  const defaultButtons: DialogButton[] = buttons || [
    { label: t('dialog.ok'), variant: 'primary', onClick: onClose },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="dialog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="dialog-container"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <button className="dialog-close" onClick={onClose}>
                <X size={18} />
              </button>
            )}
            
            <div className="dialog-header">
              <div className="dialog-icon" style={{ color: colorMap[type] }}>
                <Icon size={32} />
              </div>
              <h3 className="dialog-title">{title}</h3>
            </div>
            
            <div className="dialog-content">
              <p className="dialog-message">{message}</p>
            </div>
            
            <div className="dialog-actions">
              {defaultButtons.map((button, index) => (
                <button
                  key={index}
                  className={`dialog-btn dialog-btn-${button.variant || 'secondary'}`}
                  onClick={button.onClick}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 输入对话框
export interface InputDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function InputDialog({
  isOpen,
  title,
  message,
  placeholder,
  defaultValue = '',
  onConfirm,
  onCancel,
}: InputDialogProps) {
  const { t } = useTranslation();
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    onConfirm(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="dialog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="dialog-container"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="dialog-close" onClick={onCancel}>
              <X size={18} />
            </button>
            
            <div className="dialog-header">
              <h3 className="dialog-title">{title}</h3>
            </div>
            
            <div className="dialog-content">
              <p className="dialog-message">{message}</p>
              <input
                type="text"
                className="dialog-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            
            <div className="dialog-actions">
              <button className="dialog-btn dialog-btn-secondary" onClick={onCancel}>
                {t('dialog.cancel')}
              </button>
              <button className="dialog-btn dialog-btn-primary" onClick={handleConfirm}>
                {t('dialog.confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 需要导入 React
import React from 'react';

// 对话框 Hook
interface DialogState {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  buttons?: DialogButton[];
  resolve?: (value: boolean) => void;
}

const initialState: DialogState = {
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
};

export function useDialog() {
  const [state, setState] = React.useState<DialogState>(initialState);

  const showDialog = React.useCallback((
    type: DialogType,
    title: string,
    message: string,
    buttons?: DialogButton[]
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        type,
        title,
        message,
        buttons,
        resolve,
      });
    });
  }, []);

  const closeDialog = React.useCallback((result: boolean = false) => {
    if (state.resolve) {
      state.resolve(result);
    }
    setState(initialState);
  }, [state.resolve]);

  const alert = React.useCallback((title: string, message: string) => {
    return showDialog('info', title, message);
  }, [showDialog]);

  const confirm = React.useCallback((title: string, message: string) => {
    return showDialog('confirm', title, message, [
      { label: '取消', variant: 'secondary', onClick: () => closeDialog(false) },
      { label: '确定', variant: 'primary', onClick: () => closeDialog(true) },
    ]);
  }, [showDialog, closeDialog]);

  const error = React.useCallback((title: string, message: string) => {
    return showDialog('error', title, message);
  }, [showDialog]);

  const success = React.useCallback((title: string, message: string) => {
    return showDialog('success', title, message);
  }, [showDialog]);

  const warning = React.useCallback((title: string, message: string) => {
    return showDialog('warning', title, message);
  }, [showDialog]);

  return {
    state,
    showDialog,
    closeDialog,
    alert,
    confirm,
    error,
    success,
    warning,
    DialogComponent: () => (
      <Dialog
        isOpen={state.isOpen}
        type={state.type}
        title={state.title}
        message={state.message}
        buttons={state.buttons}
        onClose={() => closeDialog(false)}
      />
    ),
  };
}
