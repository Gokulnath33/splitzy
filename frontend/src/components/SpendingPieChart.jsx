import { useState } from "react";
import { motion } from "framer-motion";

const defaultData = [
  { label: "Food", value: 35, color: "#10b981", icon: "🍔" },
  { label: "Transport", value: 20, color: "#8b5cf6", icon: "🚗" },
  { label: "Housing", value: 25, color: "#f59e0b", icon: "🏠" },
  { label: "Entertainment", value: 12, color: "#f43f5e", icon: "🎬" },
  { label: "Shopping", value: 8, color: "#0ea5e9", icon: "🛍️" },
];

export default function SpendingPieChart({ data = defaultData, size = 200, animated = true }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const center = size / 2;
  const radius = size / 2 - 10;

  // Build pie segments
  let cumulative = 0;
  const segments = data.map((d, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArc = d.value / total > 0.5 ? 1 : 0;
    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Label position
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius * 0.65;
    const lx = center + labelRadius * Math.cos(midAngle);
    const ly = center + labelRadius * Math.sin(midAngle);

    return { ...d, pathData, lx, ly, percentage: ((d.value / total) * 100).toFixed(0), index: i };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
        style={{ filter: "drop-shadow(0 4px 20px rgba(16, 185, 129, 0.15))" }}
      >
        {/* Outer glow ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 5}
          fill="none"
          stroke="rgba(16, 185, 129, 0.1)"
          strokeWidth="1"
        />

        {segments.map((seg, i) => (
          <g key={i}>
            <motion.path
              d={seg.pathData}
              fill={seg.color}
              stroke="rgba(15, 23, 42, 0.6)"
              strokeWidth="1.5"
              className="pie-segment"
              initial={animated ? { opacity: 0, scale: 0.8 } : {}}
              animate={animated ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transform: hoveredIndex === i ? "scale(1.06)" : "scale(1)",
                transformOrigin: `${center}px ${center}px`,
                filter: hoveredIndex === i ? `drop-shadow(0 0 12px ${seg.color}80)` : "none",
                transition: "transform 0.3s ease, filter 0.3s ease",
              }}
            />
            {/* Percentage label inside segment */}
            {seg.percentage > 8 && (
              <motion.text
                x={seg.lx}
                y={seg.ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="10"
                fontWeight="700"
                pointerEvents="none"
                initial={animated ? { opacity: 0 } : {}}
                animate={animated ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {seg.percentage}%
              </motion.text>
            )}
          </g>
        ))}

        {/* Center circle (donut hole) */}
        <circle cx={center} cy={center} r={radius * 0.35} fill="rgba(15, 23, 42, 0.85)" />
        <circle cx={center} cy={center} r={radius * 0.35} fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />

        {/* Center text */}
        <text x={center} y={center - 6} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
          {hoveredIndex !== null ? `${segments[hoveredIndex].percentage}%` : "Total"}
        </text>
        <text x={center} y={center + 10} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8">
          {hoveredIndex !== null ? segments[hoveredIndex].label : "Spending"}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-1.5 cursor-pointer rounded-md px-2 py-0.5 transition-all duration-200"
            style={{
              background: hoveredIndex === i ? `${seg.color}20` : "transparent",
              transform: hoveredIndex === i ? "scale(1.05)" : "scale(1)",
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            initial={animated ? { opacity: 0, y: 8 } : {}}
            animate={animated ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 + i * 0.08 }}
          >
            <span className="text-xs">{seg.icon}</span>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: seg.color, boxShadow: hoveredIndex === i ? `0 0 8px ${seg.color}80` : "none" }}
            />
            <span className="text-xs text-ink-secondary" style={{ color: hoveredIndex === i ? seg.color : undefined }}>
              {seg.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
