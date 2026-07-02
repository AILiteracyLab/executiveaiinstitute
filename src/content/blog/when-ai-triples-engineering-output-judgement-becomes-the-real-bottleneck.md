---
title: "When AI Triples Engineering Output Judgement Becomes the Real Bottleneck"
description: "Anthropic recently told its growth team to hire more product managers, not fewer. That sounds backwards. The whole pitch of AI coding tools is that you need …"
pubDate: 2026-07-01
author: jamie
readMinutes: 6
---

Anthropic recently told its growth team to hire more product managers, not fewer. That sounds backwards. The whole pitch of AI coding tools is that you need fewer people to ship software, so why would the company behind one of the best of them be adding staff to the side of the house that decides what gets built? The answer is the most useful thing in this story, and most organisations are about to learn it the slow way.

Claude Code had quietly raised the output of Anthropic's engineering team to roughly [three times its headcount](https://venturebeat.com/infrastructure/claude-code-turned-every-engineer-into-three-now-companies-need-more-product-thinkers), and at that point the constraint stopped being the writing of code and became the deciding of what to build. As the reporting puts it, [the bottleneck moved from the integrated development environment to the people deciding what to build](https://venturebeat.com/infrastructure/claude-code-turned-every-engineer-into-three-now-companies-need-more-product-thinkers). In plain terms: when typing is no longer the hard part, judgement becomes the scarce resource.

You can see the shift in one striking number. New monthly questions on Stack Overflow, the site a generation of engineers used to get unstuck, are [down roughly 77% since November 2022](https://venturebeat.com/infrastructure/claude-code-turned-every-engineer-into-three-now-companies-need-more-product-thinkers), the month ChatGPT launched. The model did not just answer questions faster. It absorbed an entire step of the old workflow. And the compression kept going. One AWS engineering team reportedly took an 18-month rearchitecture originally scoped for 30 engineers and [finished it with 6 people in 76 days](https://venturebeat.com/infrastructure/claude-code-turned-every-engineer-into-three-now-companies-need-more-product-thinkers). The hard part was never how long the code took to write. It was how clearly the team could describe what "correct" looks like.

This is the bit worth slowing down on, because it is easy to read a 3x productivity claim and reach for the wrong conclusion. The instinct in many boardrooms is to treat a tool like this as a headcount lever: same output, fewer people. But the honest reading is different. The machine did the machine-like work, the repetitive translation of intent into syntax, and it did it better than people ever could. What it did not do was decide what was worth building, who it was for, or what trade-off to make when two good options collided. Those are human questions, and there are now three engineers' worth of them landing on roles that have not grown at all.

I have watched this pattern in organisations that have nothing to do with software. Automate the drudgery and you do not remove the work, you relocate it. The new pressure point lands on the people who set direction, weigh consequences, and own the call. If you give a team powerful tools but weak clarity of intent, you do not get three times the value. You get three times the speed at building the wrong thing. Poor thinking plus powerful tools simply means faster harm.

So the practical question for any leader rolling out AI coding tools is not "have we trained people to use it?" That is the easy half. The harder half is whether you are investing in product thinking, prioritisation, and the messy skill of deciding what good looks like before anyone builds it. A training programme aimed purely at the tool answers a question that is rapidly becoming the cheap part. The expensive part, the one that will separate teams over the next two years, is judgement.

There is a fairness dimension here too, and it deserves saying plainly. When the constraint moves from execution to decision-making, the people who already had a voice in what gets built gain even more leverage, and the people who were heads-down executing risk being left behind unless they are deliberately brought into the thinking. Augmentation reshapes a role, but who gets reshaped upward and who gets quietly sidelined is a leadership choice, not an accident of the technology.

**One thing to try this month:** before your next AI tooling rollout, audit where your decision-making capacity actually sits. Count the people who can confidently define what to build and why, not just how. If that number has not grown while your build speed has tripled, you have found your real bottleneck, and it is not the software.

---

## Frequently Asked Questions

### Does Claude Code actually make engineers three times more productive?

Roughly, yes, according to Anthropic's own experience, where [Claude Code lifted engineering output to about three times the team's headcount](https://venturebeat.com/infrastructure/claude-code-turned-every-engineer-into-three-now-companies-need-more-product-thinkers). The figure reflects how much faster code now gets written, but the more important effect is that it shifts the bottleneck from writing code to deciding what to build. Treating the number purely as a headcount saving misses that point.

### Will AI coding tools replace software engineers?

No, but they change the shape of the job. AI tools now handle much of the repetitive translation of intent into working code, which means engineers spend less time typing and more time on strategic decisions about what to build and why. The role moves towards product thinking, orchestration, and judgement rather than disappearing.

### Why are companies hiring more product managers if AI is doing the coding?

Because when code gets cheap to produce, the scarce resource becomes deciding what is worth producing. Anthropic told its growth team to hire more product managers, not fewer, because three times the engineering output created a backlog of decisions about direction, priorities, and trade-offs that the existing roles could not absorb.

### What skills matter most for engineers in an AI-assisted workflow?

Judgement, prioritisation, and the ability to clearly define what "correct" looks like before anyone builds it. The mechanical skill of writing syntax is increasingly handled by tools, so the differentiator becomes clarity of intent: knowing what to build, who it serves, and which trade-off to make when two reasonable options conflict.

### How should leaders respond when AI tools triple their team's build speed?

Audit where decision-making capacity actually sits, not just whether people can operate the tool. If build speed has tripled but the number of people who can confidently define what to build and why has not grown, the bottleneck has simply moved. Investing in product thinking and prioritisation matters more than another tool tutorial.
