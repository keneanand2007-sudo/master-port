export interface SkillGroup {
  id: string
  title: string
  items: readonly string[]
}

export const skillGroups: readonly SkillGroup[] = [
  {
    id: '01',
    title: 'FRONTEND',
    items: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Vite', 'Zustand', 'HTML', 'CSS'],
  },
  {
    id: '02',
    title: 'BACKEND / DATA',
    items: ['Python', 'FastAPI', 'SQL / DBMS', 'SQLite'],
  },
  {
    id: '03',
    title: 'AI / LLMs',
    items: ['Ollama / Local LLMs', 'AI Agents', 'Prompt Engineering', 'AI-assisted Development'],
  },
  {
    id: '04',
    title: 'CORE CS',
    items: ['C', 'C++', 'Java', 'Data Structures & Algorithms', 'OOP', 'Software Engineering', 'Git / GitHub'],
  },
]
