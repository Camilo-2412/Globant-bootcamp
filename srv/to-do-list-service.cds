using todolist as todo from '../db/schema';

service ToDoService {
    entity Users    as projection on todo.Users;
    entity Projects as projection on todo.Projects;
    entity Tasks    as projection on todo.Tasks;
    entity Comments as projection on todo.Comments;
    entity Tags     as projection on todo.Tags;
    entity TaskTags as projection on todo.TaskTags;
    entity ProjectMembers as projection on todo.ProjectMembers;

    // Acción para marcar una tarea como completada
    action   markTaskCompleted(taskID : UUID)                      returns Tasks;
    // Función para obtener tareas de un proyecto específico
    function getProjectTasks(projectID : UUID)                     returns array of Tasks;
    // Acción para añadir un miembro a un proyecto
    action   addProjectMember(projectID : UUID, userID : UUID)     returns ProjectMembers;
    // Función para contar tareas por estado en un proyecto
    function countTasksByStatus(projectID : UUID, status : String) returns Integer;
}



