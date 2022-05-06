pragma solidity >=0.5.0 <0.9.0;


contract VotePet {

    //model pet candidate
    struct PetCandidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Store Candidates
    // Fetch Candidate => mapping คือการสร้าง array สามารถนำไปทำใน Method
    mapping(uint => PetCandidate) public candidates;

    // Store Candidates Count
    uint public candidatesCount;

    // add Pet Candidate => Frieda Gina Collins and Melissa
    constructor() public {
        addCandidate("Frieda");
        addCandidate("Gina");
        addCandidate("Collins");
        addCandidate("Melissa");
    }

    //add candidate
    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = PetCandidate(candidatesCount, _name, 0); // keep candidate data as PetCandidate struct
    }

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    // vote
    function vote(uint _candidateId) public{
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }

    

    
}