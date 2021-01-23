import { Injectable, OnInit } from '@angular/core';

import YetAnotherEthereumToken from "@assets/YetAnotherEthereumToken.json";
import Marketplace from "@assets/Main.json";

@Injectable({
  providedIn: 'root'
})
export class ContractsService{

  private contracts:string[];
  private readonly Token = "YetAnotherEthereumToken";

  constructor() { }

  public get YetAnotherEthereumToken() {
    return YetAnotherEthereumToken["abi"];
  }

  public get Marketplace() {
    return Marketplace["abi"];
  }
}
