I now have documentation notes in my vault so I'm just going to copy pasta the relevant portions here. That means that not all links cleanly work within this repo. These docs also reveal how I trigger the scripts, but you certainly don't have to do it this way. META 3.0 uses YAML/note properties extensively, and most of my system rely on them. You can easily change the names of the properties the scripts manipulate to match your vault, but if you don't use properties a lot, these scripts aren't likely to be much fun to adapt. You should consider using note metadata to do the heavy lifting, it's a powerful way forward for Obsidian.

## QuickAdd
I heavily rely on JS scripts triggered by the QuickAdd plugin. Some of them are complex and all of them need to be documented along with the menu(s) that trigger them. The can found in `X/scripts/`.

### Note-creation Scripts

#### Project - newProject.js
Trigger: `CTRL+N > Efforts > Project`

Prompts: Project Name, Alias, Rank (default 3.5), Project Purpose, then a multi-select modal of every non-archived Goal note (categories includes `[[Goals]]`) to link as related goals, then a folder pick (`Efforts/PROJECTS/Active` or `Simmering`) to establish the initial effort "level", then a yes/no for creating an external project folder. If you say yes to the external folder, it creates `D:\Projects\<Project Name>\` on disk and adds a link to it in the note Actions panel. If the project name contains characters invalid for a folder or file name, this will fail silently into a caught error notice, not a crash.

Filename pattern: `Efforts/PROJECTS/[Active OR Simmering]/Project Name.md`.

YAML set on creation: `estatus: ToDo`, `archive: false`, `categories: [[Projects]]`, `rank`, `goal` (links to selected goals), `aliases`. Body includes a Status input field (Meta Bind plugin) and a "next action" button (name: `nextAction`, script `nextAction.js`), plus the standard Desired End State / Actual Outcome / Tasks / Notes / Process-System Changes / Known Issues / Milestones section skeleton. Embeds `Structure.base#Supporting Files`.

