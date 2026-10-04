export interface Project {
  id: string
  title: string
  category: string
  status?: string
  description: string
  highlights: readonly string[]
  technologies: readonly string[]
  thumbnail: string
  video?: string
  liveUrl?: string
  githubUrl: string
}

// githubUrl points to the profile for now. Replace with exact repo URLs later.
export const projects: readonly Project[] = [
  {
    id: '01',
    title: 'AURA',
    category: 'AI Agent / Full-Stack',
    status: 'In active development',
    description: 'Personal AI life and development agent that runs on local LLMs through Ollama.',
    highlights: [
      'Streaming AI chat',
      'AI-generated chat titles',
      'Developer Agent and Research Agent in progress',
    ],
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'FastAPI', 'Python', 'SQLite / SQLModel', 'Ollama'],
    thumbnail: '/images/bg/story.webp',
    githubUrl: 'https://github.com/keneanand2007-sudo',
  },
  {
    id: '02',
    title: 'Faculty Management System',
    category: 'Web Application',
    description: 'Software project for managing faculty information.',
    highlights: [],
    technologies: ['React', 'Vite'],
    thumbnail: '/images/bg/about.webp',
    githubUrl: 'https://github.com/keneanand2007-sudo',
  },
  {
    id: '03',
    title: 'AK-BROWSER',
    category: 'Browser / Experimental',
    description: 'Personal browser project with a premium, sci-fi inspired design.',
    highlights: [],
    technologies: [],
    thumbnail: '/images/bg/skills.webp',
    githubUrl: 'https://github.com/keneanand2007-sudo',
  },
]
