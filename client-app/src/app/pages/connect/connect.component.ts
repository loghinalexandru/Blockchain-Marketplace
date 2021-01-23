import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MetaMaskService } from 'src/app/services/services/metamask.service';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})
export class ConnectComponent implements OnInit {

  constructor(
    private readonly metaMaskService: MetaMaskService,
    private readonly router: Router
  ) { }

  public async onConnect(): Promise<void> {
    const connected = await this.metaMaskService.connect();
    if (connected) {
      this.router.navigate(["home"]);
    }
  }

  async ngOnInit(): Promise<void> {
    await this.onConnect();
  }

}
