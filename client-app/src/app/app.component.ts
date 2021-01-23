import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import Web3 from 'web3'
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'client-app';
  accounts = [];
  marketplace;
  token;
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

  constructor(private httpClient: HttpClient) {
    
  }
  
  async ngOnInit(): Promise<void> {
    const list = await this.web3.eth.getAccounts();
    var marketplaceABI = await this.httpClient.get("./assets/Main.json").toPromise();
    var tokenABI = await this.httpClient.get("./assets/YetAnotherEthereumToken.json").toPromise();
    this.marketplace = new this.web3.eth.Contract(marketplaceABI['abi'], '0xa397099780eCF042dD9e2712f2B6DAbc775092B6');
    this.token = new this.web3.eth.Contract(tokenABI['abi'], '0x8104d94eC718Db72ace29e8B9b48B3E375815dB0');

    list.forEach(async acc => {
      const amount = await this.web3.eth.getBalance(acc);
      this.accounts.push({
        balance: amount,
        account: acc
      });
    });
  }
}
