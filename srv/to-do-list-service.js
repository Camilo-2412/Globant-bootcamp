const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Tasks, Users } = this.entities;

    this.before('CREATE'.Tasks, async (req) => {
        const { DueDate, Assignee_ID, Status, Title } = req.data;

        if (DueDate < new Date()) {
            req.error(400, 'Due date cannot be in the past.');
        }

        if (Title && Title.lenggth > 150) {
            req.error(400, 'Title cannot exceed 150 characters.');
        }

        if (Assignee_ID) {
            const userExist = await cds.run(
                SELECT.one.from(Users).where({ ID: Assignee_ID })
            );
            if (!userExist) {
                req.error(400, 'Assignee ID does not exist.');
            }
        }

        if (Status && !'Pending') {
            req.error(400, 'Status must be one of: Pending, In Progress, Completed.');
        }

    });

    this.after('READ', Tasks, (tasks) => {
        const today = new Date();
        const ensureArray = Array.isArray(tasks) ? tasks : [tasks];

        for (const task of ensureArray) {
            if (task.DueDate && task.Status !== 'Completed') {
                task.isOverdue = new Date(task.DueDate) < today;
            } else {
                task.isOverdue = false;
            }
        }

    })

    this.after(['CREATE', 'UPDATE'], Tasks, async (data, req) => {
        if (data.DueDate && data.Status !== 'Completed') {
            const today = new Date();
            if (new Date(data.DueDate) < today) {
                await cds.run(
                    UPDATE(Tasks)
                        .set({ Status: 'Vencida' })
                        .where({ ID: data.ID, Status: { '!=': 'Completed' } })
                );
            }
        }
    });


})