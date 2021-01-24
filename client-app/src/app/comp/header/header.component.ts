import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContractsService } from 'src/app/services/services/contracts.service';
import { MetaMaskService } from 'src/app/services/services/metamask.service';
import { NewBuyTokensDialog } from './new-buy-tokens.dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(
    private readonly contracts: ContractsService,
    private readonly metaMaskService: MetaMaskService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
  }

  public onBuyTokens(): void{
    const dialogRef = this.dialog.open(NewBuyTokensDialog, {
      width: "350px",
      data: ""
    });
    dialogRef.afterClosed()
      .subscribe((res: number) => {
        if (res == undefined) {
          alert("Invalid input");
        }
        this.contracts.YetAnotherEthereumToken
                  .methods
                  .buyTokens(this.metaMaskService.user, res)
                  .send({ from: this.metaMaskService.user })
                  .then(res => console.log(res))
                  .catch(err => console.log(err));
      });
  }
}
