namespace todolist;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Users : cuid, managed {
    Name     : String(100) @mandatory;
    Email    : String(100) @mandatory;
    password : String(100) @mandatory;
}

entity Projects : cuid, managed {
    Title       : String(100) @mandatory;
    Description : String(500);
    Owner       : Association to Users;
}

entity Tasks : cuid, managed {
    Title       : String(100) @mandatory;
    Description : String(500);
    DueDate     : DateTime;
    Status      : Status default 'Pending';
    Priority    : Priority default 'Medium';
    Project     : Association to Projects;
    Assignee    : Association to Users;
}

entity Comments : cuid, managed {
    Content   : String(500) @mandatory;
    CreatedAt : DateTime    @default: current_timestamp;
    Task      : Association to Tasks;
    User      : Association to Users;
}

entity Tags : cuid, managed {
    Name : String(100) @mandatory;
}

type Status   : String(200) enum {
    Pending;
    InProgress;
    Completed;
}

type Priority : String(200) enum {
    Low;
    Medium;
    High;
}
