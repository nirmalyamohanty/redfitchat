export default function TranslationToggle({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <span className="text-sm text-gray-400">Translate to English</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-dark-600'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </label>
  );
}
