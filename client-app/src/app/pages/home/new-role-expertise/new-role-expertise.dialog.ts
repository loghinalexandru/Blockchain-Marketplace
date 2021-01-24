import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NewRoleExpertise } from "./new-role-expertise";

@Component({
    selector: 'new-role-expertise.dialog',
    templateUrl: 'new-role-expertise.dialog.html',
})
export class NewRoleExpertiseDialog {

    constructor(
        public dialogRef: MatDialogRef<NewRoleExpertiseDialog>,
        @Inject(MAT_DIALOG_DATA) public data: NewRoleExpertise) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}