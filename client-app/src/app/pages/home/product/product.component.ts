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
  public isManager: boolean;
  public isFreelancer: boolean;
  public isEvaluator: boolean;

  constructor() { }

  ngOnInit(): void {
    console.log(this.product);
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
    const res = this.states[this.product.state] ?? "Something is wrong";
    return res;
  }
}
