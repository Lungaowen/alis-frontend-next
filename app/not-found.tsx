import Link from "next/link";
import ArrowForward from "@mui/icons-material/ArrowForward";

export default function NotFound() {
  return (
    <main className="marketing-page">
      <nav className="marketing-nav">
        <Link href="/" className="marketing-brand"><span className="brand-mark">A</span><span className="brand-words"><strong>ALIS</strong><span>Legal intelligence</span></span></Link>
        <Link href="/dashboard" className="button-secondary">Open workspace <ArrowForward /></Link>
      </nav>
      <section className="marketing-section">
        <p className="section-eyebrow">404 · Page not found</p>
        <h1 className="section-title">This page is not in your workspace.</h1>
        <p className="section-description" style={{ marginTop: 14 }}>The address may have changed, or the page may no longer be available.</p>
        <Link href="/" className="button-primary" style={{ marginTop: 24 }}>Return to ALIS <ArrowForward /></Link>
      </section>
    </main>
  );
}
