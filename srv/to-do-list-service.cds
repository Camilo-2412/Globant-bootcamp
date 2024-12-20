using todolist as todo from '../db/schema';


service ToDoService {
    entity Users          as projection on todo.Users;
    entity Projects       as projection on todo.Projects;
    entity Tasks          as projection on todo.Tasks;
    entity Comments       as projection on todo.Comments;
    entity ProjectMembers as projection on todo.ProjectMembers;

    action   changeTaskStatus(taskID : UUID,
                              newStatus : todo.Status)                                                returns Tasks;

    // Función para obtener tareas de un proyecto específico
    function getProjectTasks(projectID : UUID)                                                        returns array of Tasks;
    // Función para contar tareas por estado en un proyecto
    function countTasksByStatus(projectID : UUID, status : String)                                    returns Integer;

    // Acción para agregar un miembro a un proyecto
    action   addProjectMember(projectID : UUID, userID : UUID, role : todo.Role)                      returns {
        message : String;
    };


    action   assignUserToTask(taskID : UUID,
                              userID : UUID)                                                          returns Tasks;

    action   removeMemberFromProject(projectID : UUID,
                                     userID : UUID)                                                   returns {
        message : String;
    };

    action   fetchUserDetails(email : String)                                                         returns UserDetails;


    //Actualizar la fecha de vencimiento de una tarea

    action   updateTaskDueDate(taskID : UUID, newDueDate : DateTime)                                  returns {
        message : String;
    };

    //Agregar varios miembros a un proyecto
    action   addMultipleMembersToProject(projectID : UUID, userIDs : array of UUID, role : todo.Role) returns {
        message : String;
        added : Integer;
    };

    // Completar todas las tareas de un proyecto
    action   completeAllProjectTasks(projectID : UUID)                                                returns {
        message : String;
        updated : Integer;
    };

    //Obtener tareas por prioridad
    function getTasksByPriority(projectID : UUID, priority : todo.Priority)                           returns array of Tasks;
    //Obtener los miembros de un proyecto con sus roles
    function getProjectMembers(projectID : UUID)                                                      returns array of MemberDetails;


    //Calcular el progreso de un proyecto
    function calculateProjectProgress(projectID : UUID)                                               returns {
        progress : Decimal(5, 2);
    };

    type UserDetails {
        BusinessPartnerID : String;
        FirstName         : String;
        LastName          : String;
        Email             : String;
        PhoneNumber       : String;
    }

    type MemberDetails {
        userID : UUID;
        name   : String;
        email  : String;
        role   : todo.Role;
    };
}
