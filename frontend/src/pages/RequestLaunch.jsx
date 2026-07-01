import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Rocket } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero } from "@/components/Sections";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ORG_TYPES = ["School / K-12", "Sports / Booster Club", "Creator", "Business", "Agency"];
const GOALS = ["Fundraising", "Spirit Wear", "Uniforms", "Event Merch", "Corporate Swag", "Fan Monetization"];
const TIMELINES = ["ASAP (< 2 weeks)", "This month", "This quarter", "Just exploring"];

export default function RequestLaunch() {
  const [form, setForm] = useState({ name: "", email: "", org: "", orgType: "", timeline: "", notes: "" });
  const [goals, setGoals] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleGoal = (g) => setGoals((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/launch`, { ...form, goals });
      toast.success("Launch request received. An operator will reach out to architect your drop.");
      setForm({ name: "", email: "", org: "", orgType: "", timeline: "", notes: "" });
      setGoals([]);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero eyebrow="Request a Launch" title="Bring the audience. We'll bring the engine." sub="Tell us the essentials and we'll come back with a launch plan — store architecture, drop mechanics, and the automations to run it." />
      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <div className="pb-container" style={{ maxWidth: 820 }}>
          <Reveal>
            <form onSubmit={submit} className="flex flex-col gap-8" data-testid="launch-form">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="pb-label">Name</label>
                  <input className="pb-input" required value={form.name} onChange={set("name")} placeholder="Your name" data-testid="launch-name" />
                </div>
                <div>
                  <label className="pb-label">Email</label>
                  <input className="pb-input" type="email" required value={form.email} onChange={set("email")} placeholder="you@email.com" data-testid="launch-email" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="pb-label">Organization</label>
                  <input className="pb-input" value={form.org} onChange={set("org")} placeholder="Program / brand name" data-testid="launch-org" />
                </div>
                <div>
                  <label className="pb-label">Organization Type</label>
                  <select className="pb-input" required value={form.orgType} onChange={set("orgType")} data-testid="launch-orgtype">
                    <option value="">Select…</option>
                    {ORG_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="pb-label">Primary Goals</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {GOALS.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => toggleGoal(g)}
                      data-testid={`launch-goal-${g.replace(/\s/g, "-").toLowerCase()}`}
                      className="pb-mono transition-colors duration-300"
                      style={{
                        fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                        padding: "10px 16px",
                        border: `1px solid ${goals.includes(g) ? "var(--pb-gold)" : "var(--pb-border)"}`,
                        background: goals.includes(g) ? "var(--pb-gold-muted)" : "transparent",
                        color: goals.includes(g) ? "var(--pb-gold)" : "var(--pb-gray-soft)",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="pb-label">Timeline</label>
                <select className="pb-input" required value={form.timeline} onChange={set("timeline")} data-testid="launch-timeline">
                  <option value="">Select…</option>
                  {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="pb-label">Anything else?</label>
                <textarea className="pb-input" rows={5} value={form.notes} onChange={set("notes")} placeholder="Audience size, existing store, deadlines, ideas…" data-testid="launch-notes" />
              </div>

              <button type="submit" className="pb-btn pb-btn-gold self-start" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }} data-testid="launch-submit">Request a Launch <Rocket size={13} /></button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
