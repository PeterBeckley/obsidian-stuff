// Find all linked projects
const goalPage = dv.page(input.file);
const projects = goalPage.file.inlinks.where((p) => {
    const mp = dv.page(p.path);
    return mp.tags?.includes("project");
});

const totalGoalTasks = goalPage.file.tasks.where((t) => t.checked === false && t.fullyCompleted === false || t.checked === true && t.fullyCompleted === true).length;

let totalProjectTasks = 0;
projects.values.reduce((acc, p) => {
    const mp = dv.page(p.path);
    const tasks = mp.file.tasks;

    totalProjectTasks += tasks.where((t) => t.checked === false && t.fullyCompleted === false || t.checked === true && t.fullyCompleted === true).length;
    return mp.file.tasks.length;
}, 0);

dv.span(totalGoalTasks + totalProjectTasks);