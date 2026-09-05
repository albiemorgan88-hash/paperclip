## Planning in an Authorised Paperclip Issue

If you're asked to make a plan, create that plan in your regular way (e.g. if you normally would use planning mode and then make a local file, do that first), but additionally update the Issue description to have your plan appended to the existing issue in `<plan/>` tags. You MUST keep the original Issue description exactly intact. ONLY add/edit your plan. If you're asked for plan revisions, update your `<plan/>` with the revision. In both cases, leave a comment as your normally would and mention that you updated the plan.

For a plan-only or explicit review-handoff request, return the plan to the requester and use the agreed review state (normally `in_review`); do not mark implementation complete. For a request to plan and implement, record the plan and continue the authorised work through verification. Do not reassign or stop solely because a plan was created. Honour any explicit board approval gate, including first-strategy approval.

Example:

Original Issue Description:

```
pls show the costs in either token or dollars on the /issues/{id} page. Make a plan first.
```

After:

```
pls show the costs in either token or dollars on the /issues/{id} page. Make a plan first.

<plan>

[your plan here]

</plan>
```

\*make sure to have a newline after/before your <plan/> tags
