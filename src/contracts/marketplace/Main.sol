pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;
import "./YetAnotherEthereumToken.sol";

contract Main {
    
    address private _creator;
    YetAnotherEthereumToken private _token;
    uint256 private _productCount;

    enum State { Created, Development, Finished }

    struct Manager {
        string name;
        uint reputation;
        address payable account;
        bool exists;
    }

    struct Freelancer {
        string name;
        uint sum;
        address payable account;
        string expertise;
        bool exists;
    }

    struct Evaluator {
        string name;
        uint sum;
        address payable account;
        string expertise;
        bool exists;
    }

    struct Funder{
        string name;
        address payable account;
        uint256 amount;
        bool exists;
    }
    
    struct Product{
        string description;
        State start;
        uint256 development_cost;
        uint256 evaluator_reward;
        string expertise;
        address payable manager;
        bool exists;
    }
    
    address[] addresses;
    
    mapping(address => Manager) private _managers;
    mapping(address => Freelancer) private _freelancers;
    mapping(address => Evaluator) private _evaluators;
    mapping(uint256 => Product) private _products;
    mapping(uint256 => mapping(address => Funder)) private _fundersPerProduct;
                    
    constructor(address tokenAddress) {
        _creator = msg.sender;
        _token = YetAnotherEthereumToken(tokenAddress);
        _init();
    }
    
    function _init() private{
        _managers[msg.sender] = Manager("Alex", 5, payable(msg.sender), true);
        addresses.push(msg.sender);
    }

    //Modifiers
    
    modifier _isManager() {
        require (_managers[msg.sender].exists = true);
        _;
    }

    //POST

    function createProduct(string calldata description, uint256 development_cost, uint256 evaluator_reward, string calldata expertise) public _isManager returns(bool){
        _products[_productCount] = Product(description, State.Created, development_cost, evaluator_reward, expertise, msg.sender, true);
        _productCount = _productCount + 1;
        return true;
    }

    function addFunding(string calldata name, uint256 productIndex, uint256 amount) public returns(bool){
        require(_products[productIndex].exists == true);

        //TODO: Do a check if funder already exists
        _fundersPerProduct[productIndex][msg.sender] = Funder(name, msg.sender, amount, true);

        return _token.transferFrom(msg.sender, address(this), amount);
    }

    //GET

    function getBalance(address owner) public view returns(uint256){
        return _token.balanceOf(owner);
    }

    function getProduct(uint256 index) public view returns(Product memory){
        return _products[index];
    }

    //Use this to get the index count -> Do item lookup for each index

    function getProductCount() public view returns(uint256){
        return _productCount;
    }
    
    function isManager() public view returns(bool){
        return _managers[msg.sender].exists;
    }

    function isFreelancer() public view returns(bool){
        return _freelancers[msg.sender].exists;
    }

    function isEvaluator() public view returns(bool){
        return _evaluators[msg.sender].exists;
    }
    
}