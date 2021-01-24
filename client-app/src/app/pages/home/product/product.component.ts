import { Component, Input, OnInit } from '@angular/core';
import { Product } from './product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  @Input()
  public data: Product;

  constructor() { }

  ngOnInit(): void {
  }

  public get state():string {
    switch (this.data.state) {
      case 0: return "Looking for funds"; 
      case 1: return "Looking for freelances"; 
      case 2: return "In progress"; 
      case 3: return "Evaluating"; 
      case 4: return "Done"; 
      default: return "Something is wrong"; 
    }
  }
}
