import type { MetadataRoute } from "next";

import { getAgents, getRules, getSkills } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const skills = getSkills();
  const agents = getAgents();
  const rules = getRules();

  return [
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 1,
      url: "https://usearc.dev",
    },
    ...skills.map((skill) => ({
      changeFrequency: "monthly" as const,
      lastModified: new Date(),
      priority: 0.8,
      url: `https://usearc.dev/skills/${skill.name}`,
    })),
    ...agents.map((agent) => ({
      changeFrequency: "monthly" as const,
      lastModified: new Date(),
      priority: 0.7,
      url: `https://usearc.dev/agents/${agent.name}`,
    })),
    ...rules.map((rule) => ({
      changeFrequency: "monthly" as const,
      lastModified: new Date(),
      priority: 0.6,
      url: `https://usearc.dev/rules/${rule.slug}`,
    })),
  ];
}