The `## Actual Outcome` section seeds an empty `> [!LL]` callout instead of a plain heading, this is where Lessons Learned content goes. The `## Tasks` section always ends with `- [ ] Write Lessons Learned` as its last line, a deliberate gate: since `nextAction.js` only flips a project to Review once every task is checked, this task forces you to consciously handle (or explicitly skip) lessons before the project can silently transition. See [[#Helper/support Scripts]] below for how that content actually gets pushed to the parent Goal.

Won't create a note that already exists at the target path.

newProject.js (QuickAdd) - (3.0) This gets called from a macro with the only step being to run this script. It creates new project notes for me by asking relevant questions about the project metadata. It also asks if I want to create a folder for project files on my hard drive. I don't like storing *everything* in my vault because file sizes can reach ~20-700MB. Since I'm an artist, these are typically templates, Clip Studio files, and perhaps spreadsheets and other docs; rarely a markdown file.

convertToProject.js (QuickAdd) - (3.0) This gets called from a macro with the only step being to run this script. It converts any active note into a "project" note in my vault. It asks me for the relevant info, then adds the new YAML, header, and footer text while leaving existing content in place. I use this if I've created a quick/basic note sometime in the past and now realize that I like the idea or whatever enough to dedicate some bandwidth to it. It wasn't a simmering project before, I didn't think of it as a project when I first made the note.

failProject.js (QuickAdd) - (3.0) Sometimes projects no longer serve their object, me, or the effort they were for. This script quickly archives, reranks, and move the note appropriately. I go back at the end of the year and review these for lessons learned so I get better at defining projects, understanding scopes and my capacities.

### Project Status-change Scripts
These only operate when on an active project note.

#### Archive Project - archiveProject.js
Trigger: `CTRL+N > Efforts > Archive Project`

Prompts: Completion Date (defaults to today).

YAML set on trigger: `archive: true`, `estatus: Done`, `completeDate`, adds `emtl` to `tags`. 

Strips the next-action button and the Status input field from the note Actions panel.  Moves the file to `Efforts/PROJECTS/Sleeping`.

#### Fail Project - failProject.js
Trigger: `CTRL+N > Efforts > Fail Project`

Prompts: a yes/no for whether there are any lessons to add before failing, and if yes, a multi-line input for the lessons themselves.

If lessons were entered, they're written into the project's `> [!LL]` callout (under `## Actual Outcome`), then `pushLessonsToGoal.js` is called to push them up to the linked Goal's Lessons Learned section, see [[#Helper/support Scripts]] below. This is the one place lessons capture isn't gated by the "Write Lessons Learned" task the way Review is, since failing a project doesn't go through `nextAction.js`'s task-exhaustion flow at all.

YAML set on trigger: `estatus: Failed`, `rank: 1`, adds `emtl` to `tags`

Strips the next-action button and the Status input field from the note Actions panel.  Moves the file to `Efforts/PROJECTS/Sleeping`.

Unlike `archiveProject.js`, this script does not set `archive: true`. Failed projects need to stay visible outside the archive filter so they surface during the annual review process, where they're reviewed one-by-one for lessons learned and archived manually as part of that review process.

### Note Conversion

#### Convert Note - convertNote.js
Trigger: `CTRL+N > Efforts > Convert Note`

Initial choice: AOR, MOC, Project, or Intel.

**If AOR:** sets `archive: false`, adds `[[AORs]]` to categories, sets `estatus: Active`. Injects an input field (name: `AORStatus`) and `Structure.base#AOR Genealogy`. Adds an empty `## Intel` section at the bottom, the target for `pushLessonsToAOR.js`, see [[#Goal Rollup Scripts]] above. Appends "AOR" to filename if needed.

**If MOC:** sets `archive: false`, adds `[[Maps]]` to categories. Embeds `Structure.base#Incoming Links`. Appends " MOC" to filename if needed.

**If Project:** prompts Rank (default 3.5) and Project Purpose, then the same multi-select goal modal and folder pick as `newProject.js`. Unlike `newProject.js`, this doesn't build a note from nothing, it has to preserve whatever content the note already has. It then renames/moves the file into the chosen Projects subfolder. Its footer skeleton includes the same empty `> [!LL]` callout and gating `- [ ] Write Lessons Learned` task as `newProject.js`, kept in parity, see that entry above for what these are for.

**If Intel:** prompts you to pick a target project from Active and Simmering projects. YAML set: `[[Intels]]` to categories, adds the selected project to `project`. Moves the file to `Atlas/INTELS/`. 

⚠️If any changes are made to the "new" process, they must be duplicated to the "convert" one to maintain parity. These two can't be combined easily into one mega script without refactoring the logic and branching, which isn't worth the effort right now.

### Task and Button Scripts

#### nextAction.js
Trigger: a Button (name: `nextAction`), embedded in project notes by `newProject.js`/`convertNote.js`. 

On click: marks the current open task tagged `#task/project` as complete (adds a checkmark and today's date), then scans the note's `## Tasks` section for remaining open (unchecked) tasks.

**If no open tasks remain:** saves the cleanup, sets `estatus: Review`, deletes `next_action`, then calls `pushLessonsToGoal.js` (see [[#Helper/support Scripts]] below) before stopping. This is an automatic status transition: a project can silently flip to Review status just by clicking this button after finishing the last visible task, which is exactly why `newProject.js`/`convertNote.js` seed a "Write Lessons Learned" task as the last item, it forces that task to still be open (blocking this branch) until you've consciously handled lessons capture.

**If tasks remain:** prompts you to pick the next task, then a priority (Highest/High/Medium/Low/Lowest/None), then a mandatory due date, then an optional scheduled date. Rewrites the task line with the `#task/project` tag, priority emoji, due date, and scheduled date. Sets `next_action` in frontmatter to a short "description (date)" string and `estatus: Working`.

### Helper/support Scripts
Genuine internal helpers: called by other scripts or templates, not triggered directly from a menu.

#### pushLessonsToGoal.js
Called via `require()` from `nextAction.js` (when a project transitions to Review) and `failProject.js` (after a fail-time lessons prompt). Not user-triggered directly.

Reads the calling project's `> [!LL]` callout (under `## Actual Outcome`). If the callout is empty, does nothing. If it has content, ensures the callout has a block ID: reuses one if already present (a line like `> ^123456789`), otherwise generates one from the last 9 digits of the current epoch time in seconds and appends it as the callout's last line. It then builds a block-embed link (`![[Project#^blockID]]`, a transclusion, not a plain link, so the actual lesson text renders inline without you needing to open the project) and pushes it into every Goal the project's `goal` property links to. If a target Goal doesn't yet have a `## Lessons Learned` section, one is created at the bottom of the note; if the link's already present, it's skipped (idempotent against accidental re-runs).

**Known gotcha:** Obsidian caches `require()`'d files. If you edit `pushLessonsToGoal.js` (or add a brand new helper script called this way) and the caller doesn't pick up the change, do a full Obsidian reload (not just re-triggering the macro) before assuming the logic is broken, stale cached modules were the cause of a real, confusing debugging session during this script's development.