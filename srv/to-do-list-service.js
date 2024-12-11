const cds = require("@sap/cds");

const tasksHandler = require("./handlers/tasksHandler");
const usersHandler = require("./handlers/usersHandler");
const projectsHandler = require("./handlers/projectsHandler");

module.exports = cds.service.impl(async function () {
  tasksHandler(this);
  usersHandler(this);
  projectsHandler(this);
});
