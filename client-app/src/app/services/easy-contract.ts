import { MatSnackBar } from "@angular/material/snack-bar";

export function C_CALL<T>(snackBar: MatSnackBar, contract: any, method: string, args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        contract.methods[method](...args).call()
            .then(res =>
                // snackBar.open("🎉🎉 ✅");
                resolve(res))
            .catch(err => {
                snackBar.open("😭😭😭😭","", {
                    duration: 1000
                });
                reject(":(");
            });
    });
}

export function C_TRANSACT<T>(snackBar: MatSnackBar, contract: any, method: string, args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        contract.methods[method](...args).send()
            .then(res => {
                snackBar.open("🎉🎉 ✅ easy ✅");
                resolve(res);
            })
            .catch(err => {
                snackBar.open("😭😭😭😭 Sorry we couldn't do it","", {
                    duration: 1000
                });
                reject(":(");
            });
    });
}