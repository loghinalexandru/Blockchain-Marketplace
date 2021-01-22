pragma solidity ^0.7.3;
import "../token/YetAnotherEthereumToken.sol";

contract Main {
    
    address private _creator;
    YetAnotherEthereumToken private _token;
    
    struct Manager {
        string name;
        uint reputation;
        address payable account;
        string expertise;
    }

    struct Freelancer {
        string name;
        uint sum;
        address payable account;
    }

    struct Evaluator {
        string name;
        uint sum;
        address payable account;
    }

    struct Product{
        string description;
        string status;
        uint development_cost;
        uint evaluator_reward;
        string expertise;
        Manager manager;
    }

    mapping(address => Manager) managers;
    mapping(address => Freelancer) freelancers;
    mapping(address => Evaluator) evaluators;
    mapping(address => Product) products;
    
    constructor() {
        _creator = msg.sender;
        _token = new YetAnotherEthereumToken();
        _init();
    }
    
    function _init() private{
        _token.transfer(address(this), 100);
    }
    
    function getBalance(address payable owner) public view returns(uint256){
        return _token.balanceOf(owner);
    }

    function buyToken(address payable recipient) payable public returns(bool){
        return _token.transfer(recipient, 1);
    }
}