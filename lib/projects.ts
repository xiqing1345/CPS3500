export interface Project {
  title: string;
  description: string;
  demoPath: string;
}

export const projects: Project[] = [
  {
    title: "AI Resume / LinkedIn Helper",
    description: "An AI tool that helps you craft resume bullets, LinkedIn summaries, or cover letter paragraphs.",
    demoPath: "/ai-resume",
  },
  // other projects can be added here
];
