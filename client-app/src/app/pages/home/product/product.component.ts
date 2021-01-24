import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { C_TRANSACT } from 'src/app/services/easy-contract';
import { ContractsService } from 'src/app/services/services/contracts.service';
import { ProductNotifierService } from 'src/app/services/services/product-notifier.service';
import { Account, UserService } from 'src/app/services/services/user.service';
import { FundData } from './fund-dialog/fund-data';
import { FundDialog } from './fund-dialog/fund.dialog';
import { Product } from './product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {

  public user: Account;

  @Input()
  public product: Product;
  @Input()
  productIndex: number;

  constructor(
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
    private readonly contractsService: ContractsService,
    private readonly dialog: MatDialog,
    private readonly productNotifierService: ProductNotifierService) {
    this.userService.userObservable().subscribe((user: Account) => this.user = user);
  }

  private states = {
    0: "Looking for funds",
    1: "Looking for freelances",
    2: "In progress",
    3: "Evaluating",
    4: "Disputing",
    5: "Finished"
  };

  public get state(): string {
    return this.states[this.product.state] ?? "Something is wrong";
  }

  public get canJoinAsFreelancer(): boolean {
    return this.product.state == 1;
  }

  public get canSubmit(): boolean {
    return this.product.state == 2 && this.user.isFreelancer;
  }

  public get canJoinAsEvaluator(): boolean {
    return this.product.evaluator === "0x0000000000000000000000000000000000000000" && this.product.state == 1;
  }

  public get canFund(): boolean {
    return this.product.state == 0;
  }

  public onFund(): void {
    const dialogRef = this.dialog.open(FundDialog, {
      data: {}
    });
    dialogRef.afterClosed().subscribe(async (data: FundData) => {
      if (data === undefined) {
        return;
      }
      if (data.amount > this.user.allowance) {
        this.snackBar.open("You can't give us more money than your allowance!", "", { duration: 1000 });
      } else {
        await C_TRANSACT(this.snackBar, this.contractsService.Marketplace, "addFunding", [data.name, this.productIndex, data.amount]);
        await this.userService.notifyUserInfo();
        await this.productNotifierService.notify(this.productIndex);
      }
    })
  }
}
