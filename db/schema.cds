namespace todolist;

using {
    cuid,
    managed
} from '@sap/cds/common';

// Definición de tipos enumerados
type Status   : String(20) enum {
    Pending;
    InProgress;
    Completed;
}

type Priority : String(20) enum {
    Low;
    Medium;
    High;
}

type Role     : String(20) enum {
    Member;
    Admin;
}

// Definición de la entidad Usuarios
entity Users : cuid, managed {
    name     : String(100)  @mandatory;
    email    : String(100)  @mandatory  @assert.unique;
    password : String(100)  @mandatory;
}

// Definición de la entidad Proyectos
entity Projects : cuid, managed {
    title       : String(100)          @mandatory;
    description : String(500);
    owner       : Association to Users @mandatory; // Cada proyecto tiene un propietario
}

// Entidad para los miembros de un proyecto
entity ProjectMembers : cuid, managed {
    project : Association to Projects @mandatory;
    user    : Association to Users    @mandatory;
    role    : Role default 'Member';

}

// Definición de la entidad Tareas
entity Tasks : cuid, managed {
    title       : String(100)             @mandatory;
    description : String(500);
    dueDate     : DateTime;
    status      : Status default 'Pending';
    priority    : Priority default 'Medium';
    project     : Association to Projects @mandatory;
    assignee    : Association to Users;
}

// Definición de la entidad Comentarios
entity Comments : cuid, managed {
    content   : String(500)          @mandatory;
    task      : Association to Tasks @mandatory;
    user      : Association to Users @mandatory;
    // Agregar una marca de tiempo para ordenar comentarios
    createdAt : Timestamp            @cds.on.insert: $now;
}
