module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice("No active file found!");
        return;
    }

    const hasLessons = await quickAddApi.yesNoPrompt("Any lessons learned to add before failing this project?");
    let lessonsInput = "";
    if (hasLessons) {
        lessonsInput = await quickAddApi.wideInputPrompt("Lessons Learned:");
    }

	// Remove the Meta Bind controls from the body text, and insert lessons if provided
	let content = await app.vault.read(activeFile);
	const buttonRegex = /`BUTTON\[nextAction\]`/g;
	const inputRegex = /\*\*Status:\*\*\s*`INPUT\[UpdateProjectStatus\]\[:estatus\]`/g;
	let newContent = content.replace(buttonRegex, "");
	newContent = newContent.replace(inputRegex, "");

    if (lessonsInput && lessonsInput.trim().length > 0) {
        const quoted = lessonsInput.trim().split("\n").map(l => "> " + l).join("\n");
        const llLines = newContent.split("\n");
        const llStart = llLines.findIndex(l => /^>\s*\[!LL\]/i.test(l));
        if (llStart !== -1) {
            // Add lessons at the end of the existing callout, keeping any block ID line last
            let llEnd = llStart;
            for (let i = llStart + 1; i < llLines.length; i++) {
                if (/^>/.test(llLines[i])) {
                    llEnd = i;
                } else {
                    break;
                }
            }
            const hasBlockId = /^>\s*\^[\w-]+\s*$/.test(llLines[llEnd]);
            llLines.splice(hasBlockId ? llEnd : llEnd + 1, 0, quoted);
        } else {
            // Older notes have no callout yet: create one under Actual Outcome (or at the bottom)
            const outcomeIdx = llLines.findIndex(l => /^##\s+Actual Outcome/i.test(l));
            const block = ["", "> [!LL]", quoted];
            if (outcomeIdx !== -1) {
                llLines.splice(outcomeIdx + 1, 0, ...block);
            } else {
                llLines.push(...block);
            }
        }
        newContent = llLines.join("\n");
    }

	await app.vault.modify(activeFile, newContent);

    const pushLessonsToGoal = require(app.vault.adapter.getBasePath() + "/X/scripts/pushLessonsToGoal.js");
    await pushLessonsToGoal(app, activeFile);

    // Update properties
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
/* 		if (!frontmatter.archive) {
            frontmatter.archive = true;
        } else if (Array.isArray(frontmatter.archive)) {
            if (!frontmatter.archive.includes(true)) {
                frontmatter.archive.push(true);
            }
        } else {
            if (frontmatter.archive !== true) {
                frontmatter.archive = [frontmatter.archive, true];
            }
        } */
		frontmatter.rank = 1;
		frontmatter.estatus = "Failed";
		delete frontmatter.next_action;
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
