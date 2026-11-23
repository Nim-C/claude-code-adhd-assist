# claude-code-adhd-assist

An **ADHD accessibility mode for Claude Code**: an on/off switch above the message box. While it is on, Claude answers in a shape an ADHD brain can act on: the next action first, short numbered steps, no tangents, a clear next move at the end.

It is separate from the output style, so it works on top of any style you pick.

> Using the regular Claude chat (claude.ai / the Chat tab)? Get the chat version: **[claude-chat-adhd-assist](https://github.com/Nim-C/claude-chat-adhd-assist)**

> Studying with NotebookLM? **[claude-notebooklm-adhd-assist](https://github.com/Nim-C/claude-notebooklm-adhd-assist)** builds on this plugin. It is listed in this repository's marketplace, so installing it installs this plugin too.

## Install

At the prompt of a Claude Code session in a terminal:

```
/plugin install adhd-mode --marketplace Nim-C/claude-code-adhd-assist
```

Answer `y` to add the marketplace, then press Enter to pick the scope.

From a shell:

```
claude plugin install adhd-mode --marketplace Nim-C/claude-code-adhd-assist
```

In the Claude desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `Nim-C/claude-code-adhd-assist`, then **Add plugin**.

## Use

| Do | What happens |
| --- | --- |
| Click the **ADHD Accessibility** switch | Turns ADHD mode on or off (blue = on) |
| `/adhd-on` | Turns it on |
| `/adhd-off` | Turns it off |
| `/adhd-mode` | Shows whether it is on, and the options |

- It starts **off** in every new session.
- Each click leaves a line in the chat, so you can see where it was switched.
- Only the switch or the commands change it; what you write in a message never does.
- Built-in Claude Code commands are not touched.

## Remove

```
claude plugin uninstall adhd-mode
```

## Credits

The ADHD rules come from [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) (MIT License, see `LICENSE-i-have-adhd`). This project adds the switch, the commands and the chat version. Not made by Anthropic. It changes how Claude formats replies; it does not diagnose or treat anything.
