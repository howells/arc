"use client";

import type { Skill } from "@/lib/types";

interface SkillListProps {
  onSkillClick: (skill: Skill) => void;
  skills: Skill[];
}

export function SkillList({ skills, onSkillClick }: SkillListProps) {
  return (
    <div className="mb-[calc(var(--baseline)*1)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <button
          className="group rounded-lg border border-neutral-200 p-4 text-left transition-colors duration-200 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/8"
          key={skill.name}
          onClick={() => {
            onSkillClick(skill);
          }}
          type="button"
        >
          <span className="flex items-center gap-2">
            <span className="block font-mono text-neutral-800 text-sm transition-colors group-hover:text-[var(--color-accent)]">
              {skill.invokable ? `/arc:${skill.name}` : skill.name}
            </span>
            {!skill.invokable && (
              <span className="rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 leading-none">
                internal
              </span>
            )}
          </span>
          <span className="mt-1 block text-neutral-500 text-sm leading-snug">
            {skill.desc}
          </span>
        </button>
      ))}
    </div>
  );
}
