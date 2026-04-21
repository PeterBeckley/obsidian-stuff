---
headings:
  - "[[<% tp.file.title %>#Accomplishments|✔️]] [[<% tp.file.title %>#What went good?|👍]] [[<% tp.file.title %>#What went bad?|👎]]"
tags:
  - journal/weekly
cssclasses:
  - wide-page
created: <% tp.file.creation_date() %>
---
# [[Calendar/Yearly/<% tp.date.now("gggg", 0, tp.file.creation_date()) %>|<% tp.date.now("gggg", 0, tp.file.creation_date()) %>]] » [[Calendar/Monthly/<% tp.date.now("gggg-MM", 0, tp.file.title) %> | <% tp.date.now("MMMM", 0, tp.file.title) %>]] » <% tp.date.now("[Week ]ww", 0, tp.file.title) %>
◄ [[Calendar/Weekly/<% tp.date.now("gggg-[W]ww", -7, tp.file.title) %>| <% tp.date.now("gggg-[W]ww", -7, tp.file.title) %>]] | [[Calendar/Weekly/<% tp.date.now("gggg-[W]ww", 7, tp.file.title) %>|<% tp.date.now("gggg-[W]ww", 7, tp.file.title) %>]] ►

>[!compass]+ # Current initiatives
>Keep these things in mind as you set up this week's task list:
>![[<% tp.date.now("YYYY-MM", 0, tp.file.title) %>#This Month (<% tp.date.now("YYYY-MM", tp.file.title) %>)#Initiatives]]
# Last week
> [!shipwheel]+ %%%%
> ![[<% tp.date.now("yyyy-[W]ww", -7, tp.file.title) %>#This week#Tasks]]
> ![[<% tp.date.now("yyyy-[W]ww", -7, tp.file.title) %>#This week#Days]]

# GTD Review
- [ ] Review projects on [[Project Board]] and see if there are tasks that can inform direction for this week. *Make sure each project has a next action defined!*
- [ ] Did you veer off on tangents that needs to be shut down, redirected, delegated, or officially become part of the plan ([[Build one bridge]])?

----
# This week
## Tasks
**What to accomplish? If you could only get three specific tasks done this week, what would they be? How do they relate to your projects and goals?**
- [ ] 
- [ ] 
- [ ] 

## Needs attention
<%*
const folder = "+ Incoming";
const quotes = app.vault.getMarkdownFiles().filter(x => x.path.startsWith(folder));
const randomQuote= quotes[Math.floor(Math.random() * quotes.length)].basename;
-%>
- [ ] The note [[<% randomQuote %>]] could probably use some work.

## Log
<%tp.file.include("[[tplWeeklies]]")%>

## Days
```dataview
TABLE Rating as ⭐, Summary, Story, join(headings) as "Supplementals"
FROM [[<% tp.file.title %>]] AND #journal/daily AND !"utils"
WHERE rating
sort file.name asc
```

## Highlights
```dataview
TABLE WITHOUT ID file.link AS "Day", highlight AS "Highlights"
FROM #journal/daily AND [[<% tp.file.title %>]]
WHERE highlight
SORT file.name asc
```

## Reflection
Summarize the week

Summary:: 
Happiness:: 
Productivity:: 
Relationships:: 
Focus:: 
### Accomplishments
**Did you accomplish? Did you get all the tasks done? Did you learn anything or need to drop or re-prioritize something?**

### What went good?


### What went bad?



## Metadata
- [ ] #task/computer New week standup 📅 <% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title) %>
- [ ] #task/studio Do some cleaning 📅 <% tp.date.weekday("YYYY-MM-DD",1, tp.file.title) %>
- [ ] #task/errand Get some groceries 🍎🥑🚙 📅 <% tp.date.weekday("YYYY-MM-DD", 2, tp.file.title) %>
- [ ] #task/computer Develop new social posts 📅 <% tp.date.weekday("YYYY-MM-DD",2, tp.file.title) %>
- [ ] #task/computer Weekly review 📅 <% tp.date.weekday("YYYY-MM-DD",6, tp.file.title) %>



