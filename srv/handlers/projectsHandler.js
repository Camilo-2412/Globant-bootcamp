module.exports = (srv) => {
  const { Projects, Users,ProjectMembers } = srv.entities;

  srv.before('CREATE', 'Projects', async (req) => {
    // Aquí capturamos la información del proyecto que se está creando
    const project = req.data;
    
    // Asegúrate de que el owner_ID está definido
    if (!project.owner) {
        throw new Error('Owner must be specified for the project');
    }
});

srv.after('CREATE', 'Projects', async (projectCreated, req) => {
    try {
      console.log(projectCreated);
      
        // Añadir el owner como miembro del proyecto
        await INSERT.into(ProjectMembers).entries({
            project_ID: projectCreated.ID,
            user_ID: projectCreated.owner_ID, // Correcto uso de la asociación
            role: 'Admin' // Asumiendo que el owner es Admin por defecto
        });
    } catch (error) {
        console.error('Error adding project owner as member:', error);
        // Aquí podrías decidir cómo manejar el error, quizás revertir la creación del proyecto
    }
});

  srv.after("READ", Projects, async (projects, req) => {
    const ensureArray = Array.isArray(projects) ? projects : [projects];
  
    for (const project of ensureArray) {
      const result = await srv.run(
        SELECT.one`count(*) as total`
          .from("Tasks")
          .where({ project_ID: project.ID })
      );
  
      // Asigna el conteo al proyecto
      project.TaskCount = result?.total || 0;
    }
  });

  // Acción para añadir un miembro a un proyecto
  srv.on('addProjectMember', async (req) => {
    const { projectID, userID, role } = req.data;
    
    // Verifica que ambos, el proyecto y el usuario, existen
    const [project, user] = await Promise.all([
        SELECT.one.from(Projects).where({ID: projectID}),
        SELECT.one.from(Users).where({ID: userID})
    ]);

    if (!project || !user) {
        return req.error(404, `Project or User not found`);
    }

    // Verifica que el usuario no esté ya en el proyecto
    const exists = await SELECT.one.from(ProjectMembers)
        .where({project_ID: projectID, user_ID: userID});

    if (exists) {
        return req.error(409, `User is already a member of this project`);
    }

    // Insertar el nuevo miembro del proyecto
    try {
        await INSERT.into(ProjectMembers).entries({
            project_ID: projectID,
            user_ID: userID,
            role: role || 'Member' // Si no se especifica, asignar 'Member'
        });
        return { message: "Member added successfully" };
    } catch (error) {
        req.error(400, `Failed to add member: ${error.message}`);
    }
});

  
};
