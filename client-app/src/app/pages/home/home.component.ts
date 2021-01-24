import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContractsService } from 'src/app/services/services/contracts.service';
import { NewProductData } from './new-product/new-product-data';
import { NewProductDialog } from './new-product/new-product.dialog';
import { NewManagerDialog } from './new-manager/new-manager.dialog';
import { Product, ProductKeys } from './product/interfaces/product';
import { NewBuyTokensDialog } from './tokens/new-buy-tokens.dialog';
import { NewRoleExpertise } from './new-role-expertise/new-role-expertise';
import { NewRoleExpertiseDialog } from './new-role-expertise/new-role-expertise.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { C_CALL, C_TRANSACT } from 'src/app/services/easy-contract';
import contracts from '@assets/contracts.json';
import { UserService, Account } from 'src/app/services/services/user.service';
import { ProductNotifierService } from 'src/app/services/services/product-notifier.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public user: Account;
  public products: Product[] = [];

  constructor(
    private readonly contractsService: ContractsService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly userService: UserService,
    private readonly productNotifierService: ProductNotifierService,
    private readonly zone: NgZone
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.userService.userObservable().subscribe((user: Account) => { this.zone.run(() => this.user = user); });
    this.productNotifierService.getObservable().subscribe(index => this.updateProduct(index));

    const productCount = await C_CALL<number>(this.snackBar, this.contractsService.Marketplace, "getProductCount", []);
    for (let i = 0; i < productCount; i++) {
      await this.setProduct(i);
    }
  }

  private async updateProduct(index: number): Promise<void> {
    const p: Product = await this.mapProduct(index);
    this.products[index] = p;
  }

  private async setProduct(index: number): Promise<void> {
    const p: Product = await this.mapProduct(index);
    this.products.push(p);
  }

  private async mapProduct(index: number): Promise<Product> {
    const product = await C_CALL<number>(this.snackBar, this.contractsService.Marketplace, "getProduct", [index]);
    const p = ProductKeys.reduce((obj, key) => {
      obj[key] = product[key];
      return obj;
    }, {}) as Product;
    return p;
  }

  public onBuyTokens(): void {
    const dialogRef = this.dialog.open(NewBuyTokensDialog, {
      width: "350px",
      data: ""
    });
    dialogRef.afterClosed()
      .subscribe(async (res: number) => {
        if (res != undefined) {
          await C_TRANSACT(this.snackBar, this.contractsService.YetAnotherEthereumToken, "buyTokens", [this.user.address, res]);
          await this.userService.notifyUserInfo();
        }
      });
  }

  public onAddAllowance(): void {
    const dialogRef = this.dialog.open(NewBuyTokensDialog, {
      width: "350px",
      data: ""
    });
    dialogRef.afterClosed()
      .subscribe(async (res: number) => {
        if (res != undefined) {
          await C_TRANSACT(this.snackBar, this.contractsService.YetAnotherEthereumToken, "approve", [contracts.Main, res]);
          await this.userService.notifyUserInfo();
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
          await C_TRANSACT(this.snackBar, this.contractsService.Marketplace, "createProduct", [res.description, res.developmentCost, res.evaluatorReward, res.expetise]);
          this.setProduct(this.products.length);
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
          await C_TRANSACT(this.snackBar, this.contractsService.Marketplace, "addManager", [res]);
          await this.userService.notifyUserInfo();
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
          role == "EVL"
            ? await C_TRANSACT(this.snackBar, this.contractsService.Marketplace, "addEvaluator", [res.name, res.expertise])
            : await C_TRANSACT(this.snackBar, this.contractsService.Marketplace, "addFreelancer", [res.name, res.expertise]);
          await this.userService.notifyUserInfo();
        }
      });
  }

  public get hasRole(): boolean {
    return this.user.isEvaluator || this.user.isFreelancer || this.user.isManager;
  }

  public get role(): string {
    return this.user.isFreelancer ? "Freelancer" : this.user.isManager ? "Manager" : this.user.isEvaluator ? "Evaluator" : " <select your role>"
  }
}
