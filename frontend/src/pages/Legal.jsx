import { useParams, Navigate } from "react-router-dom";
import { PageHero } from "@/components/Sections";
import { LEGAL } from "@/data/site";

export default function Legal() {
  const { doc } = useParams();
  const page = LEGAL[doc];
  if (!page) return <Navigate to="/" replace />;
  return (
    <>
      <PageHero eyebrow="Legal" title={page.title} />
      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 120 }}>
        <div className="pb-container" style={{ maxWidth: 760 }}>
          <p className="pb-body" style={{ fontSize: 18 }}>{page.body}</p>
          <p className="pb-mono mt-10" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--pb-gray)" }}>
            Last updated: June 2026 · hello@theparabellumco.com
          </p>
        </div>
      </section>
    </>
  );
}
