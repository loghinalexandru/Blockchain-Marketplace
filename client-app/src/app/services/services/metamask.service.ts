import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { Web3Service } from "./web3.service";

@Injectable({
    providedIn: 'root'
})
export class MetaMaskService {

    private userHashSubject: BehaviorSubject<string> = new BehaviorSubject<string>("");

    constructor(private readonly w3: Web3Service,
        private readonly router: Router) { }

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
                    //console.log("Connected user:", accs.result[0]);
                    resolve(true);
                })
                .catch(err => { alert("please login"); resolve(false); });

            window['ethereum']
                .on('accountsChanged', (res, err) => {
                    if (err === undefined) {
                        this.w3.init();
                        this.userHashSubject.next(res[0]);
                        //console.log("Connected user:", res[0]);
                        resolve(true);
                    } else {
                        alert("please login"); resolve(false);
                        this.router.navigate(["connect"]);
                    }
                });
        });
    }

    public userObservable(): Observable<string> {
        return this.userHashSubject.asObservable();
    }
}