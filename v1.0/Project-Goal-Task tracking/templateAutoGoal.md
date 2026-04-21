---
tags: goal
alias: {{VALUE:Title}}
area: 
type: {{VALUE:BFG,Short}}
reason: {{VALUE:Why this goal?}}
duedate: {{VDATE:DueDate,YYYY-MM-DD}}
created: <% tp.file.creation_date() %>
---
%%
Progress:: `$= dv.view('progress', {file: '<% tp.file.title %>'})`
Target:: `$= dv.view('target', {file: '<% tp.file.title %>'})`
Bar:: `$= dv.view('total-progress-bar', {file: '<% tp.file.title %>'})`
Projects:: `$= const projects = dv.page('<% tp.file.title %>').file.inlinks.where(p => { const mp = dv.page(p.path); return mp.tags?.includes('project') && mp.status === 'In Progress'}); if (projects.length > 0) { dv.header(4, projects.length > 1 ? "Projects" : "Project"); dv.list(projects) }`
%%
# {{VALUE:Title}}
{{VALUE:Why this goal?}}
## Make it S.M.A.R.T
### What do you want to get? What kind of person do you want to be? What needs to be achieved? Be Specific. Physical deliverable, a performance increase/decrease, or a specific outcome (Key results)?

### What does success look like? What metric will you use. "...as Measured by...". What are the key results? How do I tell when I've succeeded?

### Gut check. Can you Achieve it given your current situation? If not, what more/less do you need?

### Is it Relevant to my higher aspirations? (check my [[Statement of Principles]])

### In What Time frame? You need a proper start and end date!

## Initiatives to make this happen
Ideally, these are the 1-3 month initiatives that help you achieve your BFGs.
### Ideas
- 
### Created projects:

```dataviewjs
const pages = dv.current().file.inlinks.where(p => dv.page(p.path).tags?.includes('project'));

dv.table(["Project", "Status", "Completed", "Tasks"], pages.map(p => {
	const page = dv.page(p.path);
	const tasks = page.file.tasks;
	return [
		page.file.link,
		page.status,
		tasks.where(t => t.fullyCompleted === true).length,
		tasks.length
	]
}));
```
