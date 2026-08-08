import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function AnimatedNumber({ value, prefix = "₹" }) {
  const spring = useSpring(0, { stiffness: 120, damping: 20 });
  const display = useTransform(spring, (v) => `${prefix}${Math.abs(v).toFixed(2)}`);
  const firstRun = useRef(true);

  useEffect(() => {
    spring.set(value);
    firstRun.current = false;
  }, [value]);

  return <motion.span className="font-mono">{display}</motion.span>;
}
