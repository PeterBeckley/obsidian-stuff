module.exports = async (params) => {
    const { app } = params;
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice("No active file found!");
        return;
    }

    // update tag and rank
    await app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
        if (!frontmatter.tags) {
            frontmatter.tags = ["emtl"];
        } else if (Array.isArray(frontmatter.tags)) {
            if (!frontmatter.tags.includes("emtl")) {
                frontmatter.tags.push("emtl");
            }
        } else {
            if (frontmatter.tags !== "emtl") {
                frontmatter.tags = [frontmatter.tags, "emtl"];
            }
        }
        frontmatter.rank = 1;
		if (!frontmatter.archive) {
            frontmatter.archive = true;
        } else if (Array.isArray(frontmatter.archive)) {
            if (!frontmatter.archive.includes(true)) {
                frontmatter.archive.push(true);
            }
        } else {
            if (frontmatter.archive !== true) {
                frontmatter.archive = [frontmatter.archive, true];
            }
        }
        }
    );

    // move to sleeping
    const newFolder = "Efforts/PROJECTS/Sleeping";
    const newPath = `${newFolder}/${activeFile.name}`;

    // Ensure the folder exists first to prevent errors
    if (!(await app.vault.adapter.exists(newFolder))) {
        await app.vault.createFolder(newFolder);
    }
    await app.fileManager.renameFile(activeFile, newPath);
};