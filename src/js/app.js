App = {
  web3Provider: null,
  contracts: {},
  hasVoted: false,

  init: async function() {
    //init web3
    return await App.initWeb3();
  },

  initWeb3: async function() {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });;
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('VotePet.json', function(instance) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var VotePetArtifact = instance;
      App.contracts.VotePet = TruffleContract(VotePetArtifact);
    
      // Set the provider for our contract
      App.contracts.VotePet.setProvider(App.web3Provider);

      return App.render();
    });

    
  },

   // Listen for events emitted from the contract => voted event to check that the voter was marked as voted
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
      });
    });
  },

  // render page app
  render: async function(){
    var votePetInstance;
    var loader = $("#loader");
    var content = $("#content");
    var petCandidate = $('#petCandidate');
    
    loader.show(); // loader tag show for loading data
    content.hide();
    petCandidate.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        console.log(account)
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load pets.
    App.contracts.VotePet.deployed().then(function(instance) {
      votePetInstance = instance;
      return votePetInstance.candidatesCount();
    }).then((candidatesCount)=>{ //Call candidateCount to load candidate data
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      //load pet candidate data in table
      for (var i = 1; i <= candidatesCount; i++) {
        votePetInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          
        });
      }
      //load pet card
      $.getJSON('../pets.json', function(data) {
        var petsRow = $('#petsRow');
        var petTemplate = $('#petTemplate');
        for (i = 0; i < data.length; i ++) {
          petTemplate.find('.panel-title').text(data[i].name);
          petTemplate.find('img').attr('src', data[i].picture);
          petTemplate.find('.pet-breed').text(data[i].breed);
          petTemplate.find('.pet-age').text(data[i].age);
          petTemplate.find('.pet-location').text(data[i].location);
          petTemplate.find('.btn-vote').attr('data-id', data[i].id+1);
          
          // Render pet card for vote
          petsRow.append(petTemplate.html());
        }
      })
      
      //check that voter ever vote 
      return votePetInstance.voters(App.account)

      }).then(function(hasVoted){
        content.show();
        loader.hide();

        // if ever ,Do not allow a user to vote
        if(hasVoted) {
          $('#petCandidate').hide();
          $('#thankyou').show();
        }
        else{
          $('#petCandidate').show();
          $('#thankyou').hide();
        }
        
        return App.bindEvents();
   
      })
    
  },

  // vote event with button
  bindEvents: function() {
    //if click vote , happen haddleVote event
    $(document).on('click', '.btn-vote', App.handleVote);
  },

  //vote event
  handleVote: function(event) {
    event.preventDefault();

    //petId for query candidate and increase voteCount
    var petId = parseInt($(event.target).data('id'));
    var VotePetInstance;

    //disabled button , protect double vote event
    $.getJSON('../pets.json', function(data) {
    for (i = 0; i < data.length; i++) {
        $('.panel-pet').eq(i).find('button').text('Voting').attr('disabled', true);
    }
    })

    App.contracts.VotePet.deployed().then(function(instance) {
      VotePetInstance = instance;
      // Execute vote as a transaction by sending account
      return VotePetInstance.vote(petId, {from: App.account}); //accout=msg.sender
    }).then(function(result) {

      //update page
      $("#content").hide();
      $("#loader").show();
      $('#petCandidate').hide();
      $('#thankyou').show();
      // Reload when a new vote is recorded
      App.render();
    }).catch(function(err) {
      console.log(err.message); //error
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
