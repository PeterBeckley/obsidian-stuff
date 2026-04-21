---
tags: goal
alias: {{VALUE:Title}}
area: 
type: {{VALUE:BFG,Short}}
Progress: 0
Target: {{VALUE:🎯 Target (number)}}
reason: {{VALUE:Why this goal?}}
duedate: {{VDATE:DueDate,YYYY-MM-DD}}
created: <% tp.file.creation_date() %>
---
%%
Bar:: `$= dv.view('progress-bar', {file: '{{VALUE:Goal}}'})`
Projects:: `$= const projects = dv.page('{{VALUE:Goal}}').file.inlinks.where(p => { const mp = dv.page(p.path); return mp.tags?.includes('project') && mp.status === 'In Progress'}); if (projects.length > 0) { dv.header(4, projects.length > 1 ? "Projects" : "Project"); dv.list(projects) }`
%%
# {{VALUE:Title}}
GOAL: {{VALUE:Why this goal?}}
# Make it S.M.A.R.T
## What needs to be achieved? Be **S**pecific. Is it a physical deliverable, a performance increase/decrease, or a specific outcome?

## What does success look like? What metric will you use. "...as **M**easured by...". What are the key results? How do I tell when I've succeeded?

## Gut check. Can you **A**chieve it given your current situation? If not, what more/less do you need?

## Is it **R**elevant to my higher aspirations? (check my [[Statement of Principles]])

## In What **T**ime frame? You need a proper start and end date!

## Projects to make this happen
### Ideas
- 
### Created projects

```dataview
TABLE WITHOUT ID file.link as "Project", status as "Status"
From #project AND (([[#]]) OR outgoing([[#]]))
WHERE file.name != this.file.name
SORT status desc
```
