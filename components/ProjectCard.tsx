import Link from "next/link";

interface Props {
  title: string;
  description: string;
  demoPath: string;
}

export default function ProjectCard({ title, description, demoPath }: Props) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0" }}>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link href={demoPath} style={{ color: "blue" }}>
        Open Demo
      </Link>
    </div>
  );
}
