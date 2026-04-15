import { useState } from "react";
import "./Dashboard.css";

export default function Publication({ onBack }) {
  const userName = localStorage.getItem("userName") || "Togzhan";
  const [text, setText] = useState("");

  const handleShare = () => {
    if (!text.trim()) {
      alert("Write something first");
      return;
    }

    const posts = JSON.parse(localStorage.getItem("communityPosts")) || [];

    const newPost = {
      id: Date.now(),
      user: userName,
      text: text.trim(),
      date: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    localStorage.setItem("communityPosts", JSON.stringify([newPost, ...posts]));
    localStorage.setItem(
      "communityNotifications",
      JSON.stringify([
        {
          id: Date.now() + 1,
          text: "Your publication was shared successfully.",
          date: new Date().toISOString(),
        },
        ...(JSON.parse(localStorage.getItem("communityNotifications")) || []),
      ])
    );

    window.dispatchEvent(new Event("postsUpdated"));
    onBack();
  };

  return (
    <div className="publication-page">
      <div className="publication-header">
        <button type="button" className="community-link-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Publication</h2>
      </div>

      <div className="publication-card">
        <div className="publication-user-row">
          <div className="community-avatar-circle">
            {userName.charAt(0).toUpperCase()}
          </div>
          <strong>{userName}</strong>
        </div>

        <textarea
          className="publication-textarea"
          placeholder="Share your thoughts..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="publication-actions">
          <button type="button" className="community-secondary-btn">
            Add photo
          </button>
          <button type="button" className="community-primary-btn" onClick={handleShare}>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}