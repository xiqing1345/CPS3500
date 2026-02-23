import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <Link href="/" style={{ marginRight: "1rem" }}>
        Home
      </Link>
      <Link href="/about" style={{ marginRight: "1rem" }}>
        About
      </Link>
      <Link href="/projects" style={{ marginRight: "1rem" }}>
        Projects
      </Link>
      <Link href="/contact" style={{ marginRight: "1rem" }}>
        Contact
      </Link>
      <Link href="/ai-resume" style={{ marginRight: "1rem" }}>
        AI Resume Helper
      </Link>
    </nav>
  );
}
