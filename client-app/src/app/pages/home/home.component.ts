import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContractsService } from 'src/app/services/services/contracts.service';
import { MetaMaskService } from 'src/app/services/services/metamask.service';
import { Web3Service } from 'src/app/services/services/web3.service';
import Web3 from 'web3';
import { NewProductData } from './new-product/new-product-data';
import { NewProductDialog } from './new-product/new-product.dialog';
import { NewManagerDialog } from './new-manager/new-manager.dialog';
import { ProductKeys } from './product/product';
import { NewBuyTokensDialog } from './tokens/new-buy-tokens.dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public accounts = [];
  public products = [];
  private marketplace;
  private tokens;

  constructor(
    private readonly w3s: Web3Service,
    private readonly contractsService: ContractsService,
    private readonly metaMaskService: MetaMaskService,
    private readonly dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    const list = await this.w3.eth.getAccounts();

    list.forEach(async acc => {
      const amount = await this.w3.eth.getBalance(acc);
      const tokens = await this.contractsService.YetAnotherEthereumToken.methods.balanceOf(acc).call();
      this.accounts.push({
        balance: amount,
        account: acc,
        tokens: tokens
      });
    });

    this.marketplace = this.contractsService.Marketplace;
    this.tokens = this.contractsService.YetAnotherEthereumToken;

    const productCount = await this.marketplace.methods.getProductCount().call({ from: this.metaMaskService.user });

    for (let i = 0; i < productCount; i++) {
      const product = await this.marketplace.methods.getProduct(i).call({ from: this.metaMaskService.user });
      const p = ProductKeys.reduce((obj, key) => {
        obj[key] = product[key];
        return obj;
      }, {});
      this.products.push(p);
    }
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
        this.tokens
                  .methods
                  .buyTokens(this.metaMaskService.user, res)
                  .send({ from: this.metaMaskService.user })
                  .then(res => console.log(res))
                  .catch(err => console.log(err));
      });
  }

  public onNewProduct(): void {
    const dialogRef = this.dialog.open(NewProductDialog, {
      width: "350px",
      data: {}
    });
    dialogRef.afterClosed()
      .subscribe((res: NewProductData) => {
        if (res != undefined) {
          this.marketplace
            .methods
            .createProduct(res.description, res.developmentCost, res.evaluatorReward, res.expetise)
            .send({ from: this.metaMaskService.user })
            .then(res => console.log(res))
            .catch(err => console.log(err));
        }
      });
  }

  public onNewManager(): void {
    const dialogRef = this.dialog.open(NewManagerDialog, {
      width: "350px",
      data: ""
    });
    dialogRef.afterClosed()
      .subscribe((res: string) => {
        if (res == undefined || res == "") {
          alert("Invalid name");
        }

        this.marketplace
          .methods
          .addManager(res)
          .send({ from: this.metaMaskService.user })
          .then(res => console.log(res))
          .catch(err => console.log(err));

      });
  }

  private get w3(): Web3 {
    return this.w3s.web3;
  }
}
