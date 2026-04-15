import { useEffect, useState } from "react";
import "./Dashboard.css";
import {
  communityFetchProfile,
  communitySubscribe,
  communityUnsubscribe,
  communityUnfriend,
} from "../api";

export default function UserProfile({ userId, onBack, onChanged }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await communityFetchProfile(userId);
      setProfile(data);
    } catch (e) {
      setError(e.message || "Failed to load");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when userId changes
  }, [userId]);

  const refresh = async () => {
    await load();
    onChanged?.();
  };

  const handleSubscribe = async () => {
    setBusy(true);
    try {
      const data = await communitySubscribe(userId);
      setProfile(data);
      onChanged?.();
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setBusy(false);
    }
  };

  const handleUnsubscribe = async () => {
    setBusy(true);
    try {
      const data = await communityUnsubscribe(userId);
      setProfile(data);
      onChanged?.();
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setBusy(false);
    }
  };

  const handleUnfriend = async () => {
    if (!window.confirm("Remove from friends? Both subscriptions will be removed.")) return;
    setBusy(true);
    try {
      await communityUnfriend(userId);
      await refresh();
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="community-page">
        <div className="publication-header">
          <button type="button" className="community-link-btn" onClick={onBack}>
            ← Back
          </button>
          <h2>Profile</h2>
        </div>
        <p>Loading…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="community-page">
        <div className="publication-header">
          <button type="button" className="community-link-btn" onClick={onBack}>
            ← Back
          </button>
          <h2>Profile</h2>
        </div>
        <p className="community-error-text">{error || "Not found"}</p>
      </div>
    );
  }

  const self =
    String(profile.id) === String(localStorage.getItem("userId") || "");

  return (
    <div className="community-page">
      <div className="publication-header">
        <button type="button" className="community-link-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Account</h2>
      </div>

      <div className="community-profile-card">
        <div className="community-post-user">
          <div className="community-avatar-circle">
            {(profile.nickname || profile.username || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{profile.nickname || profile.username}</strong>
            {profile.email ? <p className="profile-email">{profile.email}</p> : null}
            <p>
              Level {profile.level} · XP {profile.xp}
            </p>
            {profile.is_friend ? (
              <span className="community-badge friend">Friends</span>
            ) : profile.i_follow ? (
              <span className="community-badge pending">You follow</span>
            ) : profile.follows_me ? (
              <span className="community-badge pending">Follows you</span>
            ) : null}
          </div>
        </div>

        {!self && (
          <div className="community-profile-actions">
            {profile.is_friend ? (
              <>
                <p className="community-hint">
                  You are friends — each of you follows the other. You see each other&apos;s
                  posts in Community.
                </p>
                <button
                  type="button"
                  className="community-danger-btn"
                  disabled={busy}
                  onClick={handleUnfriend}
                >
                  Remove from friends
                </button>
              </>
            ) : (
              <>
                {profile.follows_me && !profile.i_follow ? (
                  <p className="community-hint">
                    This user already follows you. Subscribe back to become friends.
                  </p>
                ) : profile.i_follow ? (
                  <p className="community-hint">
                    Waiting for them to follow you back to become friends.
                  </p>
                ) : null}

                {profile.i_follow ? (
                  <button
                    type="button"
                    className="community-secondary-btn"
                    disabled={busy}
                    onClick={handleUnsubscribe}
                  >
                    Unsubscribe
                  </button>
                ) : (
                  <button
                    type="button"
                    className="community-primary-btn"
                    disabled={busy}
                    onClick={handleSubscribe}
                  >
                    Subscribe
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
