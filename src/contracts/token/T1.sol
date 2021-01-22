// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

contract CrowdFunding {
    address private creator;
    DistributeFunding distributeFunding;
    uint private currentSum;
    bool private moneySent;
    uint constant goalSum = 100000000000;

    struct Contributor {
        string name;
        uint sum;
        address payable account;
        bool exists;
    }
    
    mapping(address => Contributor) contributors;
    
    constructor() {
        creator = msg.sender;
        distributeFunding = new DistributeFunding(address(this));
    }
    
    modifier before() {
        require (currentSum < goalSum, "Target goal of 1000 wei reached");
        _;
    }

    modifier owner() {
        require (creator == msg.sender, "Only the contract owner can transfer!");
        _;
    }
    
    function contribute(string calldata name) payable public before
    {
        require (msg.value > 0 && bytes(name).length > 0);

        if(contributors[msg.sender].exists){
            contributors[msg.sender].sum += msg.value;
        }
        else{
            contributors[msg.sender] = Contributor(name, msg.value, msg.sender, true);
        }
        
        currentSum += msg.value;
    }

    function withdraw(uint amount) public before
    {
        require (contributors[msg.sender].exists && amount <= contributors[msg.sender].sum && amount > 0);
        
        contributors[msg.sender].sum -= amount;

        currentSum -= amount;

        msg.sender.transfer(amount);
    }
    
    function add(string calldata name, uint percentage, address payable account) public owner
    {
        distributeFunding.add(name, percentage, account);
    }
    
    function read() view public returns(string memory, uint){
        require(contributors[msg.sender].exists, "No data available");
        
        return(contributors[msg.sender].name, contributors[msg.sender].sum);
    }

    function getcurrentsum() view public returns(uint){
         return address(this).balance;
    }

    function transfer() public owner{
        require(address(distributeFunding) != address(0x0) && currentSum >= goalSum && moneySent == false);
        
        moneySent = true;
        
        distributeFunding.split{value:address(this).balance}();
    }

    function goalReached() view public returns(string memory){
        if(currentSum < goalSum){
            return("Goal not reached yet!");
        }
        else{
            return("Goal reached!");
        }
    }
    
    function getDistributeFunding() view public returns(address){
        return address(distributeFunding);
    }
}

contract DistributeFunding {
    address private creator;
    uint private totalPercentage;
    uint private index;

    struct Associate {
        string name;
        uint percentage;
        address payable account;
    }
    
    mapping(uint => Associate) associates;
    
    constructor(address contractCreator) {
        creator = contractCreator;
    }

    modifier owner() {
        require (creator == msg.sender);
        _;
    }
    
    function add(string calldata name, uint percentage, address payable account) external owner
    {
        require(percentage > 0 && totalPercentage + percentage <= 100);

        associates[index] = Associate(name, percentage, account);
        totalPercentage += percentage;
        index += 1;
    }

    function split() payable external owner{
        require(totalPercentage == 100, "The number of associates not set!");
        
        uint totalSum = address(this).balance;
        
        for (uint i=0; i < index; i++) {
            
            uint value = (totalSum * associates[i].percentage) / 100;
            
            associates[i].account.transfer(value);
        }
    }
}
