module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const activeFile = app.workspace.getActiveFile();

    if (!activeFile) {
        new Notice("No active file found!");
        return;
    }

    try {
    // Prompt for Date
    const dateInput = await quickAddApi.inputPrompt(
        "Completion Date (YYYY-MM-DD)", 
        "Enter a completion date", 
        quickAddApi.date.now("YYYY-MM-DD")
    );

	// Remove the Meta Bind controls from the body text
	let content = await app.vault.read(activeFile);
	const buttonRegex = /`BUTTON\[nextAction\]`/g;
	const inputRegex = /\*\*Status:\*\*\s*`INPUT\[UpdateProjectStatus\]\[:estatus\]`/g;
	let newContent = content.replace(buttonRegex, "");
	newContent = newContent.replace(inputRegex, "");
	await app.vault.modify(activeFile, newContent);

    // Update Properties
    await app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
            // Handle tags - more concise approach
        if (!frontmatter.tags) {
            frontmatter.tags = ["emtl"];
            } else if (!Array.isArray(frontmatter.tags)) {
                frontmatter.tags = [frontmatter.tags, "emtl"];
            } else if (!frontmatter.tags.includes("emtl")) {
                frontmatter.tags.push("emtl");
        }

        frontmatter.archive = true;
        frontmatter.estatus = "Done";
        frontmatter.completeDate = dateInput || quickAddApi.date.now("YYYY-MM-DD");
        
        // Clean up next_action if it survived the review
        delete frontmatter.next_action;
    });

    // Move the file
    const newFolder = "Efforts/PROJECTS/Sleeping"; 
    const newPath = `${newFolder}/${activeFile.name}`;

    // Ensure the folder exists or the rename will fail
    await app.fileManager.renameFile(activeFile, newPath);
    
    } catch (error) {
        console.error("Error in archiveProject:", error);
        new Notice("Error archiving project. Check console for details.");
    }
};