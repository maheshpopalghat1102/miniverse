
import React from "react";
import Button from "../common/Button";

function RematchButton({
  onClick,
  loading = false,
  disabled = false,
  requested = false,
  label = "Play Again",
  className = "",
}) {
  return (
    <Button
      onClick={onClick}
      loading={loading}
      disabled={disabled || requested}
      variant="primary"
      className={className}
    >
      {!loading && (requested ? "✓ Request Sent" : `🔄 ${label}`)}
    </Button>
  );
}

export default RematchButton;
