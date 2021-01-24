import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FundData } from "./fund-data";

@Component({
    selector: 'fund.dialog',
    templateUrl: 'fund.dialog.html',
})
export class FundDialog {

    constructor(
        public dialogRef: MatDialogRef<FundDialog>,
        @Inject(MAT_DIALOG_DATA) public data: FundData) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}