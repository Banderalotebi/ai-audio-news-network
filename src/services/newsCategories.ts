export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: 'breaking',
    name: 'Breaking News',
    description: 'Latest breaking news and urgent updates',
    prompt: 'Generate breaking news about current events, major developments, or urgent situations happening today'
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Tech news, AI developments, and innovation',
    prompt: 'Generate technology news about AI, software, hardware, startups, or digital innovation'
  },
  {
    id: 'business',
    name: 'Business & Finance',
    description: 'Markets, economy, and business developments',
    prompt: 'Generate business news about markets, economy, corporate developments, or financial trends'
  },
  {
    id: 'science',
    name: 'Science & Research',
    description: 'Scientific breakthroughs and research',
    prompt: 'Generate science news about research breakthroughs, medical advances, or scientific discoveries'
  },
  {
    id: 'environment',
    name: 'Environment & Climate',
    description: 'Environmental news and climate developments',
    prompt: 'Generate environmental news about climate change, sustainability, renewable energy, or conservation'
  },
  {
    id: 'health',
    name: 'Health & Medical',
    description: 'Health news and medical developments',
    prompt: 'Generate health news about medical breakthroughs, public health, or healthcare developments'
  },
  {
    id: 'politics',
    name: 'Politics & Government',
    description: 'Political developments and policy news',
    prompt: 'Generate political news about government policies, elections, or political developments'
  },
  {
    id: 'international',
    name: 'International',
    description: 'Global news and international relations',
    prompt: 'Generate international news about global events, diplomacy, or international relations'
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Sports news and athletic achievements',
    prompt: 'Generate sports news about major athletic events, championships, or sports developments'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Entertainment industry and cultural news',
    prompt: 'Generate entertainment news about movies, music, celebrities, or cultural events'
  }
];

export function getCategoryById(categoryId: string): NewsCategory | undefined {
  return NEWS_CATEGORIES.find(cat => cat.id === categoryId);
}

export function getAllCategories(): NewsCategory[] {
  return NEWS_CATEGORIES;
}

export function getCategoryPrompt(categoryId: string): string {
  const category = getCategoryById(categoryId);
  if (!category) {
    return NEWS_CATEGORIES[0].prompt; // Default to breaking news
  }
  return category.prompt;
}
