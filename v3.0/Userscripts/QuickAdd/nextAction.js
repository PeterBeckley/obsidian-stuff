module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) return;

    let content = await app.vault.read(activeFile);
    let lines = content.split('\n');
    const projectTag = "#task/project";

    // 1. Cleanup: Mark old active task complete and strip tag, keeping its indent
    lines = lines.map(line => {
        if (line.includes(projectTag) && line.includes('- [ ]')) {
            const indent = line.match(/^\s*/)[0];
            const rest = line.replace('- [ ]', '- [x]')
                             .replace(projectTag, '')
                             .replace(/\s{2,}/g, ' ')
                             .trim();
            return `${indent}${rest} ✅ ${new Date().toISOString().split('T')[0]}`;
        }
        return line;
    });

    // 2. Extract open tasks
    const taskHeaderIndex = lines.findIndex(line => line.includes('## Tasks'));
    if (taskHeaderIndex === -1) return;
    
    const taskRegex = /^(\s*)-\s\[ \]\s(.*)$/;
    let taskObjects = [];
    for (let i = taskHeaderIndex + 1; i < lines.length; i++) {
        if (lines[i].startsWith('#')) break; 
        const match = lines[i].match(taskRegex);
        // Only pick tasks that aren't already marked complete with a checkmark emoji
        if (match && !lines[i].includes('✅')) {
            taskObjects.push({ index: i, indent: match[1], fullText: lines[i], description: match[2].trim() });
        }
    }

    
    if (taskObjects.length === 0) {
        // Save the cleaned-up lines (the last task being checked off)
        await app.vault.modify(activeFile, lines.join('\n'));
        
        await app.fileManager.processFrontMatter(activeFile, (fm) => {
            fm['estatus'] = 'Review';
            delete fm['next_action'];
        });

        const pushLessonsToGoal = require(app.vault.adapter.getBasePath() + "/X/scripts/pushLessonsToGoal.js");
        await pushLessonsToGoal(app, activeFile);
        
        new Notice("No more tasks, flagging for review.");
        return; 
    }

    // 3. Selection: Task -> Priority
    const selectedTask = await quickAddApi.suggester(taskObjects.map(t => t.description), taskObjects);
    if (!selectedTask) return;

    const priorities = [
        { name: "Highest", emoji: "🔺" },
        { name: "High", emoji: "⏫" },
        { name: "Medium", emoji: "🔼" },
        { name: "Low", emoji: "🔽" },
        { name: "Lowest", emoji: "⏬" },
        { name: "None", emoji: "" }
    ];
    const pPick = await quickAddApi.suggester(priorities.map(p => p.name), priorities);
    const pEmoji = pPick ? pPick.emoji : "";

    // 4. Date Logic: Mandatory Due Date
    const dueDate = await quickAddApi.datePrompt("Select Due Date (Mandatory)");
    if (!dueDate) return; 

    // 5. Optional Scheduled Date
    let schedDate = null;
    try {
        schedDate = await quickAddApi.datePrompt("Select Scheduled Date (Optional - Escape to skip)");
    } catch (e) {
        //console.log("Scheduled date skipped.");
    }

    // 6. Formatting the Task Line
    const prioPart = pEmoji ? ` ${pEmoji}` : "";
    const duePart = ` 📅 ${dueDate}`;
    const schedPart = schedDate ? ` ⏳ ${schedDate}` : "";
    
    // Drop any priority or dates the task already had, so they aren't doubled
    const cleanDesc = selectedTask.description
        .replace(projectTag, '')
        .replace(/[🔺⏫🔼🔽⏬]/gu, '')
        .replace(/(📅|⏳|🛫|➕)\s*\d{4}-\d{2}-\d{2}/gu, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    // Keep the task's indent so nested checklists stay nested
    const updatedLine = `${selectedTask.indent}- [ ] ${projectTag} ${cleanDesc}${prioPart}${duePart}${schedPart}`;
    
    lines[selectedTask.index] = updatedLine;

    // 7. Final Sync: This only runs if there WERE tasks to promote
    const displayDate = (schedDate && schedDate < dueDate) ? schedDate : dueDate;
    const yamlString = `${cleanDesc} (${displayDate})`;

    await app.vault.modify(activeFile, lines.join('\n'));
    await app.fileManager.processFrontMatter(activeFile, (fm) => {
        fm['next_action'] = yamlString;
        fm['estatus'] = 'Working';
    });

    //new Notice(`Promoted: ${cleanDesc}`);
};
