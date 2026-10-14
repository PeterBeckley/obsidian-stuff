module.exports = async (params) => {
    const { app, quickAddApi, obsidian } = params;
    const { Modal, Setting, Notice } = obsidian;
    const fs = require("fs");

    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice("No active file found. Open the note to convert first.");
        return;
    }

    const targetType = await quickAddApi.suggester(["AOR", "MOC", "Project", "Intel"], ["AOR", "MOC", "Project", "Intel"]);
    if (!targetType) return;

    if (targetType === "Intel") {
        const statusOrder = ["Working", "Paused", "ToDo", "Review", "Done", "Failed"];
        const rankOf = (status) => {
            if (!status) return statusOrder.length + 1; // blank estatus sorts last
            const idx = statusOrder.indexOf(status);
            return idx === -1 ? statusOrder.length : idx; // unrecognized status sorts just before blanks
        };

        const projectEntries = app.vault.getMarkdownFiles()
            .filter(x => x.path.startsWith("Efforts/PROJECTS/") && !x.path.startsWith("Efforts/PROJECTS/Sleeping/"))
            .map(f => {
                const fm = app.metadataCache.getFileCache(f)?.frontmatter;
                return { basename: f.basename, estatus: fm?.estatus || "" };
            })
            .sort((a, b) => rankOf(a.estatus) - rankOf(b.estatus));

        const displayLabels = projectEntries.map(e => e.estatus ? `${e.basename} (${e.estatus})` : e.basename);
        const basenames = projectEntries.map(e => e.basename);
        const p = await quickAddApi.suggester(displayLabels, basenames);
        if (!p) return;

        await app.fileManager.processFrontMatter(activeFile, fm => {
            fm.categories = [...new Set([...(fm.categories || []), "[[Intels]]"])];
            fm.project = [...new Set([...(fm.project || []), `[[${p}]]`])];
        });

        // Move to appropriate effort folder
        const newPath = `Atlas/INTELS/${activeFile.basename}.md`;
        if (activeFile.path !== newPath) {
            const existingFile = app.vault.getAbstractFileByPath(newPath);
            if (existingFile) {
                new Notice("Updated content, but a note with this name already exists in destination.");
            } else {
                await app.fileManager.renameFile(activeFile, newPath);
                new Notice(`Project converted and moved.`);
            }
        }
        return;
    }


    const alias = await quickAddApi.inputPrompt("Alias:");

    if (targetType === "Project") {
        let rank = await quickAddApi.inputPrompt("Rank (default 3.5):", "3.5", "3.5");
        if (!rank) rank = "3.5";
        const projectPurpose = await quickAddApi.inputPrompt("Project Purpose:");

        let menuOptions = [];
        const allFiles = app.vault.getMarkdownFiles();

        for (const file of allFiles) {
            const fm = app.metadataCache.getFileCache(file)?.frontmatter;
            if (!fm) continue;

            let categories = fm.categories || [];
            if (!Array.isArray(categories)) categories = [categories];

            const isGoal = categories.some(cat => String(cat).includes("[[Goals]]"));
            if (!isGoal || fm.archive === true) continue;

            let displayName = file.basename;
            if (fm.aliases) {
                let aliases = Array.isArray(fm.aliases) ? fm.aliases : String(fm.aliases).split(",");
                aliases = aliases.map(a => String(a).trim()).filter(Boolean);
                if (aliases[0]) displayName = aliases[0];
            }

            menuOptions.push({
                label: displayName,
                value: `[[${file.name.replace(/\.md$/, "")}]]`
            });
        }

        menuOptions.sort((a, b) => a.label.localeCompare(b.label));

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
                    contentEl.createEl("h2", { text: "Select Related Goals" });
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

        await app.fileManager.processFrontMatter(activeFile, (fm) => {
            if (alias) {
                if (!fm.aliases) fm.aliases = [];
                else if (!Array.isArray(fm.aliases)) fm.aliases = [fm.aliases];
                if (!fm.aliases.includes(alias)) fm.aliases.push(alias);
            }
            fm.rank = Number(rank);
            fm.archive = false;
            fm.estatus = "ToDo";
            if (!fm.categories) fm.categories = [];
            else if (!Array.isArray(fm.categories)) fm.categories = [fm.categories];
            if (!fm.categories.includes("[[Projects]]")) fm.categories.push("[[Projects]]");

            if (selectedLinks.length > 0) {
                if (!fm.goal) fm.goal = [];
                else if (!Array.isArray(fm.goal)) fm.goal = [fm.goal];
                selectedLinks.forEach(link => {
                    const clean = link.replace(/\[\[.*\/|.*\|/, "[[");
                    if (!fm.goal.includes(clean)) fm.goal.push(clean);
                });
            }
        });

        const folderLine = folderLink ? `> ${folderLink}\n` : "";
        const projectBody = `\n> [!effort|float-right] Actions\n${folderLine}> **Status:** \`INPUT[UpdateProjectStatus][:estatus]\`\n> \`BUTTON[nextAction]\`\n\n**Project purpose:** ${projectPurpose || ""}`;
        const footerContent = `\n\n## Desired End State\n(req'd) What does that look like? How does accomplish the goal or move the needle on the effort?\n\n## Actual Outcome\n\n> [!LL]\n> \n\n## Tasks\n\n - [ ] \n - [ ] Write Lessons Learned\n\n## Notes\n\n\n## Process/System Changes\n(optional) If the project will create or change processes and/or systems, you need to clearly explain them. What documentation needs writing (Ops Manual, AutoHotKey Script, Outlook Rule, etc.?) *That's part of the project BTW* \n\n## Known Issues\n(optional) Are there foreseeable challenges, issues, or obstacles that must be addressed before the project can start, continue, or complete? Ideally all of these are addressed before start. Even turning project into an 'incubate' until they're addressed is fine for long-term fixes. \n\n\n## Milestones\n(optional, believe it or not) Are the any obvious or core phase boundaries to help mark progress with this project. I can't imagine most of your projects are big enough to need this, but it's good to highlight at the start.\n\n\n![[Structure.base#Supporting Files]]\n`;

        await app.vault.process(activeFile, (data) => {
            const yamlEndIndex = data.indexOf("---", 3);
            let contentStart = (data.startsWith("---") && yamlEndIndex > -1) ? yamlEndIndex + 3 : 0;
            const yamlPart = data.substring(0, contentStart);
            let bodyPart = data.substring(contentStart).trim();
            const h1Regex = /^#\s+.+?\n/m;
            bodyPart = bodyPart.replace(h1Regex, "");
            return yamlPart + "\n" + projectBody + "\n" + bodyPart + "\n" + footerContent;
        });

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
    } else {
        await app.fileManager.processFrontMatter(activeFile, (fm) => {
            if (alias) {
                if (!fm.aliases) fm.aliases = [];
                else if (!Array.isArray(fm.aliases)) fm.aliases = [fm.aliases];
                if (!fm.aliases.includes(alias)) fm.aliases.push(alias);
            }
            fm.archive = false;
            
            if (!fm.categories) fm.categories = [];
            else if (!Array.isArray(fm.categories)) fm.categories = [fm.categories];
            const catStr = targetType === "AOR" ? '"[[AORs]]"' : '"[[Maps]]"';
            if (!fm.categories.includes(catStr) && !fm.categories.includes(catStr.replace(/"/g, ''))) {
                 fm.categories.push(catStr.replace(/"/g, ''));
            }

            if (targetType === "AOR") {
                fm.estatus = "Active";
            }
        });

        const aorBody = `\n> [!atlas|float-right] Actions\n> **Status:** \`INPUT[AORStatus][:estatus]\`\n\n## Efforts for this AOR\n\n![[Structure.base#AOR Genealogy]]\n\n## Role & standards\n\n## Intel\n`;
        const mocBody = `\n## Mentions of this MOC\n\n![[Structure.base#Incoming Links]]\n\n## Summary\n`;

        await app.vault.process(activeFile, (data) => {
            const yamlEndIndex = data.indexOf("---", 3);
            let contentStart = (data.startsWith("---") && yamlEndIndex > -1) ? yamlEndIndex + 3 : 0;
            const yamlPart = data.substring(0, contentStart);
            let bodyPart = data.substring(contentStart).trim();
            const h1Regex = /^#\s+.+?\n/m;
            bodyPart = bodyPart.replace(h1Regex, "");

            const injection = targetType === "AOR" ? aorBody : mocBody;
            return yamlPart + "\n" + injection + "\n" + bodyPart;
        });

        let newBasename = activeFile.basename;
        if (!newBasename.endsWith(` ${targetType}`)) {
            newBasename = `${newBasename} ${targetType}`;
        }
        
        const newPath = activeFile.parent.path === "/" ? `${newBasename}.md` : `${activeFile.parent.path}/${newBasename}.md`;
        
        if (activeFile.path !== newPath) {
            const existingFile = app.vault.getAbstractFileByPath(newPath);
            if (existingFile) {
                new Notice(`Updated content, but a note named ${newBasename} already exists.`);
            } else {
                await app.fileManager.renameFile(activeFile, newPath);
            }
        }

        //new Notice(`${targetType} converted.`);
    }
};
