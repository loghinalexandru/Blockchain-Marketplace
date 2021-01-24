import { MatSnackBar } from "@angular/material/snack-bar";

export function C_CALL<T>(snackBar: MatSnackBar, contract: any, method: string, args: any[], retryCount: number = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        contract.methods[method](...args).call()
            .then(res =>
                resolve(res))
            .catch(async err => {
                if (retryCount === 3) {
                    snackBar.open("😭😭😭😭", "", {
                        duration: 1000
                    });
                    console.log(err);
                }
                if (retryCount < 3) {
                    await new Promise(resolve => setTimeout(async () => resolve(null), 1000));
                    const result = await C_CALL<T>(snackBar, contract, method, args, retryCount + 1);
                    resolve(result);
                }
                else { reject("Unable to view the blockchain"); }
            });
    });
}

export function C_TRANSACT<T>(snackBar: MatSnackBar, contract: any, method: string, args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        contract.methods[method](...args).send()
            .then(res => {
                snackBar.open("🎉🎉 ✅ easy ✅", "", {
                    duration: 1000
                });
                resolve(res);
            })
            .catch(err => {
                snackBar.open("😭😭😭😭 Sorry we couldn't do it", "", {
                    duration: 1000
                });
                reject(":(");
            });
    });
}