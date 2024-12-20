module.exports = (srv) => {
  const { Tasks, Users, ProjectMembers } = srv.entities;

  srv.before("CREATE", Tasks, async (req) => {
    const { DueDate, Assignee_ID, Status, Title } = req.data;

    try {
      if (DueDate < new Date()) {
        req.error(400, "Due date cannot be in the past.");
      }

      if (Title && Title.length > 150) {
        req.error(400, "Title cannot exceed 150 characters.");
      }

      if (Assignee_ID) {
        const userExist = await srv.run(
          SELECT.one.from(Users).where({ ID: Assignee_ID })
        );
        if (!userExist) {
          req.error(400, "Assignee ID does not exist.");
        }
      }

      if (Status && !["Pending", "InProgress", "Completed"].includes(Status)) {
        req.error(
          400,
          "Status must be one of: Pending, In Progress, Completed."
        );
      }
    } catch (error) {
      console.error("Error in task creation validation:", error);
      req.error(400, `Validation failed: ${error.message}`);
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
    try {
      if (data.DueDate && data.Status !== "Completed") {
        const today = new Date();
        if (new Date(data.DueDate) < today) {
          await srv.run(
            UPDATE(Tasks)
              .set({ Status: "Vencida" })
              .where({ ID: data.ID, Status: { "!=": "Completed" } })
          );
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  });

  // Cambiar estado de las tareas
  srv.on("changeTaskStatus", async (req) => {
    const { taskID, newStatus } = req.data;

    try {
      // Verificar si la tarea existe
      const task = await srv.run(SELECT.one.from(Tasks).where({ ID: taskID }));
      if (!task) {
        return req.error(404, `Task not found`);
      }

      // Verificar si el nuevo estado es válido
      if (!["Pending", "InProgress", "Completed"].includes(newStatus)) {
        return req.error(400, `Invalid status ${newStatus}`);
      }

      // Cambiar el estado de la tarea
      const updatedTask = await srv.run(
        UPDATE(Tasks, taskID).with({
          status: newStatus,
        })
      );
      return updatedTask;
    } catch (error) {
      req.error(400, `Failed to change task status: ${error.message}`);
    }
  });

  // Obtener tareas de un proyecto específico
  srv.on("getProjectTasks", async (req) => {
    try {
      const { projectID } = req.data;
      console.log(projectID);

      const tasks = await srv.run(
        SELECT.from(Tasks).where({ project_ID: projectID })
      );
      return tasks;
    } catch (error) {
      req.error(400, `Failed to get tasks: ${error.message}`);
    }
  });

  // Contar tareas por estado en un proyecto
  srv.on("countTasksByStatus", async (req) => {
    try {
      const { projectID, status } = req.data;
      const count = await srv.run(
        SELECT.one
          .from(Tasks)
          .where({
            project_ID: projectID,
            status: status,
          })
          .columns("count(*) as count")
      );
      return count.count || 0; // Return 0 if no tasks match the criteria
    } catch (error) {
      req.error(400, `Failed to count tasks: ${error.message}`);
    }
  });

  srv.on("assignUserToTask", async (req) => {
    try {
      const { taskID, userID } = req.data;

      // Verificar si la tarea existe
      const task = await srv.run(SELECT.one.from(Tasks).where({ ID: taskID }));
      if (!task) {
        return req.error(404, `Task not found`);
      }

      // Verificar si el usuario existe
      const user = await srv.run(SELECT.one.from(Users).where({ ID: userID }));
      if (!user) {
        return req.error(404, `User not found`);
      }

      // Verificar si el usuario es miembro del proyecto al que pertenece la tarea
      const isMember = await srv.run(
        SELECT.one
          .from(ProjectMembers)
          .where({ project_ID: task.project_ID, user_ID: userID })
      );

      if (!isMember) {
        return req.error(403, `User is not a member of the project`);
      }

      // Asignar el usuario a la tarea
      const updatedTask = await srv.run(
        UPDATE(Tasks, taskID).with({
          assignee_ID: userID,
        })
      );
      return updatedTask;
    } catch (error) {
      req.error(400, `Failed to assign user to task: ${error.message}`);
    }
  });

  // Actualizar la fecha de vencimiento de una tarea
  srv.on("updateTaskDueDate", async (req) => {
    const { taskID, newDueDate } = req.data;

    try {
      if (newDueDate < new Date()) {
        return req.error(400, "Due date cannot be in the past.");
      }

      const result = await srv.run(
        UPDATE(Tasks).set({ dueDate: newDueDate }).where({ ID: taskID })
      );

      if (result === 0) {
        return req.error(404, "Task not found.");
      }

      return { message: "Task due date updated successfully." };
    } catch (error) {
      req.error(400, `Failed to update task due date: ${error.message}`);
    }
  });

  // Obtener tareas por prioridad
  srv.on("getTasksByPriority", async (req) => {
    const { projectID, priority } = req.data;

    try {
      const tasks = await srv.run(
        SELECT.from(Tasks).where({ project_ID: projectID, priority: priority })
      );

      return tasks;
    } catch (error) {
      req.error(400, `Failed to get tasks: ${error.message}`);
    }
  });
};
