var VotePet = artifacts.require("VotePet");

module.exports = function(deployer) {
  deployer.deploy(VotePet);
};