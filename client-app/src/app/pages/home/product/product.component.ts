import { Component, Input, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { C_CALL, C_TRANSACT } from 'src/app/services/easy-contract';
import { ContractsService } from 'src/app/services/services/contracts.service';
import { ProductNotifierService } from 'src/app/services/services/product-notifier.service';
import { Account, UserService } from 'src/app/services/services/user.service';
import { FundData } from './fund-dialog/fund-data';
import { FundDialog } from './fund-dialog/fund.dialog';
import { JoinFreelancerDialog } from './join-freelancer/join-freelancer.dialog';
import { Product } from './interfaces/product';
import { Freelancer, FreelancerKeys } from './interfaces/freelancer';
import { ViewApplicantsDialog } from './view-applicants/view-applicants.dialog';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  private freelancers: Freelancer[] = [];

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
    private readonly productNotifierService: ProductNotifierService,
    private readonly zone: NgZone) {
    this.userService.userObservable().subscribe((user: Account) => this.zone.run(() => this.user = user));
  }
  async ngOnInit(): Promise<void> {
    let freelancers: [];
    if (this.product.state == 1) {
      freelancers = await C_CALL(this.snackBar, this.contractsService.Marketplace, "getFreelancersPerProduct", [this.productIndex]);
    } else {
      freelancers = await C_CALL(this.snackBar, this.contractsService.Marketplace, "getTeamPerProduct", [this.productIndex]);
    }

    this.freelancers = freelancers.map((freelancer: []) => {
      const f = FreelancerKeys.reduce((obj, key) => {
        obj[key] = freelancer[key];
        return obj;
      }, {}) as Freelancer;
      return f;
    });

    for(let entry of this.freelancers){
      var freelancerDetails = await C_CALL(this.snackBar, this.contractsService.Marketplace, "getFreelancer", [entry.account]);
      entry.expertise = freelancerDetails["expertise"]
      entry.reputation = freelancerDetails["reputation"]
    }
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
    return this.product.state == 1 && this.user.isFreelancer && this.freelancers.findIndex(f => f.account.toLowerCase() == this.user.address.toLowerCase()) < 0;
  }

  public get alreadyJoined(): boolean {
    return this.freelancers.findIndex(f => f.account.toLowerCase() == this.user.address.toLowerCase()) > -1
  }

  public get alreadyEvaluator(): boolean {
    return this.user.address.toLowerCase() == this.product.evaluator.toLocaleLowerCase();
  }

  public get canSubmit(): boolean {
    return this.product.state == 2
      && this.user.isFreelancer
      && this.freelancers.findIndex(f => f.account.toLowerCase() == this.user.address.toLowerCase()) > -1;
  }

  public get canJoinAsEvaluator(): boolean {
    return this.product.evaluator === "0x0000000000000000000000000000000000000000" && this.product.state == 1 && this.user.isEvaluator;
  }

  public get canFund(): boolean {
    return this.product.state == 0;
  }

  public get canViewApplicants(): boolean {
    return this.user.isManager && this.user.address.toLowerCase() == this.product.manager.toLowerCase();
  }

  public get canAcceptProduct(): boolean {
    return this.user.isManager &&
      this.product.state == 3 &&
      this.product.manager.toLowerCase() == this.user.address.toLowerCase();
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

  public onJoinFreelancer(): void {
    const dialogRef = this.dialog.open(JoinFreelancerDialog, {
      data: 0
    });
    dialogRef.afterClosed().subscribe(async (data: number) => {
      if (data === undefined) {
        return;
      }
      if (data > this.product.development_cost) {
        this.snackBar.open("You cannot be paid more than the projects development fund", "", { duration: 1000 });
      } else {
        await C_TRANSACT(this.snackBar, this.contractsService.Marketplace, "applyForProduct", [this.productIndex, data]);
        await this.productNotifierService.notify(this.productIndex);
      }
    })
  }

  public async onJoinEvaluator(): Promise<void> {
    await C_TRANSACT(this.snackBar, this.contractsService.Marketplace, "applyForProductEvaluation", [this.productIndex]);
    await this.productNotifierService.notify(this.productIndex);
  }

  public onViewApplications(): void {
    const dialogRef = this.dialog.open(ViewApplicantsDialog, {
      width: "80%",
      data: {
        productIndex: this.productIndex,
        freelancers: this.freelancers
      }
    });
    dialogRef.afterClosed()
      .subscribe(_ => this.productNotifierService.notify(this.productIndex));
  }

  public async onSubmitApplication(): Promise<void> {
    await C_TRANSACT(this.snackBar, this.contractsService.Marketplace, "notifyManager", [this.productIndex]);
    await this.productNotifierService.notify(this.productIndex);
  }

  public async onSubmitProduct(value:boolean): Promise<void> {
    await C_TRANSACT(this.snackBar, this.contractsService.Marketplace, "acceptProduct", [value, this.productIndex]);
    await this.productNotifierService.notify(this.productIndex);
  }
}
