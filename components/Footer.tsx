export default function Footer() {
  return (
    <footer style={{ padding: "1rem", borderTop: "1px solid #ccc", marginTop: "2rem" }}>
      <p style={{ textAlign: "center" }}>© {new Date().getFullYear()} My Portfolio</p>
    </footer>
  );
}
