module.exports = (srv) => {
    const { Projects, Users } = srv.entities;

    srv.before('CREATE', Projects, async (req) => {
        const { Owner_ID } = req.data;
        const ownerExists = await srv.run(SELECT.one.from(Users).where({ ID: Owner_ID }));
        if (!ownerExists) {
            req.error(400, 'El propietario del proyecto no existe.');
        }
    });

    srv.after('READ', Projects, async (projects, req) => {
        const ensureArray = Array.isArray(projects) ? projects : [projects];
        for (const project of ensureArray) {
            const taskCount = await srv.run(SELECT.from('Tasks').where({ Project_ID: project.ID }).count());
            project.TaskCount = taskCount;
        }
    });
};