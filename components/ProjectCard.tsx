import Link from "next/link";

interface Props {
  title: string;
  description: string;
  demoPath: string;
}

export default function ProjectCard({ title, description, demoPath }: Props) {
  return (
    <div className="project-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <Link href={demoPath}>Open Demo</Link>
    </div>
  );
}
