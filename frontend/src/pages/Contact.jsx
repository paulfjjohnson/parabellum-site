import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Send } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero } from "@/components/Sections";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", org: "", message: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    toast.success("Message received. We'll be in touch within one business day.");
    setForm({ name: "", email: "", org: "", message: "" });
  };

  return (
    <>
      <PageHero eyebrow="Contact · Project Intake" title="Let's architect it." sub="Tell us about your program, your audience, and what you're trying to launch. We'll respond with a clear next step." />
      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <div className="pb-container grid md:grid-cols-[1.4fr_1fr] gap-16">
          <Reveal>
            <form onSubmit={submit} className="flex flex-col gap-6" data-testid="contact-form">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="pb-label">Name</label>
                  <input className="pb-input" required value={form.name} onChange={set("name")} placeholder="Your name" data-testid="contact-name" />
                </div>
                <div>
                  <label className="pb-label">Email</label>
                  <input className="pb-input" type="email" required value={form.email} onChange={set("email")} placeholder="you@email.com" data-testid="contact-email" />
                </div>
              </div>
              <div>
                <label className="pb-label">Organization</label>
                <input className="pb-input" value={form.org} onChange={set("org")} placeholder="School, team, brand, or company" data-testid="contact-org" />
              </div>
              <div>
                <label className="pb-label">What are you building?</label>
                <textarea className="pb-input" rows={6} required value={form.message} onChange={set("message")} placeholder="Tell us about the drop, program, or system you have in mind…" data-testid="contact-message" />
              </div>
              <button type="submit" className="pb-btn pb-btn-gold self-start" data-testid="contact-submit">Send Message <Send size={13} /></button>
            </form>
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ border: "1px solid var(--pb-border)", padding: 34, background: "var(--pb-onyx)" }}>
              <Eyebrow>Direct</Eyebrow>
              <div className="flex items-center gap-3 mt-8 pb-body" style={{ fontSize: 16 }}>
                <Mail size={16} color="var(--pb-gold)" /> hello@theparabellumco.com
              </div>
              <div className="flex items-center gap-3 mt-5 pb-body" style={{ fontSize: 16 }}>
                <MapPin size={16} color="var(--pb-gold)" /> Remote · Serving operators nationwide
              </div>
              <div className="pb-hairline my-8" style={{ background: "var(--pb-border-soft)" }} />
              <p className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase" }}>
                Si Vis Pacem · Para Bellum
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
