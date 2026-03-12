import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";


const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffMs = now.getTime() - postTime.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return postTime.toLocaleDateString();
};

const Avatar = ({ initials, color, size = 40 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `${color}22`, border: `2px solid ${color}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.32, fontWeight: 700, color, flexShrink: 0,
    fontFamily: "'DM Mono', monospace", letterSpacing: "-0.5px"
  }}>{initials}</div>
);

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const CommentIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const PostCard = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const handleLike = () => {
    setIsLikeAnimating(true);
    onLike(post.id);
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const handleSubmit = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText.trim());
      setCommentText("");
    }
  };

  return (
    <div style={{
      background: "#16161e",
      border: "1px solid #2a2a38",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "16px",
      transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#3a3a52'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a38'}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <Avatar initials={post.user.avatar} color={post.user.color} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#f0f0f8", fontSize: "15px", fontFamily: "'DM Sans', sans-serif" }}>{post.user.name}</div>
          <div style={{ color: "#555568", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>{post.user.handle} · {post.time}</div>
        </div>
      </div>

      <p style={{
        color: "#c8c8d8", lineHeight: 1.7, fontSize: "15px",
        fontFamily: "'DM Sans', sans-serif", marginBottom: "20px", margin: "0 0 20px 0"
      }}>{post.content}</p>

      <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #1e1e2c", paddingTop: "16px" }}>
        <button onClick={handleLike} style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: post.liked ? "#e8a83815" : "transparent",
          border: `1px solid ${post.liked ? "#e8a83860" : "#2a2a38"}`,
          borderRadius: "10px", padding: "8px 14px", cursor: "pointer",
          color: post.liked ? "#e8a838" : "#666680",
          fontSize: "14px", fontFamily: "'DM Mono', monospace",
          transition: "all 0.2s", transform: isLikeAnimating ? "scale(0.92)" : "scale(1)",
        }}
        onMouseEnter={e => { if (!post.liked) { e.currentTarget.style.background = "#ffffff08"; e.currentTarget.style.color = "#e8a838"; }}}
        onMouseLeave={e => { if (!post.liked) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666680"; }}}
        >
          <HeartIcon filled={post.liked} />
          {post.likes}
        </button>

        <button onClick={() => setShowComments(!showComments)} style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: showComments ? "#5b8dee15" : "transparent",
          border: `1px solid ${showComments ? "#5b8dee60" : "#2a2a38"}`,
          borderRadius: "10px", padding: "8px 14px", cursor: "pointer",
          color: showComments ? "#5b8dee" : "#666680",
          fontSize: "14px", fontFamily: "'DM Mono', monospace",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { if (!showComments) { e.currentTarget.style.background = "#ffffff08"; e.currentTarget.style.color = "#5b8dee"; }}}
        onMouseLeave={e => { if (!showComments) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666680"; }}}
        >
          <CommentIcon />
          {post.comments.length} {post.comments.length === 1 ? "reply" : "replies"}
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: "16px" }}>
          {post.comments.map(c => (
            <div key={c.id} style={{
              display: "flex", gap: "10px", padding: "12px",
              background: "#0e0e18", borderRadius: "10px", marginBottom: "8px"
            }}>
              <Avatar initials={c.avatar} color={c.color} size={32} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, color: "#d0d0e0", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>{c.user}</span>
                  <span style={{ color: "#444458", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>{c.time}</span>
                </div>
                <p style={{ color: "#9090a8", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{c.text}</p>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Avatar initials="YO" color="#e8a838" size={32} />
            <div style={{ flex: 1, display: "flex", gap: "8px" }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="Write a reply..."
                style={{
                  flex: 1, background: "#0e0e18", border: "1px solid #2a2a38",
                  borderRadius: "10px", padding: "9px 14px", color: "#c8c8d8",
                  fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                  outline: "none", transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#e8a83880"}
                onBlur={e => e.target.style.borderColor = "#2a2a38"}
              />
              <button onClick={handleSubmit} style={{
                background: commentText.trim() ? "#e8a838" : "#2a2a38",
                border: "none", borderRadius: "10px", padding: "9px 16px",
                color: commentText.trim() ? "#0a0a12" : "#444458",
                cursor: commentText.trim() ? "pointer" : "default",
                fontSize: "13px", fontWeight: 700, fontFamily: "'DM Mono', monospace",
                transition: "all 0.2s",
              }}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NewPostBox = ({ onPost }) => {
  const [text, setText] = useState("");
  const maxLen = 280;

  const handlePost = () => {
    if (text.trim()) { onPost(text.trim()); setText(""); }
  };

  return (
    <div style={{
      background: "#16161e", border: "1px solid #2a2a38",
      borderRadius: "16px", padding: "20px", marginBottom: "20px"
    }}>
      <div style={{ display: "flex", gap: "12px" }}>
        <Avatar initials="YO" color="#e8a838" />
        <div style={{ flex: 1 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, maxLen))}
            placeholder="What's on your mind?"
            rows={3}
            style={{
              width: "100%", background: "transparent", border: "none",
              color: "#f0f0f8", fontSize: "15px", fontFamily: "'DM Sans', sans-serif",
              resize: "none", outline: "none", lineHeight: 1.6,
              placeholder: "#444458", boxSizing: "border-box"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1px solid #1e1e2c", paddingTop: "12px" }}>
            <span style={{
              fontSize: "13px", fontFamily: "'DM Mono', monospace",
              color: text.length > 240 ? (text.length >= maxLen ? "#e85b5b" : "#e8a838") : "#444458"
            }}>{maxLen - text.length}</span>
            <button onClick={handlePost} disabled={!text.trim()} style={{
              background: text.trim() ? "#e8a838" : "#2a2a38",
              border: "none", borderRadius: "10px", padding: "10px 22px",
              color: text.trim() ? "#0a0a12" : "#444458",
              cursor: text.trim() ? "pointer" : "default",
              fontSize: "14px", fontWeight: 700, fontFamily: "'DM Mono', monospace",
              transition: "all 0.2s",
            }}>Publish</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setUserProfile(profile);
        }
      }

      setAuthLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        (async () => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setUserProfile(profile);
          }
        })();
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadPosts();
      const subscription = supabase
        .channel('posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
          loadPosts();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
          loadPosts();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => {
          loadPosts();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: commentsData } = await supabase.from('comments').select('*');
      const { data: likesData } = await supabase.from('likes').select('*');

      if (postsData) {
        const postsWithDetails = postsData.map((post) => {
          const postComments = commentsData?.filter((c) => c.post_id === post.id) || [];
          const postLikes = likesData?.filter((l) => l.post_id === post.id) || [];
          const userLiked = user ? postLikes.some((l) => l.user_session_id === user.id) : false;

          return {
            id: post.id,
            user: {
              name: post.user_name,
              handle: post.user_handle,
              avatar: post.user_avatar,
              color: post.user_color,
            },
            content: post.content,
            time: formatTimeAgo(post.created_at),
            likes: postLikes.length,
            liked: userLiked,
            comments: postComments.map((c) => ({
              id: c.id,
              user: c.user_name,
              avatar: c.user_avatar,
              color: c.user_color,
              text: c.text,
              time: formatTimeAgo(c.created_at),
            })),
          };
        });

        setPosts(postsWithDetails);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_session_id', user.id)
      .maybeSingle();

    if (existingLike) {
      await supabase.from('likes').delete().eq('id', existingLike.id);
    } else {
      await supabase.from('likes').insert({
        post_id: postId,
        user_session_id: user.id,
      });
    }

    loadPosts();
  };

  const handleComment = async (postId: string, text: string) => {
    if (!user || !userProfile) return;

    await supabase.from('comments').insert({
      post_id: postId,
      user_name: userProfile.display_name,
      user_avatar: userProfile.avatar_initials,
      user_color: userProfile.avatar_color,
      text,
    });

    loadPosts();
  };

  const handleNewPost = async (text: string) => {
    if (!user || !userProfile) return;

    await supabase.from('posts').insert({
      user_name: userProfile.display_name,
      user_handle: `@${user.email?.split('@')[0]}`,
      user_avatar: userProfile.avatar_initials,
      user_color: userProfile.avatar_color,
      content: text,
    });

    loadPosts();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a12",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p style={{ color: "#c8c8d8", fontFamily: "'DM Mono', monospace" }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a12; }
        ::-webkit-scrollbar-thumb { background: #2a2a38; border-radius: 3px; }
        textarea::placeholder { color: #444458; }
        input::placeholder { color: #444458; }
      `}</style>
      <div style={{
        minHeight: "100vh", background: "#0a0a12",
        display: "flex", justifyContent: "center", padding: "32px 16px"
      }}>
        <div style={{ width: "100%", maxWidth: "580px" }}>
          <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8a838" }} />
                <h1 style={{
                  margin: 0, fontFamily: "'DM Mono', monospace", fontWeight: 700,
                  fontSize: "22px", color: "#f0f0f8", letterSpacing: "-0.5px"
                }}>feed</h1>
              </div>
              <p style={{ margin: 0, color: "#444458", fontFamily: "'DM Mono', monospace", fontSize: "12px", paddingLeft: "18px" }}>
                {posts.length} posts · {posts.reduce((a, p) => a + p.comments.length, 0)} replies
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid #2a2a38",
                borderRadius: "10px",
                padding: "8px 14px",
                color: "#666680",
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ffffff08"; e.currentTarget.style.color = "#f0f0f8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666680"; }}
            >
              Logout
            </button>
          </div>

          <NewPostBox onPost={handleNewPost} />

          {posts.map(post => (
            <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
          ))}
        </div>
      </div>
    </>
  );
}
