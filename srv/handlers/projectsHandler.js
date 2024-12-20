module.exports = (srv) => {
  const { Projects, Users, ProjectMembers, Tasks } = srv.entities;

  srv.before("CREATE", "Projects", async (req) => {
    const project = req.data;

    if (!project.owner) {
      throw new Error("Owner must be specified for the project");
    }
  });

  srv.after("CREATE", "Projects", async (projectCreated, req) => {
    try {
      console.log(projectCreated);

      await srv.run(
        INSERT.into(ProjectMembers).entries({
          project_ID: projectCreated.ID,
          user_ID: projectCreated.owner.ID, 
          role: "Admin",
        })
      );
    } catch (error) {
      console.error("Error adding project owner as member:", error);
    }
  });

  srv.after("READ", Projects, async (projects, req) => {
    const ensureArray = Array.isArray(projects) ? projects : [projects];

    for (const project of ensureArray) {
      try {
        const result = await srv.run(
          SELECT.one`count(*) as total`
            .from("Tasks")
            .where({ project_ID: project.ID })
        );

        project.TaskCount = result?.total || 0;
      } catch (error) {
        console.error(`Error counting tasks for project ${project.ID}:`, error);
      }
    }
  });

  // Acción para añadir un miembro a un proyecto
  srv.on("addProjectMember", async (req) => {
    const { projectID, userID, role } = req.data;

    try {
      const [project, user] = await Promise.all([
        srv.run(SELECT.one.from(Projects).where({ ID: projectID })),
        srv.run(SELECT.one.from(Users).where({ ID: userID })),
      ]);

      if (!project || !user) {
        return req.error(404, `Project or User not found`);
      }

      const exists = await srv.run(
        SELECT.one
          .from(ProjectMembers)
          .where({ project_ID: projectID, user_ID: userID })
      );

      if (exists) {
        return req.error(409, `User is already a member of this project`);
      }

      await srv.run(
        INSERT.into(ProjectMembers).entries({
          project_ID: projectID,
          user_ID: userID,
          role: role || "Member",
        })
      );
      return { message: "Member added successfully" };
    } catch (error) {
      req.error(400, `Failed to add member: ${error.message}`);
    }
  });

  // Eliminar miembro de un proyecto
  srv.on("removeMemberFromProject", async (req) => {
    const { projectID, userID } = req.data;

    try {
      const project = await srv.run(
        SELECT.one.from(Projects).where({ ID: projectID })
      );
      if (!project) {
        return req.error(404, `Project not found`);
      }

      const user = await srv.run(SELECT.one.from(Users).where({ ID: userID }));
      if (!user) {
        return req.error(404, `User not found`);
      }

      const membership = await srv.run(
        SELECT.one
          .from(ProjectMembers)
          .where({ project_ID: projectID, user_ID: userID })
      );

      if (!membership) {
        return req.error(404, `User is not a member of this project`);
      }

      await srv.run(
        DELETE.from(ProjectMembers).where({
          project_ID: projectID,
          user_ID: userID,
        })
      );
      return { message: "Member removed from project successfully" };
    } catch (error) {
      req.error(400, `Failed to remove member from project: ${error.message}`);
    }
  });

   // Agregar varios miembros a un proyecto
   srv.on('addMultipleMembersToProject', async (req) => {
    const { projectID, userIDs, role } = req.data;

    try {
      const entries = userIDs.map(userID => ({
        project_ID: projectID,
        user_ID: userID,
        role: role || 'Member',
      }));

      const result = await srv.run(
        INSERT.into(ProjectMembers).entries(entries)
      );

      return {
        message: 'Members added successfully.',
        added: result.length,
      };
    } catch (error) {
      req.error(400, `Failed to add members: ${error.message}`);
    }
  });

   // Completar todas las tareas de un proyecto
   srv.on('completeAllProjectTasks', async (req) => {
    const { projectID } = req.data;

    try {
      const result = await srv.run(
        UPDATE(Tasks)
          .set({ status: 'Completed' })
          .where({ project_ID: projectID, status: { '!=': 'Completed' } })
      );

      return {
        message: 'All tasks completed successfully.',
        updated: result,
      };
    } catch (error) {
      req.error(400, `Failed to complete tasks: ${error.message}`);
    }
  });

  // Obtener los miembros de un proyecto con sus roles
  srv.on('getProjectMembers', async (req) => {
    const { projectID } = req.data;

    try {
      const members = await srv.run(
        SELECT.from(ProjectMembers)
          .where({ project_ID: projectID })
          .columns('user_ID', 'role', { ref: ['user.name'] })
      );

      return members;
    } catch (error) {
      req.error(400, `Failed to get project members: ${error.message}`);
    }
  });

   // Calcular el progreso de un proyecto
   srv.on('calculateProjectProgress', async (req) => {
    const { projectID } = req.data;

    try {
      const totalTasks = await srv.run(
        SELECT.one(['count(*) as count'])
          .from(Tasks)
          .where({ project_ID: projectID })
      );

      const completedTasks = await srv.run(
        SELECT.one(['count(*) as count'])
          .from(Tasks)
          .where({ project_ID: projectID, status: 'Completed' })
      );

      if (totalTasks.count === 0) return { progress: 0 };

      const progress = (completedTasks.count / totalTasks.count) * 100;

      return { progress: progress.toFixed(2) };
    } catch (error) {
      req.error(400, `Failed to calculate project progress: ${error.message}`);
    }
  });

};
