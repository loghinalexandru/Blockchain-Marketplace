pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;
import "../token/YetAnotherEthereumToken.sol";
import "../token/SafeMath.sol";

contract Main {
    using SafeMath for uint256;

    //Events
    event RequiresEvaluation(uint256 productIndex);

    address private _creator;
    YetAnotherEthereumToken private _token;
    uint256 private _productCount;

    enum State {Funding, Teaming, Development, Evaluating, Done}

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

    modifier _noRole(address user){
        require(_managers[user].exists == false, "User is already manager!");
        require(_freelancers[user].exists == false, "User is already freelancer!");
        require(_evaluators[user].exists == false, "User is already evaluator!");
        _;
    }
    
    modifier _isManager() {
        require (_managers[msg.sender].exists = true);
        _;
    }

    modifier _isFreelancer() {
        require (_freelancers[msg.sender].exists = true);
        _;
    }

    modifier _isEvaluator() {
        require (_evaluators[msg.sender].exists = true);
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
        else if(_products[productIndex].state == State.Development){
            _token.transfer(_products[productIndex].manager, _products[productIndex].evaluator_reward);
        }

        return true;
    }

    function changeProductState(uint256 productIndex) private {

        if(_products[productIndex].remaining_funding == 0){
            _products[productIndex].state = State.Teaming;
        }
        else if(_products[productIndex].remaining_development_funding == 0 && _products[productIndex].state == State.Funding){
            _products[productIndex].state = State.Development;
        }
    }

    //POST

    function createProduct(string calldata description, uint256 development_cost, uint256 evaluator_reward, string calldata expertise) public _isManager returns(bool){
        _products[_productCount] = Product(description, State.Funding, development_cost, evaluator_reward, development_cost.add(evaluator_reward), development_cost, expertise, msg.sender, address(0), new address payable[](0), false, true);
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

        _productCount = _productCount - 1;

        delete _products[productIndex];

        return true;
    }

    function addFreelancer(string calldata name, string calldata expertise) public _noRole(msg.sender) returns(bool){
        require(_freelancers[msg.sender].exists == false);
        _freelancers[msg.sender] = Freelancer(name, 5, msg.sender, expertise, true);

        return true;
    }

    function addEvaluator(string calldata name, string calldata expertise) public _noRole(msg.sender) returns(bool){
        require(_evaluators[msg.sender].exists == false);
        _evaluators[msg.sender] = Evaluator(name, 5, msg.sender, expertise, true);

        return true;
    }

    function addManager(string calldata name) public _noRole(msg.sender) returns(bool){
        require(_managers[msg.sender].exists == false);
        _managers[msg.sender] = Manager(name, 5, msg.sender, true);

        return true;
    }

    //This needs an approve call for the contract from the UI
    function addFunding(string calldata name, uint256 productIndex, uint256 amount) public _productExists(productIndex) returns(bool){
        require(_products[productIndex].state == State.Funding,  "Funding stage ended!");
        require(_products[productIndex].remaining_funding >= amount, "Funding goal exceeded!");

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

    function withdrawFunding(uint256 productIndex, uint256 amount) public _productExists(productIndex) returns(bool){
        require(_fundersPerProduct[productIndex][msg.sender].exists == true);
        require(_fundersPerProduct[productIndex][msg.sender].amount >= amount);
        require(_products[productIndex].state == State.Funding);

        _products[productIndex].remaining_funding = _products[productIndex].remaining_funding.add(amount);
        
        return _token.transfer(msg.sender, amount);
    }

    function applyForProduct(uint256 productIndex, uint256 sum) public _productExists(productIndex) _isFreelancer returns(bool){
        require(_products[productIndex].state == State.Teaming);

        _freelancersPerProduct[productIndex].push(Application(msg.sender, sum));

        return true;
    }

    function applyForProductEvaluation(uint256 productIndex) public _isEvaluator _productExists(productIndex) returns(bool){
        require(_products[productIndex].state == State.Teaming);
        require(_products[productIndex].evaluator == address(0));

        _products[productIndex].evaluator = msg.sender;

        return true;
    }

    function chooseFreelancer(uint256 productIndex, uint256 applicationIndex) public _isManager _productExists(productIndex) returns(bool){
        require(_products[productIndex].manager == msg.sender);
        require(_products[productIndex].state == State.Teaming);
        require(_freelancersPerProduct[productIndex][applicationIndex].sum <= _products[productIndex].remaining_development_funding);

        _products[productIndex].remaining_development_funding = _products[productIndex].remaining_development_funding.sub(_freelancersPerProduct[productIndex][applicationIndex].sum);
        _teamPerProduct[productIndex].push(_freelancersPerProduct[productIndex][applicationIndex]);
        
        changeProductState(productIndex);

        return true;
    }

    function acceptProduct(bool accepted, uint256 productIndex) public _isManager _productExists(productIndex) returns(bool){
        require(_products[productIndex].manager == msg.sender);
        require(_products[productIndex].state == State.Development);

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

    function getProduct(uint256 index) public _productExists(index) view returns(Product memory){
        return _products[index];
    }

    function getProductState(uint256 index) public _productExists(index) view returns(State){
        return _products[index].state;
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

    function getFundersPerProduct(uint256 productIndex)public _productExists(productIndex) view returns(address payable[] memory){
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