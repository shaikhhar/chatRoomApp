const users = [];

const addUser = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return { error: "username/room required" };
  }

  //check for existing user
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  //validate username
  if (existingUser) {
    return { error: "username already exists" };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

addUser({ id: 1, username: "Shekhar", room: "shekc" });
addUser({ id: 2, username: "Rasmita", room: "shekc" });

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter((user) => user.room === room);
  return usersInRoom ? usersInRoom : [];
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
