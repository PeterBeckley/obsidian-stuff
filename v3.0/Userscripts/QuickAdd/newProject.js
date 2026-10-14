module.exports = async (params) => {
    const { app, quickAddApi, obsidian } = params;
    const { Modal, Setting, Notice } = obsidian;
    const fs = require("fs");

    // Starter Inputs
    const projectName = await quickAddApi.inputPrompt("Project Name:");
    if (!projectName) return; 
    const alias = await quickAddApi.inputPrompt("Alias:");
    let rank = await quickAddApi.inputPrompt("Rank:", "3.5", "3.5");
    if (!rank) rank = "3.5";
    const projectPurpose = await quickAddApi.inputPrompt("Project Purpose:");

    // Build Goal Options (Structure Agnostic - Category Based)
    let menuOptions = [];
    const allFiles = app.vault.getMarkdownFiles();

    for (const file of allFiles) {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        if (!fm) continue;

        // Normalize categories safely (All lower-case check)
        let categories = fm.categories || [];
        if (!Array.isArray(categories)) categories = [categories];

        const isGoal = categories.some(cat => 
            String(cat).includes("[[Goals]]")
        );

        // Filter: Must be a Goal and NOT archived
        if (!isGoal || fm.archive === true) continue;

        let displayName = file.basename;

        // Alias handling
        if (fm.aliases) {
            let aliases = Array.isArray(fm.aliases) 
                ? fm.aliases 
                : String(fm.aliases).split(",");

            aliases = aliases.map(a => String(a).trim()).filter(Boolean);
            if (aliases[0]) displayName = aliases[0];
        }

        menuOptions.push({
			label: displayName,
			value: `[[${file.name.replace(/\.md$/, "")}]]` 
		});
    }
    
    menuOptions.sort((a, b) => a.label.localeCompare(b.label));

    // Build Modal
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
                listContainer.style.cssText =
                    "max-height: 400px; overflow-y: auto; margin-bottom: 20px; border: 1px solid var(--background-modifier-border); padding: 10px; border-radius: 4px;";

                const fragment = document.createDocumentFragment();

                menuOptions.forEach((opt) => {
                    new Setting(fragment)
                        .setName(opt.label)
                        .addToggle((t) =>
                            t.onChange((val) => {
                                if (val) this.selected.add(opt.value);
                                else this.selected.delete(opt.value);
                            })
                        );
                });

                listContainer.appendChild(fragment);

                const footer = contentEl.createDiv({ cls: "modal-button-container" });
                const btn = footer.createEl("button", {
                    text: "OK",
                    cls: "mod-cta"
                });

                btn.onclick = () => {
                    this.submitted = true;
                    resolve(Array.from(this.selected));
                    this.close();
                };
            }

            onClose() {
                if (!this.submitted) resolve(null);
            }
        })(app);

        modal.open();
    });

    if (selectedLinks === null) return;

    // Selection for destination folder
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
        } catch (err) {
            new Notice(`Error creating external folder: ${err.message}`);
        }
    }

    // Generate content
    const goalYaml = selectedLinks.length > 0 
		? "\n" + selectedLinks.map(link => {
			// Strip out any path or alias that might have snuck in
			const clean = link.replace(/\[\[.*\/|.*\|/, "[[" );
			return `  - "${clean}"`;
		}).join("\n")
		: "";

    const folderLine = folderLink ? `> ${folderLink}\n` : "";

    const fileContent = `---
up:
aliases: ${alias ? `["${alias}"]` : "[]"}
goal:${goalYaml}
archive: false
categories:
  - "[[Projects]]"
cssclasses: no-inline
estatus: "ToDo"
rank: ${rank}
related:
tags:
created: ${new Date().toISOString().split('T')[0]}
---

> [!effort|float-right] Actions
${folderLine}> **Status:** \`INPUT[UpdateProjectStatus][:estatus]\`
> \`BUTTON[nextAction]\`

**Project purpose:** ${projectPurpose || "Not defined."}

## Desired End State


## Actual Outcome

> [!LL]
> 

## Tasks
- [ ] 
- [ ] Write Lessons Learned

## Notes


## Process/System Changes


## Known Issues


## Milestones


![[Structure.base#Supporting Files]]
`;

    const vaultPath = `${selectedFolder}/${projectName}.md`;

    if (app.vault.getAbstractFileByPath(vaultPath)) {
        new Notice("A note with this name already exists!");
        return;
    }

    const newFile = await app.vault.create(vaultPath, fileContent);
    await app.workspace.getLeaf().openFile(newFile);
};
