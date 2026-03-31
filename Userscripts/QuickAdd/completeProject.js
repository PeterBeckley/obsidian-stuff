module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const activeFile = app.workspace.getActiveFile();

    if (!activeFile) {
        new Notice("No active file found!");
        return;
    }

    // 1. Prompt for Date
    const dateInput = await quickAddApi.inputPrompt(
        "Completion Date (YYYY-MM-DD)", 
        "Enter a completion date", 
        quickAddApi.date.now("YYYY-MM-DD")
    );

    // 2. Update Properties
    await app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
        if (!frontmatter.tags) {
            frontmatter.tags = ["emtl"];
        } else if (Array.isArray(frontmatter.tags)) {
            if (!frontmatter.tags.includes("emtl")) frontmatter.tags.push("emtl");
        } else {
            if (frontmatter.tags !== "emtl") frontmatter.tags = [frontmatter.tags, "emtl"];
        }

        // Set Archive to true (Simple boolean)
        frontmatter.archive = true;

        // Set Completion Date (Simple string)
        frontmatter.completeDate = dateInput || quickAddApi.date.now("YYYY-MM-DD");
    });

    // 3. Move the file
    const newFolder = "Efforts/PROJECTS/Sleeping"; 
    const newPath = `${newFolder}/${activeFile.name}`;

    // Move the file
    await app.fileManager.renameFile(activeFile, newPath);
    
    //new Notice(`Project archived to ${newFolder}`);
};