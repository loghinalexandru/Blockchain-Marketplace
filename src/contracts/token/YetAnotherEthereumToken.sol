// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;
import "./ERC20.sol";

contract YetAnotherEthereumToken is ERC20 {
    constructor() ERC20("YetAnotherEthereumToken",  "YAET"){
        _mint(address(this), 1000);
    }

    function buyTokens(address recipient, uint256 amount) payable public returns(bool){
        this.approve(recipient, amount);
        return transferFrom(address(this), recipient, amount);
    }
}