# Globant Bootcamp (TodoList Project)

This repository contains the SAP CAP project developed during the globant bootcamp. It is a simple project that was developed to demonstrate the knowledge of the SAP framework.

This project consists of a task tracking application, where users can create different projects, create tasks and assign users to these tasks, the tasks have compliance status and priorities, the application allows to complete tasks, projects, delete users from projects, count number of tasks, percentage of project compliance and other more features.

It consists of 5 main entities:
* Users
* Tasks
* Projects
* Comments
* ProjectMembers

The application allows to make any CRUD query to these entities. 

Other functions or methods that can be executed are:
Method | Description
---------|----------
fetchUserDetails | Fetch user details from the Business Partner API
changeTaskStatus | Change status of tasks
getProjectTasks  | Obtain tasks from a specific project
countTasksByStatus | Count tasks by status in a project
assignUserToTask | Assign a task to a user 
updateTaskDueDate | Update the due date of a task
getTasksByPriority | Get tasks by priority
removeMemberFromProject | Remove member from a project
addMultipleMembersToProject | Add multiple members to a project
completeAllProjectTasks | Complete all tasks in a project
getProjectMembers | Get the members of a project with their roles
calculateProjectProgress  | Calculate the progress of a project

## Project structure

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide

- bootcamp
  - db 
    - schema.cds
    - schemaRemote.cds
  - srv
    - external
      - API_BUSINESS_PARTNER.cds
      - API_BUSINESS_PARTNER.edmx
    - handlers
      - projectHandler.js
      - tasksHandler.js
      - userHandler.js
    - remote.cds
    - remote.js
    - to-do-list-service.cds
    - to-do-list-service.js
  - mta.yaml
  - package.json

In the `db` folder are the models of the application `schema.cds` are the own models, and `schemaRemote.cds` is the model of the external service that is consumed from BusinessPartner, it is defined only the fields that are desired. In the `srv`folder there are the services and application logic, inside this folder there is the external folder in which there are two files the `API_BUSINESS_PARTNER.cds` and the `API_BUSINESS_PARTNER.edmx`, the cds file defines the entire model of the external service that is to be consumed.

In the `handlers` folder there is the separate logic for each of the entities, where filters, searches and other functionalities are developed.There are also the files that expose the services that in this case are `to-do-list-service.cds` and for the external service `remote.cds`, and the support files `to-do-list-service.j`s and `remote.js`.

Finally, there are the property and configuration files that allow or facilitate the deployment to BTP, such as `mta.yaml` and `package.json`.
## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.
