module.exports = async (params) => {
	// Create a new project note. It's a script because in my process at least one key's values are dynamically built from gathered Effort note aliases as well as my predefined 'Areas of Life'. Multiple efforts can be linked to by this project note.
	// Use QuickAdd macro choice to trigger this script. I utilize Nick Milo's ACE folder structure.
    const { app, quickAddApi, obsidian } = params;
    const { Modal, Setting, Notice } = obsidian;
    const fs = require("fs");

    // 1. Basic Inputs
    const projectName = await quickAddApi.inputPrompt("Project Name:");
    if (!projectName) return; 
    const alias = await quickAddApi.inputPrompt("Alias:");
    let rank = await quickAddApi.inputPrompt("Rank (default 3):", "3", "3");
    if (!rank) rank = "3";
    const projectPurpose = await quickAddApi.inputPrompt("Project Purpose:");

    // 2. Build Area Options
    const hardcodedAOLs = ["QoL", "Health", "Fam/Relationships", "Finance", "Career", "Misc"]; 
    let menuOptions = [];
    hardcodedAOLs.forEach(aol => menuOptions.push({ label: aol, value: `${aol}` }));

    const areaFiles = app.vault.getMarkdownFiles().filter(f => f.path.toLowerCase().includes("efforts/areas"));
    for (const file of areaFiles) {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        if (fm?.archive === false || fm?.Archive === false) {
            let displayName = file.basename; 
            if (fm?.aliases) {
                const aliases = Array.isArray(fm.aliases) ? fm.aliases : String(fm.aliases).split(',');
                if (aliases[0]) displayName = String(aliases[0]).trim();
            }
            menuOptions.push({ label: displayName, value: `[[${file.basename}|${displayName}]]` });
        }
    }

    // 3. Build Modal
    const selectedLinks = await new Promise((resolve) => {
        const modal = new (class extends Modal {
            constructor(app) {
                super(app);
                this.selected = new Set();
                this.submitted = false;
            }
            onOpen() {
                const { contentEl } = this;
                contentEl.empty();
                contentEl.createEl("h2", { text: "Select Areas of Effort" });
                
                // Create a container for the list
                const listContainer = contentEl.createDiv();
                listContainer.style.cssText = "max-height: 400px; overflow-y: auto; margin-bottom: 20px; border: 1px solid var(--background-modifier-border); padding: 10px; border-radius: 4px;";

                // Use a DocumentFragment to batch the settings
                const fragment = document.createDocumentFragment();
                
                menuOptions.forEach((opt) => {
                    // Build the setting inside the fragment (off-screen)
                    new Setting(fragment)
                        .setName(opt.label)
                        .addToggle((t) => t.onChange((val) => {
                            if (val) this.selected.add(opt.value);
                            else this.selected.delete(opt.value);
                        }));
                });

                listContainer.appendChild(fragment);

                const footer = contentEl.createDiv({ cls: "modal-button-container" });
                const btn = footer.createEl("button", { text: "OK", cls: "mod-cta" });
                
                btn.onclick = () => {
                    this.submitted = true;
                    resolve(Array.from(this.selected));
                    this.close();
                };
            }
            onClose() { if (!this.submitted) resolve(null); }
        })(app);
        modal.open();
    });

    if (selectedLinks === null) return;

    // 4. Folder & External logic (unchanged)
    const folderOptions = ["Efforts/PROJECTS/Active", "Efforts/PROJECTS/Simmering"];
    const selectedFolder = await quickAddApi.suggester(folderOptions, folderOptions);   
    if (!selectedFolder) return; 

    const useProjectFolder = await quickAddApi.yesNoPrompt(`Create external folder for ${projectName}?`);
    let folderLink = "";
    if (useProjectFolder) {
        const fullPath = `D:\\Projects\\${projectName}`;
        try {
            if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
            folderLink = `[📁 Project Files](<file:///D:/Projects/${projectName}>)`;
        } catch (err) { new Notice(`Error: ${err.message}`); }
    }

    // 5. Generate Content
    const aoeYaml = selectedLinks.length > 0 
        ? "\n" + selectedLinks.map(link => `  - "${link}"`).join("\n")
        : "";

    const fileContent = `---
up:
aliases: ${alias || ""}
aoe:${aoeYaml}
archive: false
collections:
  - "[[Projects]]"
rank: ${rank}
related:
tags:
created: ${new Date().toISOString().split('T')[0]}
---

> [!Note|float-right no-t] Project
> ${folderLink}
# ${projectName}
Project purpose: ${projectPurpose || ""}

## Desired End State
(req'd) What does that look like? How does accomplish the goal or move the needle on the effort?

## Actual Outcome


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
`;

    // 6. Create File
    const vaultPath = `${selectedFolder}/${projectName}.md`;
    if (app.vault.getAbstractFileByPath(vaultPath)) {
        new Notice("A note with this name already exists!");
        return;
    }
    const newFile = await app.vault.create(vaultPath, fileContent);
    await app.workspace.getLeaf().openFile(newFile);
};