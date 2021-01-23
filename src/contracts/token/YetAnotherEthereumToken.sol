// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;
import "./ERC20.sol";

contract YetAnotherEthereumToken is ERC20 {
    constructor() ERC20("YetAnotherEthereumToken",  "YAET"){
        _mint(msg.sender, 1000);
    }

    function buyTokens(uint256 amount) payable public returns(bool){
        return transfer(msg.sender, amount);
    }
}