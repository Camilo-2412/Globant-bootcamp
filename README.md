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

## Deploy
The application is deployed in BTP in the following [link](https://0297f4f6trial-dev-bootcamp-srv.cfapps.us10-001.hana.ondemand.com) , there have been problems in the consumption of the service. In tests performed with Postman once configured OAuth 2.0 authentication, both the clientId, client secret and url to request the authentication token, requests to the service throw an `error 503 Service Unavailable`, look for solutions through forums and other ways, but can not find the solution, try to re-deploy several times, deleting instances of bd and auth services, but it was not possible and due to time constraints is not possible to find a solution.

On the other hand the remote service that consumes the API BusinessPartner that is hosted in the same application is executed without any problem, in the following URL `https://0297f4f6trial-dev-bootcamp-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my-bupa/Foo`, inside the project is a file with a collection of request in postman where is configured all the request of the project including this external request that if it works, the file is `Bootcamp.postman_collection.json`, I do not know if it is some configuration or a db issue that does not allow to consume the own methods of my application and if the external methods.

## Test local
If you want to test the functionality of this project locally, several .csv files with burned data are provided in the `db/data` folder to simulate a db to test the methods. 
Once you have downloaded or cloned this repo follow the next steps to test the app (preferably from BAS):
1. `npm install` install all the dependencies
2. `cds deploy` display the values in the csv files in an in-memory sqlite database.
3. `cds watch` run the app.
4. inside the project you will find a `test.http` file where you will find several requests to test the different functionalities(sure it is running on port 4004).



Learn more at https://cap.cloud.sap/docs/get-started/.
