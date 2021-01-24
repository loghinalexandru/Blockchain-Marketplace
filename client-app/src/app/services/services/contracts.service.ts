import { Injectable, OnInit } from '@angular/core';

import YetAnotherEthereumToken from "@assets/build/YetAnotherEthereumToken.json";
import Marketplace from "@assets/build/Main.json";
import { Web3Service } from './web3.service';
import contracts from "@assets/contracts.json";
import { AbiItem, Contract } from "web3-eth/lib";
import { MetaMaskService } from './metamask.service';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  constructor(
    private readonly w3: Web3Service, 
    private readonly metaMaskService: MetaMaskService) {
  }

  public get YetAnotherEthereumToken(): Contract{
    return new this.w3.web3.eth.Contract
      (YetAnotherEthereumToken["abi"] as AbiItem[], contracts.YetAnotherEthereumToken, { from: this.metaMaskService.user });
  }

  public get Marketplace(): Contract{
    return new this.w3.web3.eth.Contract
      (Marketplace["abi"] as AbiItem[], contracts.Main, { from: this.metaMaskService.user });
  }
}
