<overview>
Several Arc workflows clarify work through a one-question-at-a-time interview loop — ideate, review, and any skill that resolves open decisions before acting. These are the rules that loop follows, in one place. When a skill runs a question loop, read this first.
</overview>

<facts_vs_decisions>
**Look it up, don't ask it.** If a fact can be found in the codebase, find it rather than asking. Decisions belong to the user; facts belong to you.

The agent never answers its own decisions. Walk each branch of the design, resolve dependencies between decisions one by one, and put every decision to the user. Reach for a tool before reaching for a question — a question spent on something you could have discovered wastes the user's turn.
</facts_vs_decisions>

<one_question_at_a_time>
**Ask one question at a time, and carry a recommendation.** Wait for the answer before asking the next. Bundling several questions into one message is bewildering and forces the user to track state you should be tracking.

Every question names the option you'd pick, so the user can accept a sensible default fast and only slow down where they disagree.
</one_question_at_a_time>

<confirmation_stop_gate>
**Do not enact the plan until the user confirms shared understanding.** The loop ends when the user agrees the plan is right, not when you run out of questions. Presenting options, tables, or competing proposals for the user to decide on is part of the loop; enacting the outcome — writing the spec, plan, or code, or making changes — before that confirmation jumps the gate.
</confirmation_stop_gate>
