# Post-Push Review

Run all 4 review agents in parallel against the current branch changes. Use this after committing and pushing a branch, or any time you want a full review sweep.

## Instructions

Run the following 4 agents **in parallel** using the Task tool. Each agent should review the changes made on the current branch compared to `main`.

1. **design-review** agent: Review all modified/new `.tsx` files in `src/components/` and `src/app/` for design system compliance
2. **tech-lead-code-reviewer** agent: Review all modified/new files in `src/` for production readiness, type safety, and architectural consistency
3. **test** agent: Check if new source files in `src/lib/` lack test coverage, and write tests for any untested modules
4. **sync-docs** agent: Update CLAUDE.md and README.md to reflect the changes made in this session

### Getting the changed files

Before spawning agents, run:
```
git diff --name-only main...HEAD
```

Pass the list of changed files to each agent so they know what to review.

### Output

After all agents complete, summarize their findings in a single report:
- **Design Review**: compliance score + critical issues
- **Code Review**: critical issues + recommendations
- **Test Coverage**: new tests written + coverage impact
- **Docs**: what was updated in CLAUDE.md / README.md
