import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProductNotifierService {
    private readonly productIndex: Subject<number> = new Subject<number>();

    public notify(index: number): void {
        this.productIndex.next(index);
    }

    public getObservable(): Observable<number> {
        return this.productIndex.asObservable();
    }
}