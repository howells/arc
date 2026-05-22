# Arc Context

This is the canonical source for Arc's product definition, domain language, and operating boundary. README, agent instructions, website copy, and individual skills may summarize Arc, but they should not introduce competing definitions.

Arc is a self-contained software development lifecycle for coding agents. It helps move work from idea to shipped code through explicit workflows for vision, ideation, design, implementation, review, testing, documentation, and release.

Arc should stay focused on the development cycle. It is not a general-purpose catalogue of every useful agent skill, and it should not require external personal skill collections to make its core workflows understandable or usable.

## Language

- **Arc**: The lifecycle system. It provides the spine of software work from early thinking through implementation and release.
- **Workflow**: A user-facing Arc skill that owns a recurring phase or cross-cutting concern in the development cycle.
- **Phase**: A lifecycle stage such as vision, ideation, implementation, review, testing, or release readiness.
- **Control plane**: The lightweight routing layer that decides which workflow applies without loading every workflow into context.
- **Supporting skill**: An internal or enabling Arc skill that helps workflows run but is not itself a user-facing lifecycle workflow.
- **Review**: An advisory workflow for evaluating plans, specs, designs, or implementation approaches before deciding what to change.
- **Refactor**: A codebase-structure workflow for inspecting existing code with the explicit goal of producing a refactoring plan or RFC.
- **Audit**: A verification and assessment workflow that combines mechanical checks with specialist review to report current codebase health.
- **Specialist lens**: A focused way of inspecting work, such as reuse, API documentation, architecture boundaries, UI quality, or browser QA.
- **Self-contained**: Arc workflows may absorb useful patterns from adjacent tools, but they should explain and execute those patterns in Arc's own language.
- **Full-runtime**: An install that includes Arc-owned agents, references, disciplines, templates, scripts, rules, and skills.
- **Prompt-only**: An install that includes skill prompts only. Prompt-only installs support lightweight guidance but may not support workflows that rely on Arc-owned files.

## Workflow Map

Arc's public workflow surface is organized around the lifecycle:

- **Entry**: route the user to the right workflow with minimal startup context.
- **Why**: clarify project purpose, goals, and constraints.
- **What**: turn ideas into validated specs, designs, or plans.
- **Do**: implement, design, test, document, and verify the change.
- **Review**: inspect plans, code, architecture, UI, browser behavior, and launch readiness.
- **Ship**: prepare the project for release, commit work cleanly, and preserve progress.

Cross-cutting workflows can run at any point, but they should still serve the lifecycle rather than becoming unrelated utilities.

`detail`, `progress`, and `using-arc` are supporting skills, not workflows. They should be documented as internal routing, planning, or persistence mechanisms rather than as public lifecycle stages.

## Product Boundary

Arc owns the software development cycle:

1. Understand the project and route the work.
2. Clarify why the work matters.
3. Shape the idea into a design or spec.
4. Implement with tests and verification.
5. Review the plan, code, and rendered experience.
6. Prepare the project to ship.
7. Commit, document, and keep progress legible.

Launch readiness means the project is visitable, shareable, and ready for a first real audience. It covers go-live basics such as deployment, domain, HTTPS, environment variables, access gates, metadata, social previews, favicons, obvious placeholders, accidental robots/noindex blockers, and production settings for detected services. It should not expand into deep SEO, responsive, testing, security, or code-health work; those belong to specialist workflows.

Arc may include specialist checks when they are part of that cycle. For example, implementation and review workflows can check for reusable components, concise public API docs, architecture boundaries, oversized files, responsive behavior, and browser-visible regressions.

Brand identity creation is outside Arc's core lifecycle. Arc design workflows may consume an existing `docs/brand-system.md`, but Arc should not own brand discovery, identity direction generation, or brand asset production.

Project, product, package, and feature naming is outside Arc's core lifecycle. Arc vision or ideation workflows may ask for or use an existing name, but Arc should not own naming strategy, domain availability checks, GitHub conflict checks, or product-name validation.

Arc should not expose external skill dependencies for those checks. If a specialist practice matters to Arc, make it Arc-native: name it plainly, explain the judgment, and place it in the workflow where it belongs.

## Design Principles

- Review is woven throughout, not bolted on at the end.
- Keep the lifecycle visible. A user should understand where they are in the path from idea to shipped code.
- Use one focused question at a time when clarification is needed.
- Apply YAGNI when the proposed scope exceeds the user's goal.
- Use TDD and verification for implementation work.
- Keep quality continuous. Run relevant type, lint, build, and test checks during the work rather than only at the end.
- Let knowledge compound. Capture solved problems, decisions, and progress where future sessions can reuse them.
- Treat frontend design as part of software delivery, not a decorative afterthought.
- Prefer routing to the smallest relevant Arc workflow over preloading broad context.
- Treat reviewers and audits as advisory. The user decides.
- Integrate quality checks into the relevant phase instead of bolting them on at the end.
- Absorb useful outside patterns only when they strengthen Arc's core lifecycle.
