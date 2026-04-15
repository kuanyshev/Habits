import { useCallback, useEffect, useState } from "react";
import "./Dashboard.css";
import Friends from "./Friends";
import UserProfile from "./UserProfile";
import {
  communitySearchByNickname,
  communitySubscribe,
  communityUnsubscribe,
  communityFetchPosts,
  communityCreatePost,
  fetchMe,
} from "../api";

export default function Community() {
  const [subView, setSubView] = useState("feed");
  const [profileUserId, setProfileUserId] = useState(null);

  const [searchNickname, setSearchNickname] = useState("");
  const [searchUser, setSearchUser] = useState(null);
  const [searchFound, setSearchFound] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  /** global | subscriptions | friends | mine */
  const [tab, setTab] = useState("global");
  const [myUserId, setMyUserId] = useState(
    () => localStorage.getItem("userId") || ""
  );

  const loadPosts = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) {
      setPosts([]);
      return;
    }
    setPostsLoading(true);
    try {
      const scope =
        tab === "mine"
          ? "mine"
          : tab === "global"
            ? "global"
            : tab === "subscriptions"
              ? "subscriptions"
              : "friends";
      const data = await communityFetchPosts(scope);
      setPosts(data.posts || []);
    } catch (e) {
      console.warn(e);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (!localStorage.getItem("accessToken") || myUserId) return;
    fetchMe()
      .then((d) => {
        if (d?.id != null) {
          const id = String(d.id);
          localStorage.setItem("userId", id);
          setMyUserId(id);
        }
      })
      .catch(() => {});
  }, [myUserId]);

  const runSearch = async () => {
    const q = searchNickname.trim();
    if (!q) {
      setSearchError("Enter a nickname");
      return;
    }
    if (!localStorage.getItem("accessToken")) {
      setSearchError("Log in to search");
      return;
    }
    setSearchError("");
    setSearchLoading(true);
    setSearchUser(null);
    setSearchFound(null);
    try {
      const data = await communitySearchByNickname(q);
      if (!data.found) {
        setSearchFound(false);
      } else {
        setSearchFound(true);
        setSearchUser(data.user);
      }
    } catch (e) {
      setSearchError(e.message || "Search failed");
      setSearchFound(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubscribe = async (userId) => {
    try {
      const data = await communitySubscribe(userId);
      setSearchUser(data);
      await loadPosts();
    } catch (e) {
      alert(e.message || "Error");
    }
  };

  const handleUnsubscribe = async (userId) => {
    try {
      const data = await communityUnsubscribe(userId);
      setSearchUser(data);
      await loadPosts();
    } catch (e) {
      alert(e.message || "Error");
    }
  };

  const createPost = async () => {
    const text = window.prompt("Write your post");
    if (!text || !text.trim()) return;
    if (!localStorage.getItem("accessToken")) {
      alert("Log in to post");
      return;
    }
    try {
      await communityCreatePost(text.trim());
      await loadPosts();
    } catch (e) {
      alert(e.message || "Error");
    }
  };

  const openProfile = (userId) => {
    setProfileUserId(userId);
    setSubView("profile");
  };

  if (subView === "friends") {
    return (
      <Friends
        onBack={() => setSubView("feed")}
        onOpenProfile={openProfile}
      />
    );
  }

  if (subView === "profile" && profileUserId != null) {
    return (
      <UserProfile
        userId={profileUserId}
        onBack={() => {
          setSubView("feed");
          setProfileUserId(null);
        }}
        onChanged={() => {
          loadPosts();
          if (searchUser && String(searchUser.id) === String(profileUserId)) {
            communitySearchByNickname(searchNickname.trim())
              .then((d) => {
                if (d.found) setSearchUser(d.user);
              })
              .catch(() => {});
          }
        }}
      />
    );
  }

  return (
    <div className="community-page">
      <div className="community-header">
        <div className="community-search-block">
          <input
            type="text"
            placeholder="Find user by nickname"
            className="community-search"
            value={searchNickname}
            onChange={(e) => setSearchNickname(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
          />
          <button
            type="button"
            className="community-primary-btn community-search-btn"
            onClick={runSearch}
            disabled={searchLoading}
          >
            {searchLoading ? "…" : "Search"}
          </button>
        </div>

        <div className="community-actions">
          <button type="button" className="community-secondary-btn" onClick={() => setSubView("friends")}>
            Friends
          </button>
          <button type="button" onClick={createPost}>
            +
          </button>
        </div>
      </div>

      {searchError ? <p className="community-error-text">{searchError}</p> : null}
      {searchFound === false ? (
        <p className="community-hint">No user with this nickname.</p>
      ) : null}

      {searchUser ? (
        <div className="community-user-search-card">
          <div className="community-post-user">
            <div className="community-avatar-circle">
              {(searchUser.nickname || searchUser.username || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{searchUser.nickname || searchUser.username}</strong>
              <p>
                Level {searchUser.level} · XP {searchUser.xp}
              </p>
              {searchUser.is_friend ? (
                <span className="community-badge friend">Friends</span>
              ) : searchUser.i_follow ? (
                <span className="community-badge pending">You subscribed — waiting for them</span>
              ) : searchUser.follows_me ? (
                <span className="community-badge pending">They follow you — subscribe back</span>
              ) : (
                <span className="community-badge">Not connected</span>
              )}
            </div>
          </div>
          <div className="community-user-search-actions">
            <button
              type="button"
              className="community-secondary-btn"
              onClick={() => openProfile(searchUser.id)}
            >
              View account
            </button>
            {searchUser.is_friend ? null : searchUser.i_follow ? (
              <button
                type="button"
                className="community-secondary-btn"
                onClick={() => handleUnsubscribe(searchUser.id)}
              >
                Unsubscribe
              </button>
            ) : (
              <button
                type="button"
                className="community-primary-btn"
                onClick={() => handleSubscribe(searchUser.id)}
              >
                Subscribe
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div className="community-tabs">
        <button
          type="button"
          className={tab === "global" ? "active-tab" : ""}
          onClick={() => setTab("global")}
        >
          Global post
        </button>
        <button
          type="button"
          className={tab === "subscriptions" ? "active-tab" : ""}
          onClick={() => setTab("subscriptions")}
        >
          Subscriptions post
        </button>
        <button
          type="button"
          className={tab === "friends" ? "active-tab" : ""}
          onClick={() => setTab("friends")}
        >
          friends
        </button>
        <button
          type="button"
          className={tab === "mine" ? "active-tab" : ""}
          onClick={() => setTab("mine")}
        >
          My posts
        </button>
      </div>

      <p className="community-feed-hint">
        {tab === "global"
          ? "All users’ posts in one feed."
          : tab === "subscriptions"
            ? "Posts from people you follow and from mutual friends."
            : tab === "friends"
              ? "Posts from mutual friends and you (both follow each other)."
              : "Only your posts."}
      </p>

      {postsLoading ? (
        <p>Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="community-empty-feed">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-card">
            <button
              type="button"
              className="post-author-link"
              onClick={() => openProfile(post.author_id)}
            >
              <strong>{post.author_nickname || post.author_username}</strong>
            </button>
            <p>{post.text}</p>
            <small className="post-meta">
              {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
            </small>
          </div>
        ))
      )}
    </div>
  );
}
