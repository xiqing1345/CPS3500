// libraries are at the repo root, so this path also needs three levels up
import { projects } from "../../../lib/projects";
// components folder is at the workspace root, so we need to go up three levels from
// src/app/projects to reach it.
import ProjectCard from "../../../components/ProjectCard";

export default function Projects() {
  return (
    <div className="container">
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
