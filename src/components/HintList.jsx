export default function HintList({ hints }) {
  if (hints.length === 0) return null;

  return (
    <ul className="space-y-2">
      {hints.map((hint, index) => (
        <li
          key={index}
          className="px-4 py-2 rounded bg-slate-800 border border-slate-600 text-slate-100"
        >
          {hint}
        </li>
      ))}
    </ul>
  );
}
