import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { Crest } from "@/components/Crest";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user && user !== null && user !== false) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      nav("/admin");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pb-sec-black" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 120, paddingBottom: 80 }}>
      <div className="pb-container" style={{ maxWidth: 460 }}>
        <Reveal>
          <div className="flex items-center gap-3 mb-8">
            <Crest size={40} />
            <span className="pb-mono" style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase" }}>Parabellum</span>
          </div>
          <Eyebrow>Admin Access</Eyebrow>
          <h1 className="pb-h2 mt-5" style={{ fontSize: 44 }}>Command post.</h1>
          <form onSubmit={submit} className="flex flex-col gap-5 mt-10" data-testid="admin-login-form">
            <div>
              <label className="pb-label">Email</label>
              <input className="pb-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@theparabellumco.com" data-testid="login-email" />
            </div>
            <div>
              <label className="pb-label">Password</label>
              <input className="pb-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" data-testid="login-password" />
            </div>
            {error && <div className="pb-mono" style={{ fontSize: 11, letterSpacing: "0.08em", color: "#C56A5C" }} data-testid="login-error">{error}</div>}
            <button type="submit" className="pb-btn pb-btn-gold justify-center" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }} data-testid="login-submit">
              {loading ? <><Loader2 size={13} className="animate-spin" /> Signing in…</> : <>Sign In <LogIn size={13} /></>}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
