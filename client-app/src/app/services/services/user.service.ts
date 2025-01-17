import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BehaviorSubject, Observable } from "rxjs";
import { C_CALL } from "../easy-contract";
import { ContractsService } from "./contracts.service";
import { MetaMaskService } from "./metamask.service";
import { Web3Service } from "./web3.service";
import contracts from "@assets/contracts.json"

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private user: Account;
    private readonly _subject: BehaviorSubject<Account> = new BehaviorSubject<Account>(
        { address: "", allowance: 0, name: "", reputation: 0, expertise: "", balance: "0", tokens: 0, isEvaluator: false, isFreelancer: false, isManager: false });

    constructor(
        private readonly w3s: Web3Service,
        private readonly snackBar: MatSnackBar,
        private readonly contractsService: ContractsService) {

        this.contractsService.contractsUpdated().subscribe(async user => {
            if (user == "") return;
            this.rebuild(user);
        });
    }

    public userObservable(): Observable<Account> {
        return this._subject.asObservable();
    }

    public async notifyUserInfo(): Promise<void> {
        await this.rebuild(this.user.address);
    }

    private async rebuild(t_address: string): Promise<void> {

        const t_balance = await this.w3s.web3.eth.getBalance(t_address);
        const t_tokens = await C_CALL<number>(this.snackBar, this.contractsService.YetAnotherEthereumToken, "balanceOf", [t_address]);
        const t_allowance = await C_CALL<number>(this.snackBar, this.contractsService.YetAnotherEthereumToken, "allowance", [t_address, contracts.Main]);
        const t_isManager = await C_CALL<boolean>(this.snackBar, this.contractsService.Marketplace, "isManager", []);
        const t_isFreelancer = await C_CALL<boolean>(this.snackBar, this.contractsService.Marketplace, "isFreelancer", []);
        const t_isEvaluator = await C_CALL<boolean>(this.snackBar, this.contractsService.Marketplace, "isEvaluator", []);

        const expertiseFunc = t_isFreelancer == true ? "getFreelancer" : t_isManager ? "getManager" : "getEvaluator";
        const t_role = await C_CALL<string>(this.snackBar, this.contractsService.Marketplace, expertiseFunc, [t_address]);
        const role = mapRole(RoleKeys, t_role);

        this.user = {
            name: role.name,
            address: t_address,
            balance: t_balance,
            tokens: t_tokens,
            expertise: role.expertise,
            reputation: role.reputation,
            allowance: t_allowance,
            isEvaluator: t_isEvaluator,
            isManager: t_isManager,
            isFreelancer: t_isFreelancer
        };
        this._subject.next(this.user);
    }
}

export interface Account {
    name: string;
    balance: string;
    address: string;
    tokens: number;
    reputation: number;
    expertise: string;
    allowance: number;
    isManager: boolean;
    isFreelancer: boolean;
    isEvaluator: boolean;
}

export interface Role {
    expertise: string;
    reputation: number;
    name: string;
}

export const RoleKeys = [
    "expertise", "name", "reputation"
]

function mapRole(arr: string[], input): Role {
    return arr.reduce((obj, key) => { obj[key] = input[key]; return obj; }, {}) as Role;
}