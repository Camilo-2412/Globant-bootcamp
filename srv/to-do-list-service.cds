using todolist as todo from '../db/schema';


service ToDoService {
    entity Users          as projection on todo.Users;
    entity Projects       as projection on todo.Projects;
    entity Tasks          as projection on todo.Tasks;
    entity Comments       as projection on todo.Comments;
    entity ProjectMembers as projection on todo.ProjectMembers;
    // Acción para marcar una tarea como completada
    action   markTaskCompleted(taskID : UUID)                                    returns Tasks;
    // Función para obtener tareas de un proyecto específico
    function getProjectTasks(projectID : UUID)                                   returns array of Tasks;
    // Función para contar tareas por estado en un proyecto
    function countTasksByStatus(projectID : UUID, status : String)               returns Integer;

    // Acción para agregar un miembro a un proyecto
    action   addProjectMember(projectID : UUID, userID : UUID, role : todo.Role) returns {
        message : String;
    };


    action   assignUserToTask(taskID : UUID,
                              userID : UUID)                                     returns Tasks;

}
