import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContractsService } from 'src/app/services/services/contracts.service';
import { MetaMaskService } from 'src/app/services/services/metamask.service';
import { Web3Service } from 'src/app/services/services/web3.service';
import Web3 from 'web3';
import { NewProductData } from './new-product/new-product-data';
import { NewProductDialog } from './new-product/new-product.dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public accounts = [];

  public products = [];
  private contract;

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
      this.accounts.push({
        balance: amount,
        account: acc
      });
    });

    this.contract = this.contractsService.Marketplace;
    const productCount = await this.contract.methods.getProductCount().call({ from: this.metaMaskService.user });

    this.contract.methods.getProduct(0).call({ from: this.metaMaskService.user })
    .then(res => console.log(res))
    .catch(err => console.log(err));

    this.contract.methods.isManager().call({ from: this.metaMaskService.user })
    .then(res => console.log(res))
    .catch(err => console.log(err));

    console.log(productCount);
    //.call({ from: this.metaMaskService.user });
  }

  public async onNewProduct(): Promise<void> {
    const dialogRef = this.dialog.open(NewProductDialog, {
      width: "350px",
      data: {}
    });
    //(string calldata description, uint256 development_cost, uint256 evaluator_reward, string calldata expertise)
    dialogRef.afterClosed()
      .subscribe(async (res: NewProductData) => {
        if (res != undefined) {
          this.contract
            .methods
            .createProduct(res.description, res.developmentCost, res.evaluatorReward, res.expetise)
            .call()
            .then(res => console.log(res))
            .catch(err => console.log(err));
        }
      });
  }

  private get w3(): Web3 {
    return this.w3s.web3;
  }
}
