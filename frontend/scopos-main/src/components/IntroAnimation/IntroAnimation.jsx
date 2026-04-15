import { useEffect } from "react";
import "./IntroAnimation.css";

export default function IntroAnimation({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3600);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="intro">
      <div className="portal"></div>
      <div className="mascot">✦</div>
      <div className="intro-logo-text">SCOPOS</div>
      <p className="intro-subtitle">Focus. Discipline. Growth.</p>
    </div>
  );
}