import Web3 from "web3";

export class Web3Service {
    private _web3: Web3;

    public get web3(): Web3{
        return this._web3;
    }

    public init():void{  
        this._web3 = new Web3(window['ethereum']);
    }
}