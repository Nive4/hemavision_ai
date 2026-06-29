export default function Footer() {
  return (
    <footer className="w-full py-6 px-6 mt-auto border-t border-white/5 bg-bg-primary text-center">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        <p className="text-xs text-text-secondary">
          © {new Date().getFullYear()} HemaVision AI. All rights reserved.
        </p>
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-[11px] text-accent-secondary max-w-2xl mx-auto leading-relaxed">
          <strong className="text-accent-primary">⚠️ Medical Disclaimer:</strong> HemaVision AI is designed for early-stage screening and educational purposes. It does not replace clinical diagnosis, blood testing, or professional advice. Always consult with a qualified medical professional for health concerns.
        </div>
      </div>
    </footer>
  );
}
