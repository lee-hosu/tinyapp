function generateRandomString(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

// Return the user object which match the email address
const getUserByEmail = function (email, users) {
  let foundUser = null;

  for (let userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }
  console.log(foundUser);

  return foundUser;
};

const addNewUser = function (email, password, users) {
  const id = generateRandomString(6);
  users[id] = {
    id,
    email,
    password,
  };
  return id;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  addNewUser,
};
