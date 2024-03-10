const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID, 'these are the same!'); // Assert that the returned user's ID matches the expected user ID
  });

  it('should return undefined for a non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user, 'user is Not defined'); // Assert that the returned user is undefined
  });
});