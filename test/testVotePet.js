//test dapp with chai
var VotePet = artifacts.require("./VotePet.sol");

contract("VotePet", function(accounts) {
    var Instance;

    // check candidatesCount => candidate number=4
    it("initializes with two candidates", function() {
      return VotePet.deployed().then(function(instance) {
        return instance.candidatesCount();
      }).then(function(count) {
        assert.equal(count, 4);
      });
    });
  

    //check correct value in addCandidate
    it("it initializes the candidates with the correct values", function() {
        return VotePet.deployed().then(function(instance) {
          Instance = instance;
          return Instance.candidates(1);
        }).then(function(candidate) {
          assert.equal(candidate[0], 1, "contains the correct id");
          assert.equal(candidate[1], "Frieda", "contains the correct name");
          assert.equal(candidate[2], 0, "contains the correct votes count");
          return Instance.candidates(2);
        }).then(function(candidate) {
          assert.equal(candidate[0], 2, "contains the correct id");
          assert.equal(candidate[1], "Gina", "contains the correct name");
          assert.equal(candidate[2], 0, "contains the correct votes count");
        });
      });

      //check vote function
      it("voter to cast a vote", function() {
        return VotePet.deployed().then(function(instance) {
          VotePetInstance = instance;
          candidateId = 1;
          return VotePetInstance.vote(candidateId, { from: accounts[0] });
        }).then(function(receipt) {
          assert.equal(receipt.logs.length, 1, "an event was triggered");
          assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
          assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
          return VotePetInstance.voters(accounts[0]);
        }).then(function(voted) {
          assert(voted, "the voter was marked as voted");
          return VotePetInstance.candidates(candidateId);
        }).then(function(candidate) {
          var voteCount = candidate[2];
          assert.equal(voteCount, 1, "increments the candidate's vote count");
        })
      });

});