const getUserByEmail = function(email, database) { 
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return undefined;
};

module.exports= { getUserByEmail }

