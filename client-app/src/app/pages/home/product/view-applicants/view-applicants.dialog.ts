import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { C_TRANSACT } from "src/app/services/easy-contract";
import { ContractsService } from "src/app/services/services/contracts.service";
import { Freelancer } from "../interfaces/freelancer";
import { ViewApplicantsData } from "./view-applicants";

@Component({
    selector: 'view-applicants.dialog',
    templateUrl: 'view-applicants.dialog.html',
    styleUrls: ['./view-applicants.dialog.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class ViewApplicantsDialog {

    public columnsToDisplay = ["account", "sum", "approved","actions"];
    public expandedElement: Freelancer | null;

    constructor(
        public dialogRef: MatDialogRef<ViewApplicantsDialog>,
        @Inject(MAT_DIALOG_DATA) public data: ViewApplicantsData,
        private readonly contracts: ContractsService,
        private readonly snackBar: MatSnackBar) {
        console.log(data);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    public get dataSource(): Freelancer[] {
        return this.data.freelancers;
    }

    public async onAccept(freelancer: Freelancer): Promise<void> {
        const index = this.data.freelancers.findIndex(f => f.account == freelancer.account);
        await C_TRANSACT(this.snackBar, this.contracts.Marketplace, "chooseFreelancer", [this.data.productIndex, index]);
    }
}