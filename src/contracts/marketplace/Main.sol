pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;
import "../token/YetAnotherEthereumToken.sol";
import "../token/SafeMath.sol";

contract Main {
    using SafeMath for uint256;

    address private _creator;
    YetAnotherEthereumToken private _token;
    uint256 private _productCount;

    struct Manager {
        string name;
        uint reputation;
        address payable account;
        bool exists;
    }

    struct Freelancer {
        string name;
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

    struct Application{
        address payable account;
        uint256 sum;
    }
    
    struct Product{
        string description;
        uint256 development_cost;
        uint256 evaluator_reward;
        uint256 total_sum;
        string expertise;
        address payable manager;
        bool is_done;
        bool exists;
    }
    
    address[] addresses;
    
    mapping(address => Manager) private _managers;
    mapping(address => Freelancer) private _freelancers;
    mapping(address => Evaluator) private _evaluators;
    mapping(uint256 => Product) private _products;
    mapping(uint256 => mapping(address => Funder)) private _fundersPerProduct;
    mapping(uint256 => Application[]) private _freelancersPerProduct;
    mapping(uint256 => Application[]) private _teamPerProduct;
                    
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

    modifier _isFreelancer() {
        require (_freelancers[msg.sender].exists = true);
        _;
    }

    //POST

    function createProduct(string calldata description, uint256 development_cost, uint256 evaluator_reward, string calldata expertise) public _isManager returns(bool){
        _products[_productCount] = Product(description, development_cost, evaluator_reward, development_cost.add(evaluator_reward), expertise, msg.sender, false, true);
        _productCount = _productCount + 1;
        return true;
    }

    //This needs an approve call for the contract from the UI
    function addFunding(string calldata name, uint256 productIndex, uint256 amount) public returns(bool){
        require(_products[productIndex].exists == true);
        require(_products[productIndex].total_sum - amount > 0, "Funding goal exceeded!");

        if(_fundersPerProduct[productIndex][msg.sender].exists == true){
            uint256 currentSum = _fundersPerProduct[productIndex][msg.sender].amount;
            _fundersPerProduct[productIndex][msg.sender] = Funder(name, msg.sender, currentSum.add(amount), true);
        }
        else{
            _fundersPerProduct[productIndex][msg.sender] = Funder(name, msg.sender, amount, true);
        }

        _products[productIndex].total_sum = _products[productIndex].total_sum.sub(amount);

        return _token.transferFrom(msg.sender, address(this), amount);
    }

    function withdrawFunding(uint256 productIndex, uint256 amount) public returns(bool){
        require(_products[productIndex].exists == true);
        require(_fundersPerProduct[productIndex][msg.sender].exists == true);
        require(_fundersPerProduct[productIndex][msg.sender].amount >= amount);
        require(_products[productIndex].total_sum > 0);

        _products[productIndex].total_sum = _products[productIndex].total_sum.add(amount);
        
        return _token.transfer(msg.sender, amount);
    }

    function applyForProduct(uint256 productIndex, uint256 percentage) public _isFreelancer returns(bool){
        require(_products[productIndex].exists == true);
        require(_products[productIndex].total_sum <= 0);

        _freelancersPerProduct[productIndex].push(Application(msg.sender, percentage));

        return true;
    }

    function chooseFreelancer(uint256 productIndex, uint256 applicationIndex) public _isManager returns(bool){
        require(_products[productIndex].exists == true);
        require(_products[productIndex].manager == msg.sender);
        require(_products[productIndex].total_sum <= 0);
        
        _teamPerProduct[productIndex].push(_freelancersPerProduct[productIndex][applicationIndex]);

        return true;
    }

    //GET

    function getBalance(address owner) public view returns(uint256){
        return _token.balanceOf(owner);
    }

    function getProduct(uint256 index) public view returns(Product memory){
        return _products[index];
    }

    function getProductState(uint256 index) public view returns(string memory){
        if(_products[index].total_sum > 0){
            return "Funding";
        }
        else if(_products[index].total_sum == 0){
            return "Development";
        }
        else if(_products[index].is_done == true){
            return "Completed";
        }
        
        return "Created";
    }

    function getFreelancer(address freelancer) public view returns(Freelancer memory){
        return _freelancers[freelancer];
    }

    function getEvaluator(address evaluator) public view returns(Evaluator memory){
        return _evaluators[evaluator];
    }

    //Use this to get the index count -> Do item lookup for each index

    function getProductCount() public view returns(uint256){
        return _productCount;
    }

    function getFreelancersPerProduct(uint256 productIndex) public view returns(Application[] memory){
        return _freelancersPerProduct[productIndex];
    }

    function getTeamPerProduct(uint256 productIndex) public view returns(Application[] memory){
        return _teamPerProduct[productIndex];
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