# META v3
Disclaimer: I created this entire system (or set of systems) to work for me. I'm not developing a product for consumers. This is as much a "learning in public" thing as it is anything else.

The biggest shifts from v1 is less reliance on the *Dataview* plugin in favor of native bases files, abandoning all KanBan boards, and implementing a sort of ACE + GTD hybrid system for the life cycle of efforts (ideation, planning, tracking, reviewing, completing, archiving). The ACE structure was developed by Nick Milo so a shout out goes to him, and, of course, GTD was created by David Allen. Why a hybrid system? For my brain, GTD describes the best process for managing the life cycle of efforts. ACE is a structure born from a system of discovering emerging knowledge that seems to really only come from a discipline of heavily linking notes throughout one's vault. These two systems compliment each other well, and overlap primarily around the concepts of efforts. I was already managing efforts in META, but wasn't accumulating knowledge in it. Part of my philosophy regarding that latter portion is to be ruthless in discerning what notes stay in my vault. I'm not interested in hoarding data or housing notes for their own sake or for making a "cool" graph view or other egocentric reason. 

If you wish to incorporate this system into your vault, this is the assumed starting folder structure for scripts, templates, plugin configs, everything (not exhaustive/complete):

```
+
Atlas
..DOTS
..GOALS
..INTELS
..MAPS
....All
....BASES
....Views
....Atlas.md
..SOURCES
Calendar
..10 Reviews
..Daily
..Monthly
..Quarterly
..Weekly
..Yearly
Efforts
..PROJECTS
....Active
....Simmering
....Sleeping
X
..FILES
..Queries
..Sandbox
..scripts
..Structure
..TEMPLATES
..Maintenance.md
..Tips and Tricks.md
..Useful Snippets.md
Dashboard.md
```

## Theme
While v3 is theme agnostic, like v1, I've switched from using Primary or ITS to the AnuPpucin theme. I'm using several "add on" css files by the theme author to add extra options via the *Style Settings* plugin. I'm also using several of the css files generously made available by the ITS theme creator for use with other themes to keep some visual consistency I first implemented in v1. Nothing of my Primary theme implementation or customization remains and it unfortunately seems like that theme project is no longer under active development or maintenance.

## Templates
Broken down further by function/system within META 3.0 that uses them.

### Effort tracking
In 3.0 all of these note types are generated with userscripts via QuickAdd (plugin). 

### Periodic notes
Used via the Periodic Notes, Templater, QuicAdd, and other plugins/scripts to create the periodic notes in the various Calendar sub-folders.
- tWeekly.md - Called by Periodic Notes (plugin). Uses Bases (Obsidian), Tasks (plugin), and Templater (plugin) to build. I removed the meal-planning portion, but otherwise this is my current template for weekly notes.

## Plugins
tbd, but will likely include my Quick Add and Meta Bind configurations at some point to help others implement v3 if they wish.

## Userscripts
Broken down by the system/plugin that uses them. These automate some of my systems and processes. e.g. create project notes, promote tasks to "next action", create reference notes, and even convert a regular note into a project note. 
