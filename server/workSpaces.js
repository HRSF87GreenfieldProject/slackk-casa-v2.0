const db = require('./../database/index.js');

// create an object in which to store active users.
const activeWorkSpaces = {};

// Adds an object to activeWorkSpaces for each stored workspace, with id as key.
// Individual workspace objects will track users actively using the workspace.
const generateWorkSpaceMemory = async function () {
  try {
    // fetches all workspaces from database.
    const workspaces = await db.getWorkspaces();
    workspaces.forEach((workspace) => {
      activeWorkSpaces[workspace.id] = {};
    });
  } catch (err) {
    console.error(err);
  }
};

// Updates a user's position in the activeWorkSpace object
const updateWorkSpace = function (ws, newWorkSpaceId) {
  const { currentWorkSpaceId, username } = ws.activeUserData;
  if (currentWorkSpaceId !== null && activeWorkSpaces[currentWorkSpaceId][username]) {
    delete activeWorkSpaces[currentWorkSpaceId][username];
  }
  activeWorkSpaces[newWorkSpaceId][username] = ws;
};

// Creates a new property on activeWorkSpaces for a new workspace
const createNewWorkSpaceObject = function (id) {
  console.log('new workspace object: ', id);
  activeWorkSpaces[id] = {};
};

module.exports = {
  generateWorkSpaceMemory,
  activeWorkSpaces,
  updateWorkSpace,
  createNewWorkSpaceObject,
};
