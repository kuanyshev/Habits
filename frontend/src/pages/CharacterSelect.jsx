import "./CharacterSelect.css";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { patchMe } from "../api";

import classic from "../assets/classic.png";
import knight from "../assets/knight.png";
import forest from "../assets/forest.png";
import fire from "../assets/fire.png";
import shadow from "../assets/shadow.png";
import celestial from "../assets/celestial.png";

export default function CharacterSelect() {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  const skins = [
    { name: "Classic", image: classic, locked: false },
    { name: "Knight", image: knight, locked: true },
    { name: "Forest", image: forest, locked: true },
    { name: "Fire", image: fire, locked: true },
    { name: "Shadow", image: shadow, locked: true },
    { name: "Celestial", image: celestial, locked: true },
  ];

  return (
    <div className="character-page">
      <div className="character-wrapper">
        <div className="character-info">
          <div className="info-box">
            <p>You’re currently at level 1.</p>
            <p>Your current skin is the classic Spark.</p>

            <p className="mt">
              The remaining skins are locked. Unlock them by earning XP,
              completing habits, and leveling up.
            </p>

            <p className="mt">
              The higher your level, the more new energy forms you'll unlock.
            </p>
          </div>

          <img src={classic} alt="spirit" className="info-mascot" />
        </div>

        <div className="skins-section">
          <button className="arrow-btn left" onClick={scrollLeft}>
            ‹
          </button>

          <div className="skins-slider" ref={sliderRef}>
            {skins.map((skin) => (
              <div
                key={skin.name}
                className={`skin ${skin.locked ? "locked" : "active"}`}
              >
                <img src={skin.image} alt={skin.name} />
                <p>{skin.name}</p>
                <button disabled={skin.locked}>SELECT</button>
              </div>
            ))}
          </div>

          <button className="arrow-btn right" onClick={scrollRight}>
            ›
          </button>
        </div>

        <div className="bottom">
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              if (!localStorage.getItem("accessToken")) {
                navigate("/dashboard");
                return;
              }
              setSaving(true);
              try {
                await patchMe({ onboarding_completed: true });
              } catch (e) {
                console.warn(e);
              } finally {
                setSaving(false);
              }
              navigate("/dashboard");
            }}
          >
            {saving ? "…" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}