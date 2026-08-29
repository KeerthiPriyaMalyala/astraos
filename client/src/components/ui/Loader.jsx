export default function Loader({ text = "Loading AstraOS..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-5">
        
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-400" />
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            AstraOS
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {text}
          </p>
        </div>

      </div>
    </div>
  );
}