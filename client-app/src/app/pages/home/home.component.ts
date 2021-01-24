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
import { NewRoleExpertise } from './new-role-expertise/new-role-expertise';
import { NewRoleExpertiseDialog } from './new-role-expertise/new-role-expertise.dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public accounts = [];
  public products = [];

  public isManager: boolean = false;
  public isEvaluator: boolean = false;
  public isFreelancer: boolean = false;

  private marketplace;
  private tokens;

  constructor(
    private readonly w3s: Web3Service,
    private readonly contractsService: ContractsService,
    private readonly metaMaskService: MetaMaskService,
    private readonly dialog: MatDialog
  ) {}

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

    const productCount = await this.marketplace.methods.getProductCount().call();

    this.isManager = await this.marketplace.methods.isManager().call();
    this.isFreelancer = await this.marketplace.methods.isFreelancer().call();
    this.isEvaluator = await this.marketplace.methods.isEvaluator().call();

    console.log(this.isManager, this.isFreelancer, this.isEvaluator);

    for (let i = 0; i < productCount; i++) {
      const product = await this.marketplace.methods.getProduct(i).call();
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
                  .send()
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
            .send()
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
        if (res != undefined && res != "") {
          this.marketplace
          .methods
          .addManager(res)
          .send()
          .then(res => console.log(res))
          .catch(err => console.log(err));
        }
      });
  }

  public onNewRole(role:string): void {
    const dialogRef = this.dialog.open(NewRoleExpertiseDialog, {
        width: "350px",
        data: {}
      });
    dialogRef.afterClosed()
      .subscribe(async (res: NewRoleExpertise) => {
        if (res != undefined) {
          if(role == "EVL") {
            await this.marketplace.methods.addFreelancer(res.name, res.expertise).send();
            return;
          }
          await this.marketplace.methods.addEvaluator(res.name, res.expertise).send();
        }
      });
  }

  private get w3(): Web3 {
    return this.w3s.web3;
  }

  public get hasRole():boolean {
    return this.isEvaluator || this.isFreelancer || this.isManager;
  }
}
