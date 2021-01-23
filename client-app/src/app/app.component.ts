import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import Web3 from 'web3'
import { MetaMaskService } from './services/services/metamask.service';
import { Web3Service } from './services/services/web3.service';
import { Router } from '@angular/router';
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private readonly router: Router){}

  async ngOnInit(): Promise<void> {
    await this.router.navigate(["connect"]);
  }
}
