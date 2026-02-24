export default function Home() {
  return (
    <div className="home-hero">
      <div className="hero-text">
        <h1>Welcome to My Portfolio</h1>
        <p>
          Hi! I'm a software developer who builds web applications and AI tools.
        </p>
        <p>
          Check out my <a href="/projects" style={{ color: "var(--accent)" }}>projects</a>.
        </p>
        <p>This site features an <a href="/ai-resume" style={{ color: "var(--accent)" }}>AI Resume Helper</a> you can try out.</p>
      </div>
      <div className="hero-image">
        <img src="/profile.jpg" alt="My Photo" />
      </div>
    </div>
  );
}
