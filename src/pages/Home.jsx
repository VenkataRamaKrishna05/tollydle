import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white px-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900/85 ring-1 ring-slate-700/60 p-8 text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100">Tollydle</h1>

        <button
          onClick={() => navigate("/play")}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-lg font-semibold transition"
        >
          Play Daily Movie
        </button>

        <p className="text-sm text-slate-400">More game modes coming soon...</p>
      </div>
    </div>
  );
}
