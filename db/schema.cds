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
    Owner       : Association to Users @assert.target;
}

entity ProjectMembers : cuid {
  Project_ID : Association to Projects @assert.target;
  User_ID    : Association to Users @assert.target;
}

entity Tasks : cuid, managed {
    Title       : String(100) @mandatory;
    Description : String(500);
    DueDate     : DateTime;
    Status      : Status default 'Pending';
    Priority    : Priority default 'Medium';
    Project     : Association to Projects @assert.target;
    Assignee    : Association to Users @assert.target;
    Tags        : Association to many Tags on Tags.ID = $self.Tags.ID;
}

entity Comments : cuid, managed {
    Content   : String(500) @mandatory;
    Task      : Association to Tasks @assert.target;
    User      : Association to Users @assert.target;
}

entity Tags : cuid, managed {
    Name : String(100) @mandatory;
}

entity TaskTags : cuid {
    Task_ID : Association to Tasks;
    Tag_ID  : Association to Tags;
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
