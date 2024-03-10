const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

const server = require('../express_server.js');

describe("Login and Access Control Test", () => {
  const agent = chai.request.agent("http://localhost:8080");

  // Test case: User should be redirected to /login if they are not logged in
  it('should redirect GET "/" to "/login"', () => {
    return agent
      .get("/")
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo("http://localhost:8080/login");
      });
  });

  // Test case: User should be redirected to /login if they are not logged in
  it('should redirect GET "/urls/new" to "/login"', () => {
    return agent
      .get("/urls/new")
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo("http://localhost:8080/login");
      });
  });

  // Test case: User should see an error message if the URL doesn't exist
  it('should return status code 404 for non-existent URL', () => {
    return agent
      .get("/urls/NOTEXISTS")
      .then((res) => {
        expect(res).to.have.status(404);
      });
  });

  // Test case: User should see an error message if they do not own the URL
  it('should return status code 403 for unauthorized access to "/urls/b2xVn2"', () => {
    return agent
      .get("/urls/b2xVn2")
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });
});