---
up: "[[Collections MOC]]"
cssclasses:
  - cards
  - wide-page
tags:
  - map/view
created: 2024-07-23 07:31
---

# Book Shelf ([[Collections MOC|⬆️]])
There are currently `$=dv.pages(this.file).where(p => p.type == "book").length` items on the shelf. `$= "**"+dv.pages(this.file).filter(p => p.lastRead && p.lastRead.toString().includes(new Date().getFullYear().toString())).length+"**"` books read so far in `$=new Date().getFullYear()`
Currently reading: `$=dv.pages(this.file).where(p => p.status == "reading").file.link`

~~~tabs
tab: Unread - by date added
```dataview
TABLE WITHOUT ID embed(link(meta(image).path)) as "Cover", file.link as title 
FROM "Cards/Books"
WHERE type != null AND (status = "to-read" OR status = "reading")
SORT added desc
```
tab: Read - by date finished
```dataview
TABLE WITHOUT ID embed(link(meta(image).path)) as "Cover", file.link as title 
FROM "Cards/Books"
WHERE type != null AND status = "read" AND lastRead !=""
SORT lastRead desc
```
tab: Read this year
```dataview
TABLE WITHOUT ID embed(link(meta(image).path)) as "Cover", file.link as title 
FROM "Cards/Books"
WHERE type != null AND status = "read" AND lastRead.year= date(now).year
SORT lastRead desc
```
tab: Read last year
```dataview
TABLE WITHOUT ID embed(link(meta(image).path)) as "Cover", file.link as title 
FROM "Cards/Books"
WHERE type != null AND status = "read" AND lastRead.year= (date(now).year - dur(1 year).year)
SORT lastRead desc
```
tab: Wanted to Buy
```dataview
LIST
FROM #wanted AND "Cards/Books"
```
~~~


