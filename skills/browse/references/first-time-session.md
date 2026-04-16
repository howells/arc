# First-time User Browsing Strategy

How to navigate a web app as someone who has never seen it before. This file defines
the session structure — what to try, in what order, and what questions to ask.
Judgment criteria come from `agents/review/first-time-user.md`.

## Before You Start

You have already:
- Read the codebase and synthesized an App Context summary
- Read `agents/review/first-time-user.md` for evaluation criteria
- Opened the browser to the target URL

**Important:** You know the codebase intent, but you are browsing as someone
who does NOT. Use your codebase knowledge to identify gaps between what the app
intends to communicate and what a new user would actually understand.

## Session Flow

### Step 1: Orientation (5-second test)

Take a screenshot immediately. Then answer honestly:

- **What is this?** Can I tell what the app does from this screen alone? Not from reading the codebase — from what's on screen.
- **What should I do first?** Is there a single obvious entry point, or am I staring at a wall of options?
- **What's competing for attention?** Count the number of distinct elements asking for my attention. More than 3-4 primary-level elements means cognitive overload.
- **Where am I?** Does the URL, page title, or heading orient me? Or could this be any page in the app?

Write your observation about orientation. Be specific: "I see X, Y, and Z, but I have no idea which one matters" is better than "the page is confusing."

### Step 2: Try the Most Obvious Action

Without consulting docs or nav menus, do the thing that seems most obvious. Click the biggest button. Fill out the most prominent form. Follow the most visible link.

- **Was it clear what would happen?** Did the button label tell me the outcome, or just a mechanism? ("Create project" is clear; "Submit" is vague; "Process" is opaque)
- **Did I get feedback?** After clicking, did something visibly change? Did I get a success message, a loading indicator, anything?
- **Do I know what to do next?** After the action, am I guided forward, or dropped into a new screen with no context?
- **Did anything unexpected happen?** Did it navigate me somewhere I didn't expect? Did a modal appear? Did the page scroll?

Take screenshots before, during (if there's a loading state), and after the action.

### Step 3: Make a Deliberate Mistake

Try to trigger an error. Submit an empty form. Click something that should be disabled. Enter wrong input.

- **Is the error message helpful?** Does it tell me WHAT went wrong and HOW to fix it? Or is it generic ("An error occurred")?
- **Is the error near the problem?** Is the message next to the field with the issue, or in a toast/banner I might miss?
- **Can I recover?** Is there a clear path back to a good state? Or am I stuck?
- **Are destructive actions protected?** If I try to delete something, is there a confirmation? Can I undo?

### Step 4: Explore Navigation and Discovery

Now look at the navigation. Try to find a feature you haven't used yet.

- **Are labels self-explanatory?** Would a non-technical person know what "Orchestration" or "Pipeline" or "Workspace" means?
- **Is navigation where I expect it?** Top bar, sidebar, or something non-standard? Does it follow Jakob's Law (users expect your site to work like other sites)?
- **Can I find secondary features?** Settings, account management, help — are these discoverable without trial-and-error?
- **Is there a search?** If the app is complex, is there a way to find things without navigating a tree?

### When to Go Deeper

If you hit a moment of genuine confusion ("I have no idea what this means"), investigate it. That confusion IS the finding. Spend time articulating exactly what's confusing and why, rather than moving on to cover more ground.

## Screenshot Guidance

- Take a screenshot of your **first impression** before doing anything
- Take screenshots when you're **confused** — capture the exact state that caused confusion
- Take screenshots of **error states** — these are often the least designed
- Reference screenshots in every observation
- If using Chrome MCP, capture the full page context, not just the element in question
