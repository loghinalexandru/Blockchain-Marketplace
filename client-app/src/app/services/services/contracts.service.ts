import { Injectable } from '@angular/core';

import YetAnotherEthereumToken from "@assets/build/YetAnotherEthereumToken.json";
import Marketplace from "@assets/build/Main.json";
import { Web3Service } from './web3.service';
import contracts from "@assets/contracts.json";
import { AbiItem, Contract } from "web3-eth/lib";
import { MetaMaskService } from './metamask.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {

  private updateSubject: BehaviorSubject<string> = new BehaviorSubject("");

  private ethToken;
  private marketplace;

  constructor(
    private readonly w3: Web3Service,
    private readonly metaMaskService: MetaMaskService) {
    this.metaMaskService.userObservable().subscribe(user => {
      this.ethToken = new this.w3.web3.eth.Contract
        (YetAnotherEthereumToken["abi"] as AbiItem[], contracts.YetAnotherEthereumToken, { from: user });

      this.marketplace = new this.w3.web3.eth.Contract
        (Marketplace["abi"] as AbiItem[], contracts.Main, { from: user });

      this.updateSubject.next(user);
    });
  }

  public contractsUpdated(): Observable<string> {
    return this.updateSubject.asObservable();
  }

  public get YetAnotherEthereumToken(): Contract {
    return this.ethToken;
  }

  public get Marketplace(): Contract {
    return this.marketplace;
  }
}
