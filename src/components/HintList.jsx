import { motion, AnimatePresence } from "framer-motion";

export default function HintList({ hints, animated = false }) {
  if (hints.length === 0) return null;

  return (
    <ul className="space-y-4">
      <AnimatePresence mode="popLayout">
        {hints.map((hint, index) => (
          <motion.li
            key={index}
            initial={animated ? { opacity: 0, x: -20, filter: "blur(10px)" } : {}}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="relative bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 px-6 py-4 rounded-2xl text-slate-200 text-sm leading-relaxed shadow-sm">
              <span className="text-[10px] font-black text-sky-500/50 uppercase tracking-widest mr-3">Hint {index + 1}</span>
              {hint}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
