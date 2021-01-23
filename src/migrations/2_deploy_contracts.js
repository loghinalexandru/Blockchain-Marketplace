const Main = artifacts.require("markeplace/Main");
const Token = artifacts.require("../token/YetAnotherEthereumToken");

module.exports = function(deployer) {
  deployer.deploy(Token).then(function(){
    return deployer.deploy(Main, Token.address)});
};
