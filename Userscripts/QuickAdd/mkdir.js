module.exports = async (params) => {
    const { quickAddApi, app } = params;
    const fs = require("fs");
    const path = require("path");
    // collect project params
    const projectName = await quickAddApi.inputPrompt("Project Name:");
    if (!projectName) return; 
    const alias = await quickAddApi.inputPrompt("Alias:");
    const rank = await quickAddApi.inputPrompt("Rank (default 3):", "3", "3");
    const projectPurpose = await quickAddApi.inputPrompt("Project Purpose:");

    // choose if it's active or simmering, I'll never create a sleeping project
    const folderOptions = ["Efforts/PROJECTS/Active", "Efforts/PROJECTS/Simmering"];
    const selectedFolder = await quickAddApi.suggester(folderOptions, folderOptions);   
    if (!selectedFolder) return; // Exit gracefully on abort

    // ask about project folder and make it if needed
    const useProjectFolder = await quickAddApi.yesNoPrompt(
        `Does this project need a folder?`, 
        `This will create D:\\Projects\\${projectName}`
    );
    let folderLink = "";
    if (useProjectFolder) {
        const baseDir = "D:\\Projects\\";
        const fullPath = path.join(baseDir, projectName);        
        try {
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                new Notice(`Created external folder: ${fullPath}`);
            }
            folderLink = `[📁 Project Files](<file:///D:/Projects/${projectName}>)`;
        } catch (err) {
            new Notice(`Error creating external folder: ${err.message}`);
        }
    }
    // build the note
    const date = new Date().toISOString().split('T')[0]; 
    const fileContent = `---
up:
aliases: ${alias || ""}
collections:
  - "[[Projects]]"
rank: ${rank}
related:
tags:
created: ${date}
---

> [!Note|float-right no-t] Project
> ${folderLink}
# ${projectName}
Project purpose: ${projectPurpose || ""}
`;
    // write the note
    const vaultPath = `${selectedFolder}/${projectName}.md`;
    try {
        // Check if file exists inside vault first to avoid overwriting
        if (app.vault.getAbstractFileByPath(vaultPath)) {
            new Notice("A note with this name already exists in that folder!");
            return;
        }
        await app.vault.create(vaultPath, fileContent);
        const newFile = app.vault.getAbstractFileByPath(vaultPath);
        await app.workspace.getLeaf().openFile(newFile);
    } catch (e) {
        new Notice(`Vault Error: ${e.message}`);
    }
};
