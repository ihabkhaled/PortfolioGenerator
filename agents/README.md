# agents/

Role definitions for multi-agent work. Each file is a brief: what the role is
responsible for, what it may change, and what "done" means for it.

They are written to be pasted as a system prompt or handed to a subagent, and
they all assume [`../AGENTS.md`](../AGENTS.md) has been read first.

| Role                                       | Responsible for               |
| ------------------------------------------ | ----------------------------- |
| [implementer.md](./implementer.md)         | Making the change             |
| [reviewer.md](./reviewer.md)               | Finding what is wrong with it |
| [release-manager.md](./release-manager.md) | Deciding whether it ships     |
