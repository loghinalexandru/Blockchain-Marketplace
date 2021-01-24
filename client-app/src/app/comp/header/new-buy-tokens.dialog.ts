import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'new-buy-tokens.dialog',
    templateUrl: 'new-buy-tokens.dialog.html',
})
export class NewBuyTokensDialog {

    constructor(
        public dialogRef: MatDialogRef<NewBuyTokensDialog>,
        @Inject(MAT_DIALOG_DATA) public data: number) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}