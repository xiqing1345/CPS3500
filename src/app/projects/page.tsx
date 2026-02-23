import { projects } from "../../lib/projects";
import ProjectCard from "../../components/ProjectCard";

export default function Projects() {
  return (
    <div>
      <h1>Projects</h1>
      {projects.map((p) => (
        <ProjectCard
          key={p.title}
          title={p.title}
          description={p.description}
          demoPath={p.demoPath}
        />
      ))}
    </div>
  );
}
