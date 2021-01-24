import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'new-manager.dialog',
    templateUrl: 'new-manager.dialog.html',
})
export class NewManagerDialog {

    constructor(
        public dialogRef: MatDialogRef<NewManagerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: string) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}