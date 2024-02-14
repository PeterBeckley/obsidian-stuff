---
headings:
- "[[<% tp.file.title %>#Accomplishments|✔️]] [[<% tp.file.title %>#Content Log|📚]] [[<% tp.file.title %>#Journal|💭]]"
tags: journal/daily
created: <% tp.file.creation_date() %>
cssclass: wide
---
> [!info|float-right-small] On This Date:
> ```dataview
LIST Rating
WHERE dateformat(file.day, "MM-dd") = "<% tp.date.now("MM-DD", 0, tp.file.title) %>" AND file.day.year != this.file.day.year
SORT file.day ASC
> ```
> 
# <% tp.date.now("dddd, ", 0, tp.file.title) %>[[Calendar/Monthly/<% tp.date.now("YYYY-MM", 0, tp.file.title) %> | <% tp.date.now("MMMM", 0, tp.file.title) %>]] <% tp.date.now("Do", 0, tp.file.title) %>, [[Calendar/Yearly/<% tp.date.now("gggg", 0, tp.file.creation_date()) %>|<% tp.date.now("gggg", 0, tp.file.creation_date()) %>]] : [[Calendar/Weekly/<% tp.date.weekday("YYYY-[W]ww", 0, tp.file.title) %> |W<% tp.date.now("ww", 0, tp.file.title) %>]]
[[Calendar/Daily/<% tp.date.now("YYYY-MM-DD", -1, tp.file.title) %> |« Prev]] - [[Calendar/Daily/<% tp.date.now("YYYY-MM-DD", +1, tp.file.title) %> |Next »]] 

----
# Current Focus
This is what you're aiming for this week overall
![[<% tp.date.now("gggg-[W]ww") %>#This week#Tasks]]

----
# Tasks due today
**What to accomplish This is what the day holds. Seize it, make it happen. Forward.**
```tasks
NOT (path includes utils)
(happens on <% tp.date.now("YYYY-MM-DD", 0, tp.file.title) %>) OR ((not done) AND (due before <% tp.date.now("YYYY-MM-DD", 0, tp.file.title) %>))
sort by priority
hide task count
```
## Other tasks you've identified

----
# Log

<%tp.file.include("[[tplDailys]]")%>
## Notes Created Today
>[!NOTE]- Files Created Today
>```dataview
>TABLE 
>FROM !"Calendar"
>WHERE file.cday = this.file.day 
>AND file.path != this.file.path
>SORT file.name asc
>```
----
## Reflection
Summarize your day.

Rating::
Summary::
Story::
### Accomplishments
**Did you accomplish? Did you get it all complete? Did things need diverting or reprioritizing? Learn anything just from the getting it done?**

### Content Log
**What media did you consume? What ideas did you generate?**

### Journal

