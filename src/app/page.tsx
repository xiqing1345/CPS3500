export default function Home() {
  return (
    <div className="home-hero">
      <div className="hero-text">
        <h1>Welcome to My Portfolio</h1>
        <p>
          Hi! My name is Leon, and I’m a student at Kean University. I’m currently pursuing my studies in my undergraduate program, where I’m developing both my academic knowledge and practical skills. I’m passionate about learning new technologies, improving my problem-solving abilities, and collaborating with others on meaningful projects. I’m always eager to explore new ideas, gain hands-on experience, and continue growing both personally and professionally.
        </p>
        <p>
          Check out my <a href="/projects" style={{ color: "var(--accent)" }}>projects</a>.
        </p>
        <p>This site features an <a href="/ai-resume" style={{ color: "var(--accent)" }}>AI Resume Helper</a> you can try out.</p>
        <a href="/cv.pdf" download className="cv-download-btn">
          Download CV
        </a>
      </div>
      <div className="hero-image">
        <img src="/profile.jpg" alt="My Photo" />
      </div>
    </div>
  );
}
