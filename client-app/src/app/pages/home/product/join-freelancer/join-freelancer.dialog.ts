import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'join-freelancer.dialog',
    templateUrl: 'join-freelancer.dialog.html',
})
export class JoinFreelancerDialog {

    constructor(
        public dialogRef: MatDialogRef<JoinFreelancerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: number) { }

    onNoClick(): void {
        this.dialogRef.close();
    }
}