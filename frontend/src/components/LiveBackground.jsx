import { useMemo } from "react";

const PARTICLE_COLORS = [
  "rgba(16, 185, 129, 0.5)",
  "rgba(139, 92, 246, 0.4)",
  "rgba(245, 158, 11, 0.4)",
  "rgba(14, 165, 233, 0.4)",
  "rgba(244, 63, 94, 0.35)",
  "rgba(236, 72, 153, 0.35)",
  "rgba(20, 184, 166, 0.4)",
];

export default function LiveBackground({ variant = "full" }) {
  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 3 + Math.random() * 6,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      duration: 8 + Math.random() * 15,
      delay: Math.random() * 10,
      bottom: -(Math.random() * 20),
    }));
  }, []);

  const geoShapes = useMemo(() => {
    const types = ["circle", "square", "circle", "square", "circle", "square", "circle", "square"];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: types[i],
      top: `${10 + Math.random() * 75}%`,
      left: `${5 + Math.random() * 85}%`,
      size: 20 + Math.random() * 40,
      delay: i * 2.5,
      duration: 18 + Math.random() * 12,
    }));
  }, []);

  return (
    <>
      {/* Aurora beams */}
      <div className="aurora-bg">
        <div className="aurora-beam"></div>
        <div className="aurora-beam"></div>
        <div className="aurora-beam"></div>
      </div>

      {/* Floating particles */}
      <div className="particles-container">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              bottom: `${p.bottom}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* Geometric shapes */}
      {variant === "full" && (
        <div className="geo-shapes">
          {geoShapes.map((s) => (
            <div
              key={s.id}
              className={`geo-shape ${s.type}`}
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Wave at bottom */}
      {variant === "full" && (
        <div className="wave-bg">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none">
            <path
              d="M0,100 C320,180 440,20 720,100 C1000,180 1120,20 1440,100 C1760,180 1880,20 2160,100 C2440,180 2560,20 2880,100 L2880,200 L0,200 Z"
              fill="rgba(16, 185, 129, 0.04)"
            />
            <path
              d="M0,120 C280,60 520,180 720,120 C920,60 1160,180 1440,120 C1720,60 1960,180 2160,120 C2360,60 2600,180 2880,120 L2880,200 L0,200 Z"
              fill="rgba(139, 92, 246, 0.03)"
            />
          </svg>
        </div>
      )}
    </>
  );
}
