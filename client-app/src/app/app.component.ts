import { Component, OnInit } from '@angular/core';
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
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

  constructor() {
    
  }
  async ngOnInit(): Promise<void> {
    const list = await this.web3.eth.getAccounts();
    list.forEach(async acc => {
      const amount = await this.web3.eth.getBalance(acc);
      this.accounts.push({
        balance: amount,
        account: acc
      });
    });
  }
}
