module.exports = async (params) => {
	/* Convert existing notes into project notes without losing the info they already contain.
	Use QuickAdd macro choice to trigger the script on an open/active note. I utilize Nick Milo's ACE folder structure.*/
	const { app, quickAddApi, obsidian } = params;
    const { Modal, Setting, Notice } = obsidian;
    const fs = require("fs");
	// check for active note and fail if none
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice("No active file found. Open the note to convert first.");
        return;
    }

    // Get projected related inputs
    const alias = await quickAddApi.inputPrompt("Alias:");
    let rank = await quickAddApi.inputPrompt("Rank (default 3):", "3", "3");
    if (!rank) rank = "3";
    const projectPurpose = await quickAddApi.inputPrompt("Project Purpose:");

    // Gather aoe options
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
    
    // Build modal
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
                const listContainer = contentEl.createDiv();
                listContainer.style.cssText = "max-height: 400px; overflow-y: auto; margin-bottom: 20px; border: 1px solid var(--background-modifier-border); padding: 10px; border-radius: 4px;";
                const fragment = document.createDocumentFragment();
                menuOptions.forEach((opt) => {
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
    
    // Project folder logic
    const folderOptions = ["Efforts/PROJECTS/Active", "Efforts/PROJECTS/Simmering"];
    const selectedFolder = await quickAddApi.suggester(folderOptions, folderOptions);   
    if (!selectedFolder) return; 

    const useProjectFolder = await quickAddApi.yesNoPrompt(`Create external folder for ${activeFile.basename}?`);
    let folderLink = "";
    if (useProjectFolder) {
        const fullPath = `D:\\Projects\\${activeFile.basename}`;
        try {
            if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
            folderLink = `[📁 Project Files](<file:///D:/Projects/${activeFile.basename}>)`;
        } catch (err) { new Notice(`Error: ${err.message}`); }
    }
    
    // Update frontmatter
    await app.fileManager.processFrontMatter(activeFile, (fm) => {
        if (alias) {
            if (!fm.aliases) fm.aliases = [];
            else if (!Array.isArray(fm.aliases)) fm.aliases = [fm.aliases];
            if (!fm.aliases.includes(alias)) fm.aliases.push(alias);
        }
        fm.rank = Number(rank);
        fm.archive = false;
        if (!fm.collections) fm.collections = [];
        else if (!Array.isArray(fm.collections)) fm.collections = [fm.collections];
        if (!fm.collections.includes("[[Projects]]")) fm.collections.push("[[Projects]]");
        
        if (selectedLinks.length > 0) {
            if (!fm.aoe) fm.aoe = [];
            else if (!Array.isArray(fm.aoe)) fm.aoe = [fm.aoe];
            selectedLinks.forEach(link => {
                if (!fm.aoe.includes(link)) fm.aoe.push(link);
            });
        }
    });

    // Inject project-related header
const projectBody = `> [!Note|float-right no-t] Project
> ${folderLink}
Project purpose: ${projectPurpose || ""}`;

    // Inject project-related footer
const footerContent = `

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

    await app.vault.process(activeFile, (data) => {
        const yamlEndIndex = data.indexOf("---", 3);
        let contentStart = (data.startsWith("---") && yamlEndIndex > -1) ? yamlEndIndex + 3 : 0;

        const yamlPart = data.substring(0, contentStart);
        let bodyPart = data.substring(contentStart).trim(); // Trim both ends to control spacing

        // Remove the existing first H1 header
        const h1Regex = /^#\s+.+?\n/m;
        bodyPart = bodyPart.replace(h1Regex, "");

        // Construct final file: YAML + Top Injection + Old Body + Footer
        return yamlPart + "\n" + projectBody + "\n" + bodyPart + "\n" + footerContent;
    });

    // Move to appropriate effort folder
    const newPath = `${selectedFolder}/${activeFile.basename}.md`;
    if (activeFile.path !== newPath) {
        const existingFile = app.vault.getAbstractFileByPath(newPath);
        if (existingFile) {
            new Notice("Updated content, but a note with this name already exists in destination.");
        } else {
            await app.fileManager.renameFile(activeFile, newPath);
            new Notice(`Project converted and moved.`);
        }
    }
};