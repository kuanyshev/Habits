import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Friends({ onBack }) {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState("");

  useEffect(() => {
    const savedFriends = JSON.parse(localStorage.getItem("communityFriends")) || [];
    setFriends(savedFriends);
  }, []);

  const saveFriends = (updated) => {
    setFriends(updated);
    localStorage.setItem("communityFriends", JSON.stringify(updated));
    window.dispatchEvent(new Event("friendsUpdated"));
  };

  const addFriend = () => {
    if (!newFriend.trim()) return;

    const exists = friends.some(
      (friend) => friend.name.toLowerCase() === newFriend.trim().toLowerCase()
    );
    if (exists) {
      alert("This friend already exists");
      return;
    }

    const updated = [
      ...friends,
      {
        id: Date.now(),
        name: newFriend.trim(),
        blocked: false,
      },
    ];

    saveFriends(updated);

    const notifications = JSON.parse(localStorage.getItem("communityNotifications")) || [];
    notifications.unshift({
      id: Date.now() + 1,
      text: `${newFriend.trim()} was added to your friends list.`,
      date: new Date().toISOString(),
    });
    localStorage.setItem("communityNotifications", JSON.stringify(notifications));

    setNewFriend("");
  };

  const unfriend = (id, name) => {
    const updated = friends.filter((friend) => friend.id !== id);
    saveFriends(updated);

    const notifications = JSON.parse(localStorage.getItem("communityNotifications")) || [];
    notifications.unshift({
      id: Date.now() + 2,
      text: `You removed ${name} from friends.`,
      date: new Date().toISOString(),
    });
    localStorage.setItem("communityNotifications", JSON.stringify(notifications));
  };

  const blockFriend = (id, name) => {
    const updated = friends.map((friend) =>
      friend.id === id ? { ...friend, blocked: true } : friend
    );
    saveFriends(updated);

    const notifications = JSON.parse(localStorage.getItem("communityNotifications")) || [];
    notifications.unshift({
      id: Date.now() + 3,
      text: `You blocked ${name}.`,
      date: new Date().toISOString(),
    });
    localStorage.setItem("communityNotifications", JSON.stringify(notifications));
  };

  return (
    <div className="friends-page">
      <div className="publication-header">
        <button type="button" className="community-link-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Friends list</h2>
      </div>

      <div className="friends-add-card">
        <input
          type="text"
          placeholder="Write username"
          value={newFriend}
          onChange={(e) => setNewFriend(e.target.value)}
          className="community-search"
        />
        <button type="button" className="community-primary-btn" onClick={addFriend}>
          Add friend
        </button>
      </div>

      <div className="friends-list-wrap">
        {friends.length === 0 ? (
          <div className="community-empty-card">
            <h3>No friends yet</h3>
            <p>Add your first friend.</p>
          </div>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="friend-row-card">
              <div className="community-post-user">
                <div className="community-avatar-circle">
                  {friend.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{friend.name}</strong>
                  <p>{friend.blocked ? "Blocked" : "Friend"}</p>
                </div>
              </div>

              <div className="friend-actions">
                {!friend.blocked && (
                  <button
                    type="button"
                    className="community-secondary-btn"
                    onClick={() => unfriend(friend.id, friend.name)}
                  >
                    Unfriend
                  </button>
                )}

                <button
                  type="button"
                  className="community-danger-btn"
                  onClick={() => blockFriend(friend.id, friend.name)}
                >
                  Block
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}