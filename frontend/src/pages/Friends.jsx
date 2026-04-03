import { useEffect, useState } from "react";
import "./Dashboard.css";
import { communityFetchFriends, communityUnfriend } from "../api";

export default function Friends({ onBack, onOpenProfile }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await communityFetchFriends();
      setFriends(data.friends || []);
    } catch (e) {
      console.warn(e);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unfriend = async (id, name) => {
    if (!window.confirm(`Remove ${name} from friends?`)) return;
    try {
      await communityUnfriend(id);
      await load();
    } catch (e) {
      alert(e.message || "Error");
    }
  };

  return (
    <div className="friends-page">
      <div className="publication-header">
        <button type="button" className="community-link-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Friends</h2>
      </div>

      <p className="community-hint friends-intro">
        Friends are users where <strong>both of you follow each other</strong>. Until then you
        only have a one-way subscription.
      </p>

      <div className="friends-list-wrap">
        {loading ? (
          <p>Loading…</p>
        ) : friends.length === 0 ? (
          <div className="community-empty-card">
            <h3>No friends yet</h3>
            <p>Search by email in Community and subscribe; ask them to subscribe back.</p>
          </div>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="friend-row-card">
              <button
                type="button"
                className="friend-row-main"
                onClick={() => onOpenProfile(friend.id)}
              >
                <div className="community-post-user">
                  <div className="community-avatar-circle">
                    {(friend.username || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{friend.username}</strong>
                    <p>
                      Level {friend.level} · XP {friend.xp}
                    </p>
                  </div>
                </div>
              </button>

              <div className="friend-actions">
                <button
                  type="button"
                  className="community-secondary-btn"
                  onClick={() => onOpenProfile(friend.id)}
                >
                  View profile
                </button>
                <button
                  type="button"
                  className="community-danger-btn"
                  onClick={() => unfriend(friend.id, friend.username)}
                >
                  Unfriend
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
