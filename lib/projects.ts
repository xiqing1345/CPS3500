export interface Project {
  title: string;
  description: string;
  demoPath: string;
}

export const projects: Project[] = [
  {
    title: "AI Chat Demo",
    description: "A simple interactive AI chat interface demonstrating conversation with an AI model.",
    demoPath: "/ai-chat",
  },
  {
    title: "AI Resume / LinkedIn Helper",
    description: "A Next.js-based AI writing tool that allows users to paste draft experience content and generate refined resume bullets, LinkedIn “About” summaries, or customized cover letter paragraphs. The tool dynamically adjusts tone and structure based on selected output type and target job role using a server-side LLM API.",
    demoPath: "/ai-resume",
  },
  // other projects can be added here
];
