const Main = artifacts.require("markeplace/Main");

module.exports = function(deployer) {
  deployer.deploy(Main);
};
