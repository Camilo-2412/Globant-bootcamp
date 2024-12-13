module.exports = (srv) => {
  const { Tasks, Users } = srv.entities;

  srv.before("CREATE".Tasks, async (req) => {
    const { DueDate, Assignee_ID, Status, Title } = req.data;

    if (DueDate < new Date()) {
      req.error(400, "Due date cannot be in the past.");
    }

    if (Title && Title.lenggth > 150) {
      req.error(400, "Title cannot exceed 150 characters.");
    }

    if (Assignee_ID) {
      const userExist = await cds.run(
        SELECT.one.from(Users).where({ ID: Assignee_ID })
      );
      if (!userExist) {
        req.error(400, "Assignee ID does not exist.");
      }
    }

    if (Status && !"Pending") {
      req.error(400, "Status must be one of: Pending, In Progress, Completed.");
    }
  });

  srv.after("READ", Tasks, (tasks) => {
    const today = new Date();
    const ensureArray = Array.isArray(tasks) ? tasks : [tasks];

    for (const task of ensureArray) {
      if (task.DueDate && task.Status !== "Completed") {
        task.isOverdue = new Date(task.DueDate) < today;
      } else {
        task.isOverdue = false;
      }
    }
  });

  srv.after(["CREATE", "UPDATE"], Tasks, async (data, req) => {
    if (data.DueDate && data.Status !== "Completed") {
      const today = new Date();
      if (new Date(data.DueDate) < today) {
        await cds.run(
          UPDATE(Tasks)
            .set({ Status: "Vencida" })
            .where({ ID: data.ID, Status: { "!=": "Completed" } })
        );
      }
    }
  });

  // Marcar una tarea como completada
  srv.on("markTaskCompleted", async (req) => {
    const { taskID } = req.data;
    console.log(!taskID || !taskID.ID);

    // Asegúrate de que taskID es un objeto con la propiedad ID
    if (!taskID) {
      throw new Error("Invalid task ID.");
    }

    await UPDATE(Tasks).set({ Status: "Completed" }).where({ ID: taskID });

    // Recuperar el registro actualizado
    const updatedTask = await SELECT.one.from(Tasks).where({ ID: taskID });

    // Retornar el registro actualizado
    return updatedTask;
  });

  // Obtener tareas de un proyecto específico
  srv.on("getProjectTasks", async (req) => {
    const { projectID } = req.data;
    const tasks = await SELECT.from(Tasks).where({ Project_ID: projectID });
    return tasks;
  });

  // Contar tareas por estado en un proyecto
  srv.on("countTasksByStatus", async (req) => {
    const { projectID, status } = req.data;
    const count = await SELECT.one
      .from(Tasks)
      .where({
        Project_ID: projectID,
        Status: status,
      })
      .columns("count(*) as count");
    return count.count || 0; // Return 0 if no tasks match the criteria
  });

  this.on("assignUserToTask", async (req) => {
    const { taskID, userID } = req.data;

    // Verificar si la tarea existe
    const task = await SELECT.one.from(Tasks).where({ ID: taskID });
    if (!task) {
      return req.error(404, `Task not found`);
    }

    // Verificar si el usuario existe
    const user = await SELECT.one.from(Users).where({ ID: userID });
    if (!user) {
      return req.error(404, `User not found`);
    }

    // Verificar si el usuario es miembro del proyecto al que pertenece la tarea
    const isMember = await SELECT.one
      .from(ProjectMembers)
      .where({ project_ID: task.project_ID, user_ID: userID });

    if (!isMember) {
      return req.error(403, `User is not a member of the project`);
    }

    // Asignar el usuario a la tarea
    try {
      const updatedTask = await UPDATE(Tasks, taskID).with({
        assignee_ID: userID,
      });
      return updatedTask;
    } catch (error) {
      req.error(400, `Failed to assign user to task: ${error.message}`);
    }
  });
};
