import { Activity } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: branding splash */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-violet-600 to-purple-700">
        {/* Animated blobs */}
        <div className="absolute inset-0">
          <div className="blob absolute top-[15%] left-[10%] w-64 h-64 bg-white/10 animate-float" />
          <div className="blob-2 absolute bottom-[20%] right-[15%] w-48 h-48 bg-white/10 animate-float-delayed" />
          <div className="blob absolute top-[60%] left-[50%] w-32 h-32 bg-violet-400/20 animate-pulse-soft" />
          <div className="blob-2 absolute top-[10%] right-[30%] w-20 h-20 bg-purple-300/20 animate-float" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Activity className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold">Tackling Weight</span>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Your wellness journey<br />
            starts here.
          </h2>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            Track your progress, get personalised guidance, and join challenges — all in one beautiful dashboard.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['BMI Tracking', 'Smart Advice', 'Challenges', 'Leaderboard'].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 border border-white/20 backdrop-blur-sm"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50 relative">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 gradient-brand-light opacity-50" />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
