"use client";

type DeleteFlavorButtonProps = {
  confirmMessage?: string;
};

export function DeleteFlavorButton({
  confirmMessage = "Delete this humor flavor and its steps?",
}: DeleteFlavorButtonProps) {
  return (
    <button
      type="submit"
      className="btn-danger"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
