export interface IBaseRepository<T>{
    save(item:Partial<T>):Promise<T | null>;
    findOne(filter: Partial<T>): Promise<T | null>;
    findByIdAndUpdate(id:string , update:Partial<T>) : Promise<T | null>;
    find(filter? : Partial<T>): Promise<T[]>;
    findAndUpdateSet(id: string, field: keyof T, value: string): Promise<T | null>;
    uNfindAndUpdateSet(id: string, field: keyof T, value: string): Promise<T | null>;

}