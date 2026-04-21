---
up: "[[Project Board]]"
status: 
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
aliases: "{{VALUE:Alias}}"
tags:
  - project
---
%%
```js quickadd
const goalNotes = DataviewAPI.pages("#goal").where(
    (p) => !p.file.path.includes("template") && !p.area.includes("Archive")
).values;
const targetGoal = await this.quickAddApi.suggester(
    goalNotes.map((p) => p.file.name),
    goalNotes
);
const targetGoalFile = app.vault.getAbstractFileByPath(targetGoal.file.path);
let markdownLink = this.app.fileManager.generateMarkdownLink(
    targetGoalFile,
    ""
);
markdownLink = `${markdownLink.slice(0, markdownLink.length - 2)}|${
    targetGoal.aliases
}${markdownLink.slice(markdownLink.length - 2)}`;
return `Goal:: ${markdownLink}`;
```
```js quickadd
const shouldProjectTrackProgress = await this.quickAddApi.yesNoPrompt(`Should this project track progress via markdown tasks?`, 'Enabling this will give the project note a Bar property, similarly to auto-tracked goals. The tasks are auto-tracked, so each time you check one off, you make progress.');
if (shouldProjectTrackProgress) return "(Bar:: `$= dv.view('total-progress-bar', {file: '{{VALUE:ProjectName}}'})`)";
```
%%
# {{VALUE:ProjectName}}
Project purpose: {{VALUE:ProjectPurpose}}
```js quickadd
const useProjectFolder = await this.quickAddApi.yesNoPrompt(`Does this project need a folder?`, `Enabling this will create a link to the Projects folder for support material. **The folder won't exist until you create manually (security)**`);
if (useProjectFolder) return "[Local Folder - {{VALUE:ProjectName}}](<file:///D:/Projects/{{VALUE:ProjectName}}>)";
```

## End State
(req'd) What does that look like? How does it get you closer to the goal?

## Tasks
(req'd) Identify any and all tasks that spring to mind first. ***GET THEM OUT OF YOUR HEAD. DO THIS FIRST -- AS SOON AS YOU CREATE THE PROJECT PAGE SO YOU DON'T MISS THAT FLURRY!!***
 - [ ] 

## Notes

## Process/System Changes
(optional) If the project will create or change processes and/or systems, you need to clearly explain them. What documentation needs writing (Ops Manual, AutoHotKey Script, Outlook Rule, etc.?) *That's part of the project BTW* 

## Known Issues
(optional) Are there foreseeable challenges, issues, or obstacles that must be addressed before the project can start, continue, or complete? Ideally all of these are addressed before start. Even turning project into an 'incubate' until they're addressed is fine for long-term fixes. 

## Milestones
(optional, believe it or not) Are the any obvious or core phase boundaries to help mark progress with this project. I can't imagine most of your projects are big enough to need this, but it's good to highlight at the start.