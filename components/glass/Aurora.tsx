export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* deep blue blob */}
      <div
        className="absolute -top-40 -left-40 h-[60vmax] w-[60vmax] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.55), rgba(29,78,216,0.18) 50%, transparent 70%)',
          animation: 'aurora 24s ease-in-out infinite',
        }}
      />
      {/* warm orange blob */}
      <div
        className="absolute -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 70% 70%, rgba(255,122,26,0.5), rgba(234,88,12,0.18) 50%, transparent 70%)',
          animation: 'aurora-rev 32s ease-in-out infinite',
        }}
      />
      {/* faint mid violet to bridge them */}
      <div
        className="absolute top-1/3 left-1/2 h-[45vmax] w-[45vmax] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.32), transparent 70%)',
          animation: 'aurora 38s ease-in-out infinite',
        }}
      />
      {/* subtle grain to kill banding */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.035]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>")',
        }}
      />
    </div>
  );
}
