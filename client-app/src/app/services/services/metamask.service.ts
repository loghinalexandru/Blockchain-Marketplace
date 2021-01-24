import { Injectable } from "@angular/core";
import { Web3Service } from "./web3.service";

@Injectable({
    providedIn: 'root'
})
export class MetaMaskService {

    constructor(private readonly w3: Web3Service) {

    }

    private userHash: string = "";

    public get isConnected(): boolean {
        return window['ethereum'].isConnected();
    }

    public get user(): string {
        return this.userHash;
    }

    public async connect(): Promise<boolean> {
        if (window['ethereum'] === undefined) {
            alert("Install metamask");
            return false;
        }

        return await this.initMetamask();
    }

    private async initMetamask(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            window['ethereum']
                .send('eth_requestAccounts')
                .then(accs => {
                    this.userHash = accs.result[0];
                    console.log("Connected user:", this.userHash);
                    this.w3.init();
                    resolve(true);
                })
                .catch(err => { alert("please login"); resolve(false); });
        });
    }
}