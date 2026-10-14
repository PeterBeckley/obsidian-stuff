<%"---"%>
cssclasses: no-inline
tags:
  - journal/weekly
created: <% tp.date.now("YYYY-MM-DD") %>
<%"---"%>

# [[Calendar/Yearly/<% tp.date.now("gggg", 0, tp.file.creation_date()) %>|<% tp.date.now("gggg", 0, tp.file.creation_date()) %>]] » [[Calendar/Monthly/<% tp.date.now("gggg-MM", 0, tp.file.title) %> | <% tp.date.now("MMMM", 0, tp.file.title) %>]] » Week <% tp.date.now("WW", 0, tp.file.title) %> • [[Calendar/Quarterly/<% tp.date.now("gggg-[Q]Q", 0, tp.file.title) %>|Q<% tp.date.now("Q", 0, tp.file.title) %>]]

>[!inits]+ Current initiatives
>Keep these things in mind as you set up this week's task list:
>![[<% tp.date.now("gggg-MM", 0, tp.file.title) %>#This Month (<%* tR += moment(tp.file.title, 'gggg-[W]WW').startOf('week').format('gggg-MM') %>)#Initiatives]]

> [!calendar]- Last week
> ![[<% tp.date.now("gggg-[W]WW", -7, tp.file.title) %>#This week#Days]]

# GTD Review
- [ ] Review Active projects. They need either delegation flag, deferred action (task on calendar), or next action defined.
- [ ] Did you veer off to tangents that needs to be shut down, redirected, delegated, or officially become part of the plan ([[Build one bridge]])?
- [ ] Did you notice any times when your systems worked invisibly after thinking it failed? Add highlights for them then check off this item.

----
# This Week
##### Move the Needle
<% await tp.system.prompt("What is this weeks focus?") %>

## Needs Attention
<%*
const folder = "+";
const quotes = app.vault.getMarkdownFiles().filter(x => x.path.startsWith(folder));
const randomQuote= quotes[Math.floor(Math.random() * quotes.length)].basename;
-%>
- [ ] The note [[<% randomQuote %>]] could probably use some work.


## Log
```tasks
not done
tag includes #GTD/w 
due in <% tp.date.now("gggg-[W]WW", 0, tp.file.title) %>
short mode
hide task count
hide tags
```

## Days
```base
formulas:
  dayRank: 'if(rank,"Rank: " + note.rank,"Rank: ⚠️NOT FOUND")'
properties:
  file.name:
    displayName: Name
  note.Summary:
    displayName: Summary
views:
  - type: list
    name: Daily Summary
    filters:
      and:
        - file.hasLink(this.file)
        - file.hasTag("journal/daily")
        - not:
            - file.inFolder("utils")
    order:
      - file.name
      - Summary
      - formula.dayRank
    sort:
      - property: rating
        direction: DESC
      - property: file.name
        direction: ASC
    columnSize:
      note.rating: 77
```

## Highlights
```base
properties:
  file.name:
    displayName: Name
views:
  - type: list
    name: Highlights
    filters:
      and:
        - file.hasLink(this.file)
        - "!highlights.isEmpty()"
    order:
      - file.name
      - highlights
```

### Notes



