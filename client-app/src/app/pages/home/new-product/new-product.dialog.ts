import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NewProductData } from "./new-product-data";

@Component({
    selector: 'new-product.dialog',
    templateUrl: 'new-product.dialog.html',
})
export class NewProductDialog {

    constructor(
        public dialogRef: MatDialogRef<NewProductDialog>,
        @Inject(MAT_DIALOG_DATA) public data: NewProductData) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}