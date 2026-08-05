import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <p>© {new Date().getFullYear()} iamedx</p>
        <a href="mailto:hello@iamedx.com">hello@iamedx.com</a>
        <nav aria-label="Footer">
          <Link href="/projects">Projects</Link>
          <Link href="/services">Services</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
