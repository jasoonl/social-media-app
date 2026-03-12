import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateAvatarColor = () => {
    const colors = ["#e8a838", "#5b8dee", "#e85b5b", "#5be8a0", "#bf5be8"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned");

      const avatarInitials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: authData.user.id,
        display_name: displayName,
        avatar_initials: avatarInitials,
        avatar_color: generateAvatarColor(),
      });

      if (profileError) throw profileError;

      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a12",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "#16161e",
        border: "1px solid #2a2a38",
        borderRadius: "16px",
        padding: "40px 32px",
      }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8a838" }} />
            <h1 style={{
              margin: 0,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              fontSize: "24px",
              color: "#f0f0f8",
              letterSpacing: "-0.5px",
            }}>feed</h1>
          </div>
          <p style={{
            margin: 0,
            color: "#c8c8d8",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
          }}>
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isSignUp && (
            <div>
              <label style={{
                display: "block",
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px",
                color: "#9090a8",
                marginBottom: "6px",
                fontWeight: 500,
              }}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
                style={{
                  width: "100%",
                  background: "#0e0e18",
                  border: "1px solid #2a2a38",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#f0f0f8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e8a83880"}
                onBlur={(e) => e.target.style.borderColor = "#2a2a38"}
              />
            </div>
          )}

          <div>
            <label style={{
              display: "block",
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              color: "#9090a8",
              marginBottom: "6px",
              fontWeight: 500,
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                background: "#0e0e18",
                border: "1px solid #2a2a38",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#f0f0f8",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#e8a83880"}
              onBlur={(e) => e.target.style.borderColor = "#2a2a38"}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              color: "#9090a8",
              marginBottom: "6px",
              fontWeight: 500,
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              style={{
                width: "100%",
                background: "#0e0e18",
                border: "1px solid #2a2a38",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#f0f0f8",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#e8a83880"}
              onBlur={(e) => e.target.style.borderColor = "#2a2a38"}
            />
          </div>

          {error && (
            <div style={{
              background: "#e85b5b15",
              border: "1px solid #e85b5b60",
              borderRadius: "10px",
              padding: "12px",
              color: "#e8a8a8",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#e8a838",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              color: "#0a0a12",
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{
            margin: 0,
            color: "#666680",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
          }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{
                background: "none",
                border: "none",
                color: "#e8a838",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
