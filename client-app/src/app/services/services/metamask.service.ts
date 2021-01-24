import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Web3Service } from "./web3.service";

@Injectable({
    providedIn: 'root'
})
export class MetaMaskService {

    private userHashSubject: BehaviorSubject<string> = new BehaviorSubject<string>("");

    constructor(private readonly w3: Web3Service) {}

    public get isConnected(): boolean {
        return window['ethereum'].isConnected();
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
                    this.w3.init();
                    this.userHashSubject.next(accs.result[0]);
                    console.log("Connected user:", accs.result[0]);
                    resolve(true);
                })
                .catch(err => { alert("please login"); resolve(false); });
        });
    }

    public userObservable(): Observable<string> {
        return this.userHashSubject.asObservable();
    }
}