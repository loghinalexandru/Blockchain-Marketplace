// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;
import "./../token/YetAnotherEthereumToken.sol";

contract Main {
    
    address private _creator;
    YetAnotherEthereumToken private _token;

    enum State { Created, Development, Finished }

    struct Manager {
        string name;
        uint reputation;
        address payable account;
    }

    struct Freelancer {
        string name;
        uint sum;
        address payable account;
        string expertise;
    }

    struct Evaluator {
        string name;
        uint sum;
        address payable account;
        string expertise;
    }

    struct Product{
        string description;
        State state;
        uint development_cost;
        uint evaluator_reward;
        string expertise;
        Manager manager;
    }
    
    struct Funder{
        string name;
        address payable account;
    }

    address[] addresses;
    
    Manager[] managers;
    Freelancer[] freelancers;
    Evaluator[] evaluators;
    Product[] products;
    Funder[] funders;
    
    constructor() {
        _creator = msg.sender;
        _token = new YetAnotherEthereumToken();
        _init();
    }
    
    function _init() private{
        _token.transfer(0xF4cF0EE72F54C25f7cD7a1d55aCB6949074963bc, 100);
        managers.push(Manager("Alex", 5, 0xF4cF0EE72F54C25f7cD7a1d55aCB6949074963bc));
        
        _token.transfer(0xDcDeA3CB04DdC748f332ACDEFAf6E19A963FDb82, 100);
        funders.push(Funder("Alex", 0xDcDeA3CB04DdC748f332ACDEFAf6E19A963FDb82));
        
        addresses.push(0xF4cF0EE72F54C25f7cD7a1d55aCB6949074963bc);
        addresses.push(0xDcDeA3CB04DdC748f332ACDEFAf6E19A963FDb82);
    }
    
    function getBalance(address payable owner) public view returns(uint256){
        return _token.balanceOf(owner);
    }

    function buyToken(address payable recipient) payable public returns(bool){
        return _token.transfer(recipient, 1);
    }
}