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
import { MatSnackBar } from '@angular/material/snack-bar';
import { C_CALL, C_TRANSACT } from 'src/app/services/easy-contract';

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
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) { 
    this.marketplace = this.contractsService.Marketplace;
    this.tokens = this.contractsService.YetAnotherEthereumToken;
  }

  async ngOnInit(): Promise<void> {
    const list = await this.w3.eth.getAccounts();
    list.forEach(async acc => {
      const amount = await this.w3.eth.getBalance(acc);
      const tokens = await C_CALL<number>(this.snackBar, this.tokens, "balanceOf",[acc]);
      this.accounts.push({
        balance: amount,
        account: acc,
        tokens: tokens
      });
    });


    const productCount = await C_CALL<number>(this.snackBar, this.marketplace, "getProductCount",[]);
    this.isManager = await C_CALL<boolean>(this.snackBar, this.marketplace, "isManager",[]);
    this.isFreelancer = await C_CALL<boolean>(this.snackBar, this.marketplace, "isFreelancer",[]);
    this.isEvaluator = await C_CALL<boolean>(this.snackBar, this.marketplace, "isEvaluator",[]);;

    for (let i = 0; i < productCount; i++) {
      const product = await C_CALL<number>(this.snackBar, this.marketplace, "getProduct",[i]);
      const p = ProductKeys.reduce((obj, key) => {
        obj[key] = product[key];
        return obj;
      }, {});
      this.products.push(p);
    }
  }

  public onBuyTokens(): void {
    const dialogRef = this.dialog.open(NewBuyTokensDialog, {
      width: "350px",
      data: ""
    });
    dialogRef.afterClosed()
      .subscribe(async (res: number) => {
        if (res != undefined) {
          await C_TRANSACT(this.snackBar, this.tokens, "buyTokens",[this.metaMaskService.user, res]);
        }
      });
  }

  public onNewProduct(): void {
    const dialogRef = this.dialog.open(NewProductDialog, {
      width: "350px",
      data: {}
    });
    dialogRef.afterClosed()
      .subscribe(async (res: NewProductData) => {
        if (res != undefined) {
          await C_TRANSACT(this.snackBar, this.marketplace, "createProduct", [res.description, res.developmentCost, res.evaluatorReward, res.expetise]);
        }
      });
  }

  public onNewManager(): void {
    const dialogRef = this.dialog.open(NewManagerDialog, {
      width: "350px",
      data: ""
    });
    dialogRef.afterClosed()
      .subscribe(async (res: string) => {
        if (res != undefined && res != "") {
          await C_TRANSACT(this.snackBar, this.marketplace, "addManager", [res]);
        }
      });
  }

  public onNewRole(role: string): void {
    const dialogRef = this.dialog.open(NewRoleExpertiseDialog, {
      width: "350px",
      data: {}
    });
    dialogRef.afterClosed()
      .subscribe(async (res: NewRoleExpertise) => {
        if (res != undefined) {
          if (role == "EVL") {
            await C_TRANSACT(this.snackBar, this.marketplace, "addFreelancer", [res.name, res.expertise]);
            return;
          }
          await C_TRANSACT(this.snackBar, this.marketplace, "addEvaluator", [res.name, res.expertise]);
        }
      });
  }

  private get w3(): Web3 {
    return this.w3s.web3;
  }

  public get hasRole(): boolean {
    return this.isEvaluator || this.isFreelancer || this.isManager;
  }
}
