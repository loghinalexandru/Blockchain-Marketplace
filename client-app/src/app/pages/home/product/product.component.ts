import { Component, Input, OnInit } from '@angular/core';
import { Product } from './product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  @Input()
  public product: Product;
  @Input()
  public isManager: boolean;
  @Input()
  public isFreelancer: boolean;
  @Input()
  public isEvaluator: boolean;

  constructor() { }

  ngOnInit(): void {
    console.log(this.product);
    console.log(this.isManager, this.isFreelancer, this.isEvaluator);
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

  public get canSubmit():boolean {
    return this.product.state == 2 && this.isFreelancer;
  }

  public get canJoinAsEvaluator(): boolean {
    return this.product.evaluator === "0x0000000000000000000000000000000000000000" && this.product.state == 1;
  }

  public get canFund():boolean {
    return this.product.state == 0;
  }
}
