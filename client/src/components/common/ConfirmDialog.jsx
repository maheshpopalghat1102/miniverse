
import React from "react";
import Modal from "./Modal";
import Button from "./Button";

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Do you want to continue with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      closeOnBackdrop={!loading}
      showCloseButton={!loading}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-300">
        {message}
      </p>
    </Modal>
  );
}

export default ConfirmDialog;
