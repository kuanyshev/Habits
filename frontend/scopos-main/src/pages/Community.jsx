import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import { toast } from "react-toastify";
import { getLocale, t } from "../utils/appSettings";

export default function Community() {
  const userName = localStorage.getItem("userName") || "Togzhan";
  const userAvatar = localStorage.getItem("userAvatar") || "";

  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFriend, setNewFriend] = useState("");
  const [newPostText, setNewPostText] = useState("");

  const text = t();
  const locale = getLocale();

  useEffect(() => {
    const loadData = () => {
      setPosts(JSON.parse(localStorage.getItem("communityPosts")) || []);
      setFriends(JSON.parse(localStorage.getItem("communityFriends")) || []);
    };

    loadData();

    window.addEventListener("postsUpdated", loadData);
    window.addEventListener("friendsUpdated", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("postsUpdated", loadData);
      window.removeEventListener("friendsUpdated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const saveFriends = (updatedFriends) => {
    setFriends(updatedFriends);
    localStorage.setItem("communityFriends", JSON.stringify(updatedFriends));
    window.dispatchEvent(new Event("friendsUpdated"));
  };

  const activeFriends = useMemo(
    () => friends.filter((friend) => !friend.blocked),
    [friends]
  );

  const friendNames = useMemo(
    () => activeFriends.map((friend) => friend.name.toLowerCase()),
    [activeFriends]
  );

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (tab === "mine") {
      result = result.filter((post) => post.user === userName);
    }

    if (tab === "friends") {
      result = result.filter((post) =>
        friendNames.includes((post.user || "").toLowerCase())
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (post) =>
          (post.user || "").toLowerCase().includes(q) ||
          (post.text || "").toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [posts, tab, userName, friendNames, search]);

  const handleAddFriend = () => {
    const name = newFriend.trim();
    if (!name) return;

    const exists = friends.some(
      (friend) => friend.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      toast.error(text.friendExists);
      return;
    }

    const updated = [
      ...friends,
      {
        id: Date.now(),
        name,
        blocked: false,
      },
    ];

    saveFriends(updated);
    setNewFriend("");
    toast.success(text.addFriend);
  };

  const handleUnfriend = (id) => {
    const updated = friends.filter((friend) => friend.id !== id);
    saveFriends(updated);
  };

  const handleBlockFriend = (id) => {
    const updated = friends.map((friend) =>
      friend.id === id ? { ...friend, blocked: true } : friend
    );
    saveFriends(updated);
  };

  const handleCreatePost = () => {
    const textValue = newPostText.trim();

    if (!textValue) {
      toast.error(text.writeSomethingFirst);
      return;
    }

    const savedPosts = JSON.parse(localStorage.getItem("communityPosts")) || [];

    const newPost = {
      id: Date.now(),
      user: userName,
      avatar: userAvatar,
      text: textValue,
      date: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    localStorage.setItem(
      "communityPosts",
      JSON.stringify([newPost, ...savedPosts])
    );

    window.dispatchEvent(new Event("postsUpdated"));
    setNewPostText("");
    setIsCreateOpen(false);
    toast.success(text.share);
  };

  const formatDate = (dateValue) => {
    try {
      return new Date(dateValue).toLocaleString(locale);
    } catch {
      return "";
    }
  };

  const renderAvatar = (avatar, name) => {
    if (avatar) {
      return <img src={avatar} alt={name} className="community-avatar-img" />;
    }

    return <div className="community-avatar">{(name || "U").charAt(0).toUpperCase()}</div>;
  };

  return (
    <div className="community-page">
      <div className="community-hero-card">
        <div className="community-hero-left">
          <h2>{text.communityTitle}</h2>
          <p>{text.communityText}</p>
        </div>

        <div className="community-hero-actions">
          <button
            type="button"
            className="community-main-btn"
            onClick={() => setIsCreateOpen(true)}
          >
            + {text.publication}
          </button>
        </div>
      </div>

      <div className="community-toolbar">
        <div className="community-search-wrap">
          <input
            type="text"
            className="community-search-input"
            placeholder={text.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div
          className="community-friends-summary-card"
          onClick={() => setIsFriendsOpen(true)}
        >
          <div className="community-friends-summary-top">
            <span>{text.friends}</span>
            <strong>{activeFriends.length}</strong>
          </div>

          <p>{text.openFriendsList}</p>
        </div>
      </div>

      <div className="community-tabs-bar">
        <button
          type="button"
          className={tab === "all" ? "community-tab active" : "community-tab"}
          onClick={() => setTab("all")}
        >
          {text.allPosts}
        </button>

        <button
          type="button"
          className={tab === "friends" ? "community-tab active" : "community-tab"}
          onClick={() => setTab("friends")}
        >
          {text.onlyFriends}
        </button>

        <button
          type="button"
          className={tab === "mine" ? "community-tab active" : "community-tab"}
          onClick={() => setTab("mine")}
        >
          {text.myPosts}
        </button>
      </div>

      <div className="community-feed">
        {filteredPosts.length === 0 ? (
          <div className="community-empty-state">
            <h3>{text.noPostsYet}</h3>
            <p>{text.createFirstPost}</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="community-post-card">
              <div className="community-post-header">
                <div className="community-user-block">
                  {renderAvatar(post.avatar, post.user)}

                  <div className="community-user-meta">
                    <strong>{post.user}</strong>
                    <span>{formatDate(post.date)}</span>
                  </div>
                </div>

                <button type="button" className="community-dots-btn">
                  ...
                </button>
              </div>

              <div className="community-post-body">
                <p>{post.text}</p>
              </div>

              <div className="community-post-footer">
                <div className="community-post-pill">Likes {post.likes || 0}</div>
                <div className="community-post-pill">Comments {post.comments || 0}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {isFriendsOpen && (
        <div
          className="community-modal-overlay"
          onClick={() => setIsFriendsOpen(false)}
        >
          <div
            className="community-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="community-modal-header">
              <div>
                <h3>{text.friendsList}</h3>
                <p>{text.manageFriends}</p>
              </div>

              <button
                type="button"
                className="community-close-btn"
                onClick={() => setIsFriendsOpen(false)}
              >
                x
              </button>
            </div>

            <div className="community-add-friend-row">
              <input
                type="text"
                placeholder={text.writeUsername}
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
                className="community-modal-input"
              />

              <button
                type="button"
                className="community-main-btn"
                onClick={handleAddFriend}
              >
                {text.addFriend}
              </button>
            </div>

            <div className="community-friends-list">
              {friends.length === 0 ? (
                <div className="community-empty-mini">{text.noFriendsYet}</div>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="community-friend-row">
                    <div className="community-user-block">
                      <div className="community-avatar">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="community-user-meta">
                        <strong>{friend.name}</strong>
                        <span>{friend.blocked ? text.blocked : text.friend}</span>
                      </div>
                    </div>

                    <div className="community-friend-actions">
                      {!friend.blocked && (
                        <button
                          type="button"
                          className="community-soft-btn"
                          onClick={() => handleUnfriend(friend.id)}
                        >
                          {text.unfriend}
                        </button>
                      )}

                      <button
                        type="button"
                        className="community-danger-btn"
                        onClick={() => handleBlockFriend(friend.id)}
                      >
                        {text.block}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div
          className="community-modal-overlay"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="community-modal-card publication-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="community-modal-header">
              <div>
                <h3>{text.createPublication}</h3>
                <p>{text.shareProgress}</p>
              </div>

              <button
                type="button"
                className="community-close-btn"
                onClick={() => setIsCreateOpen(false)}
              >
                x
              </button>
            </div>

            <div className="community-publication-top">
              {renderAvatar(userAvatar, userName)}

              <div className="community-user-meta">
                <strong>{userName}</strong>
                <span>{text.publicPost}</span>
              </div>
            </div>

            <textarea
              className="community-textarea"
              placeholder={text.writeSomething}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
            />

            <div className="community-publication-actions">
              <button
                type="button"
                className="community-soft-btn"
                onClick={() => setIsCreateOpen(false)}
              >
                {text.cancel}
              </button>

              <button
                type="button"
                className="community-main-btn"
                onClick={handleCreatePost}
              >
                {text.share}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
