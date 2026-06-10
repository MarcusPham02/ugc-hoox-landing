# Agent Teams — Master Reference

> Source: https://code.claude.com/docs/en/agent-teams (experimental feature)
> Read this before spawning or coordinating build agents on this project.

## What they are

Multiple Claude Code instances working together. One session is the **lead**
(coordinates, assigns tasks, synthesizes); **teammates** each run in their own
context window and can message each other directly. Unlike subagents, teammates
talk to each other and self-coordinate through a shared task list — you can also
message any teammate directly without going through the lead.

Requires Claude Code **v2.1.32+** (`claude --version`).

## Enable (already done in this repo)

`.claude/settings.local.json` already sets:

```json
{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }
```

Note: that's a `.local` (personal, git-ignored) file. To share team-enablement
with collaborators, move the `env` block to a checked-in `.claude/settings.json`.

## Teams vs. subagents — pick the right tool

| | Subagents | Agent teams |
|---|---|---|
| Communication | Report back to caller only | Teammates message each other |
| Coordination | Main agent manages all work | Shared task list, self-claim |
| Best for | Focused tasks, only result matters | Work needing discussion/collaboration |
| Token cost | Lower (summarized back) | Higher (each teammate = full instance) |

Use teams for **research, parallel review, new modules, competing-hypothesis
debugging, cross-layer changes**. For sequential work, same-file edits, or
heavy-dependency tasks, use a single session or subagents.

## Starting a team

Just ask in natural language, describing task + team structure. Claude creates
the team, spawns teammates, coordinates, and cleans up when done. Example:

```
Create an agent team to review the landing page. Spawn three teammates:
one on accessibility, one on responsive/CSS, one on copy/messaging.
Have them each review and report findings.
```

## Controlling the team

- **Display modes** (`teammateMode` in `~/.claude/settings.json`): `in-process`
  (any terminal; Shift+Down to cycle teammates, type to message, Enter to view,
  Esc to interrupt, Ctrl+T toggles task list) or split-pane `tmux` (needs tmux
  or iTerm2 + `it2` CLI). Default `auto`. **VS Code integrated terminal does NOT
  support split panes — use in-process here.**
- **Specify count/model**: "Create a team with 4 teammates… use Sonnet for each."
  Teammates don't inherit the lead's `/model`; set **Default teammate model** in
  `/config`.
- **Plan approval**: "Require plan approval before they make changes." Teammate
  stays in read-only plan mode until the lead approves. Give the lead criteria
  ("only approve plans with test coverage") to steer its autonomous decisions.
- **Talk directly**: each teammate is a full session; message by name.
- **Shut down**: "Ask the <name> teammate to shut down."
- **Clean up**: "Clean up the team" — **always via the lead**; it fails if any
  teammate is still running, so shut them down first.

## Reusable roles — subagent definitions

Reference a subagent type by name when spawning:
`Spawn a teammate using the css-design agent type to ...`

This project already defines [.claude/agents/css-design.md](agents/css-design.md).
A teammate spawned from a definition honors its `tools` allowlist and `model`,
and the body is appended to its system prompt. `SendMessage` + task tools are
always available regardless of `tools` restrictions. Caveat: `skills` and
`mcpServers` frontmatter are **not** applied to teammates — they load skills/MCP
from project + user settings like a normal session.

## How it works

- **Storage**: team config `~/.claude/teams/{team}/config.json`,
  task list `~/.claude/tasks/{team}/`. Auto-generated — **don't hand-edit or
  pre-author** (overwritten on next state update). A project-level
  `.claude/teams/teams.json` is NOT recognized as config.
- **Context**: each teammate loads CLAUDE.md, MCP, skills + the spawn prompt.
  The lead's conversation history does **not** carry over — put task-specific
  detail in the spawn prompt.
- **Tasks**: states pending / in-progress / completed, with dependencies; blocked
  tasks auto-unblock when their dependency completes. File-locked claiming.
- **Permissions**: teammates inherit the lead's permission mode at spawn (incl.
  `--dangerously-skip-permissions`). No per-teammate modes at spawn time; change
  individually after.
- **Quality gates via hooks**: `TeammateIdle`, `TaskCreated`, `TaskCompleted` —
  exit code 2 to send feedback / block the action.

## Best practices

- Give teammates enough context in the spawn prompt (they don't inherit history).
- **3–5 teammates** for most work; ~5–6 tasks each. Three focused beats five
  scattered.
- Size tasks as self-contained units with a clear deliverable (a function, a test
  file, a review).
- Avoid file conflicts — give each teammate a different set of files. (For this
  repo: the four CSS files + index.html + the three JS modules are natural seams.)
- Tell the lead to "wait for your teammates to finish" if it starts doing the
  work itself.
- New to teams? Start with research/review (no parallel code-writing).
- Monitor and steer; don't leave a team running unattended.

## Limitations

- `/resume` & `/rewind` don't restore in-process teammates — tell the lead to
  spawn fresh ones.
- Task status can lag; nudge or update manually if a task looks stuck.
- Shutdown can be slow (finishes current tool call first).
- **One team at a time**; no nested teams; the lead is fixed for the team's life.
- Split panes unsupported in VS Code terminal, Windows Terminal, Ghostty.
