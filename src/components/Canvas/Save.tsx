type SaveButtonProps = {
  onSave: () => void;
};

export default function SaveButton({ onSave }: SaveButtonProps) {
  return (
    <button
      onClick={onSave}
      className="
        px-3 py-2
        bg-gray-200
        rounded
        border border-gray-500
        shadow
        hover:bg-gray-300
        active:shadow-inner
        text-sm
      "
    >
      Сохранить
    </button>
  );
}
