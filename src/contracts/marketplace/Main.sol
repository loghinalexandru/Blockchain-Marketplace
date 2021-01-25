pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;
import "../token/YetAnotherEthereumToken.sol";
import "../token/SafeMath.sol";

contract Main {
    using SafeMath for uint256;

    //Events
    event RequiresEvaluation(uint256 productIndex);
    event NotifyManager(uint256 productIndex, address freelancer);
    event ProductAdded(uint256 productIndex);
    event ProductDeleted(uint256 productIndex);

    address private _creator;
    YetAnotherEthereumToken private _token;
    uint256 private _productCount;

    enum State {Funding, Teaming, Development, ManagerApproval, Evaluating, Done}

    struct Manager {
        string name;
        uint reputation;
        address payable account;
        bool exists;
    }

    struct Freelancer {
        string name;
        uint reputation;
        address payable account;
        string expertise;
        bool exists;
    }

    struct Evaluator {
        string name;
        uint reputation;
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
        bool approved;
    }
    
    struct Product{
        string description;
        State state;
        uint256 development_cost;
        uint256 evaluator_reward;
        uint256 remaining_funding;
        uint256 remaining_development_funding;
        string expertise;
        address payable manager;
        address payable evaluator;
        address payable[] funders;
        bool is_done;
        bool exists;
    }
    
    mapping(address => Manager) private _managers;
    mapping(address => Freelancer) private _freelancers;
    mapping(address => Evaluator) private _evaluators;
    mapping(uint256 => Product) private _products;
    mapping(uint256 => mapping(address => Funder)) private _fundersPerProduct;
    mapping(uint256 => Application[]) private _freelancersPerProduct;
    mapping(uint256 => Application[]) private _teamPerProduct;
    mapping(uint256 => mapping(address => bool)) private _applicationPerFreelancer;

    constructor(address tokenAddress) {
        _creator = msg.sender;
        _token = YetAnotherEthereumToken(tokenAddress);
        _init();
    }
    
    function _init() private{
        _managers[msg.sender] = Manager("Alex", 5, payable(msg.sender), true);
    }

    //Modifiers
    modifier _productExists(uint256 productIndex){
        require(_products[productIndex].exists == true, "Product with specified index does not exist!");
        _;
    }

    modifier _applicationExists(uint256 productIndex, uint256 applicationIndex){
        require(_freelancersPerProduct[productIndex][applicationIndex].account != address(0), "Freelancer application with specified index does not exist!");
        _;
    }

    modifier _noRole(){
        require(_managers[msg.sender].exists == false, "User is already manager!");
        require(_freelancers[msg.sender].exists == false, "User is already freelancer!");
        require(_evaluators[msg.sender].exists == false, "User is already evaluator!");
        _;
    }

    modifier _isInTeam(uint256 productIndex){
        bool isInTeam = false;
        for (uint i = 0; i < _teamPerProduct[productIndex].length; i++) {
            if(_teamPerProduct[productIndex][i].account == msg.sender){
                isInTeam = true;
                break;
            }
        }

        require(isInTeam, "User is not in the product development team!");

        _;
    }
    
    modifier _isManager() {
        require (_managers[msg.sender].exists == true);
        _;
    }

    modifier _isFreelancer() {
        require (_freelancers[msg.sender].exists == true);
        _;
    }

    modifier _isEvaluator() {
        require (_evaluators[msg.sender].exists == true);
        _;
    }

    //Helpers
    function decreaseReputation(uint currentReputation) private pure returns(uint){
        if(currentReputation == 1){
            return 1;
        }
        return currentReputation - 1;
    }

    function increaseReputation(uint currentReputation) private pure returns(uint){
        if(currentReputation == 10){
            return 10;
        }
        return currentReputation + 1;
    }

    function distributeFunds(uint256 productIndex) private returns(bool){

        for (uint i = 0; i < _teamPerProduct[productIndex].length; i++) {
            Freelancer memory freelancer = _freelancers[_teamPerProduct[productIndex][i].account];
            _token.transfer(freelancer.account, _teamPerProduct[productIndex][i].sum);
        }

        if(_products[productIndex].state == State.Evaluating){
            _token.transfer(_products[productIndex].evaluator, _products[productIndex].evaluator_reward);
        }
        else if(_products[productIndex].state == State.ManagerApproval){
            _token.transfer(_products[productIndex].manager, _products[productIndex].evaluator_reward);
        }

        return true;
    }

    function changeProductState(uint256 productIndex) private {

        if(_products[productIndex].remaining_funding == 0 && _products[productIndex].remaining_development_funding > 0 && _products[productIndex].state == State.Funding){
            _products[productIndex].state = State.Teaming;
        }
        else if(_products[productIndex].remaining_development_funding == 0 && _products[productIndex].state == State.Teaming && _products[productIndex].evaluator != address(0)){
            _products[productIndex].state = State.Development;
        }
    }
    //POST
    function createProduct(string calldata description, uint256 development_cost, uint256 evaluator_reward, string calldata expertise) public _isManager returns(bool){
        _products[_productCount] = Product(description, State.Funding, development_cost, evaluator_reward, development_cost.add(evaluator_reward), development_cost, expertise, msg.sender, address(0), new address payable[](0), false, true);
        emit ProductAdded(_productCount);
        _productCount = _productCount + 1;
        return true;
    }

    function deleteProduct(uint256 productIndex) public _isManager returns(bool){
        require(_products[productIndex].state == State.Funding);
        require(_products[productIndex].manager == msg.sender);

        for(uint i = 0; i < _products[productIndex].funders.length; i++) {
            if(_fundersPerProduct[productIndex][_products[productIndex].funders[i]].amount > 0){
                _token.transfer(_fundersPerProduct[productIndex][_products[productIndex].funders[i]].account, _fundersPerProduct[productIndex][_products[productIndex].funders[i]].amount);
            }
        }

        _products[productIndex].exists = false;
        emit ProductDeleted(productIndex);

        return true;
    }

    function addFreelancer(string calldata name, string calldata expertise) public _noRole returns(bool){
        _freelancers[msg.sender] = Freelancer(name, 5, msg.sender, expertise, true);

        return true;
    }

    function addEvaluator(string calldata name, string calldata expertise) public _noRole returns(bool){
        _evaluators[msg.sender] = Evaluator(name, 5, msg.sender, expertise, true);

        return true;
    }

    function addManager(string calldata name) public _noRole returns(bool){
        _managers[msg.sender] = Manager(name, 5, msg.sender, true);

        return true;
    }

    //This needs an approve call for the contract from the UI
    function addFunding(string calldata name, uint256 productIndex, uint256 amount) public _productExists(productIndex) returns(bool){
        require(_products[productIndex].state == State.Funding,  "Funding stage ended!");
        require(_products[productIndex].remaining_funding >= amount, "Funding goal exceeded!");
        require(amount > 0);

        if(_fundersPerProduct[productIndex][msg.sender].exists == true){
            uint256 currentSum = _fundersPerProduct[productIndex][msg.sender].amount;
            _fundersPerProduct[productIndex][msg.sender] = Funder(name, msg.sender, currentSum.add(amount), true);
        }
        else{
            _fundersPerProduct[productIndex][msg.sender] = Funder(name, msg.sender, amount, true);
            _products[productIndex].funders.push(msg.sender);
        }

        _products[productIndex].remaining_funding = _products[productIndex].remaining_funding.sub(amount);

        changeProductState(productIndex);

        return _token.transferFrom(msg.sender, address(this), amount);
    }

    function notifyManager(uint256 productIndex)public _productExists(productIndex) _isInTeam(productIndex) returns(bool){
        require(_products[productIndex].state == State.Development, "Product needs to be in development stage!");
        _products[productIndex].state = State.ManagerApproval;
        emit NotifyManager(productIndex, msg.sender);
        return true;
    }

    function withdrawFunding(uint256 productIndex, uint256 amount) public _productExists(productIndex) returns(bool){
        require(_fundersPerProduct[productIndex][msg.sender].exists == true);
        require(_fundersPerProduct[productIndex][msg.sender].amount >= amount);
        require(_products[productIndex].state == State.Funding);

        _products[productIndex].remaining_funding = _products[productIndex].remaining_funding.add(amount);
        
        return _token.transfer(msg.sender, amount);
    }

    function applyForProduct(uint256 productIndex, uint256 sum) public _productExists(productIndex) _isFreelancer returns(bool){
        require(_products[productIndex].state == State.Teaming);
        require(_products[productIndex].development_cost >= sum);
        require(_applicationPerFreelancer[productIndex][msg.sender] == false, "Already applied for this product!");
        require(sum > 0);

        _freelancersPerProduct[productIndex].push(Application(msg.sender, sum, false));
        _applicationPerFreelancer[productIndex][msg.sender] = true;
        return true;
    }

    function applyForProductEvaluation(uint256 productIndex) public _isEvaluator _productExists(productIndex) returns(bool){
        require(_products[productIndex].state == State.Teaming);
        require(_products[productIndex].evaluator == address(0));
        _products[productIndex].evaluator = msg.sender;
        changeProductState(productIndex);
        return true;
    }

    function chooseFreelancer(uint256 productIndex, uint256 applicationIndex) public _isManager _productExists(productIndex) _applicationExists(productIndex, applicationIndex) returns(bool){
        require(_products[productIndex].manager == msg.sender);
        require(_products[productIndex].state == State.Teaming);
        require(_freelancersPerProduct[productIndex][applicationIndex].sum <= _products[productIndex].remaining_development_funding);
        require(_freelancersPerProduct[productIndex][applicationIndex].approved == false);

        _products[productIndex].remaining_development_funding = _products[productIndex].remaining_development_funding.sub(_freelancersPerProduct[productIndex][applicationIndex].sum);
        _freelancersPerProduct[productIndex][applicationIndex].approved = true;
        _teamPerProduct[productIndex].push(_freelancersPerProduct[productIndex][applicationIndex]);

        changeProductState(productIndex);
        return true;
    }

    function acceptProduct(bool accepted, uint256 productIndex) public _isManager _productExists(productIndex) returns(bool){
        require(_products[productIndex].manager == msg.sender);
        require(_products[productIndex].state == State.ManagerApproval);

        if(accepted){
            distributeFunds(productIndex);
            _managers[_products[productIndex].manager].reputation = increaseReputation(_managers[_products[productIndex].manager].reputation);

            for (uint i= 0; i< _teamPerProduct[productIndex].length; i++) {
                Freelancer memory freelancer = _freelancers[_teamPerProduct[productIndex][i].account];
                freelancer.reputation = increaseReputation(freelancer.reputation);
            }

            _products[productIndex].state = State.Done;
        }
        else{
            _products[productIndex].state = State.Evaluating;
            emit RequiresEvaluation(productIndex);
        }

        return true;
    }

    function evaluateProduct(bool accepted, uint256 productIndex) public _isEvaluator _productExists(productIndex) returns(bool){
        require(_products[productIndex].evaluator == msg.sender);
        require(_products[productIndex].state == State.Evaluating);

        if(accepted){
            distributeFunds(productIndex);
            _managers[_products[productIndex].manager].reputation = decreaseReputation(_managers[_products[productIndex].manager].reputation);

            for (uint i = 0; i < _teamPerProduct[productIndex].length; i++) {
                Freelancer memory freelancer = _freelancers[_teamPerProduct[productIndex][i].account];
                freelancer.reputation = increaseReputation(freelancer.reputation);
            }

            _products[productIndex].state = State.Done;
        }
        else{
            for (uint i = 0; i < _teamPerProduct[productIndex].length; i++) {
                Freelancer memory freelancer = _freelancers[_teamPerProduct[productIndex][i].account];
                freelancer.reputation = decreaseReputation(freelancer.reputation);
            }

            //This works but _freelancersPerProduct keeps old reputation
            _products[productIndex].state = State.Teaming;
            _products[productIndex].remaining_development_funding = _products[productIndex].development_cost;
            delete _teamPerProduct[productIndex];
        }

        return true;
    }
    //GET
    function getBalance(address owner) public view returns(uint256){
        return _token.balanceOf(owner);
    }

    function getProduct(uint256 index) public view returns(Product memory){
        return _products[index];
    }

    function getProductState(uint256 index) public view returns(State){
        return _products[index].state;
    }

    function getManager(address manager) public view returns(Manager memory){
        return _managers[manager];
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

    function getFreelancersPerProduct(uint256 productIndex) public _productExists(productIndex) view returns(Application[] memory){
        return _freelancersPerProduct[productIndex];
    }

    function getTeamPerProduct(uint256 productIndex) public _productExists(productIndex) view returns(Application[] memory){
        return _teamPerProduct[productIndex];
    }

    function getFundersPerProduct(uint256 productIndex)public view returns(address payable[] memory){
        return _products[productIndex].funders;
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