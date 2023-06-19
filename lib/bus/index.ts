/// Package Modules
import { Codec } from '../codec';
import { Parser } from '../parser';

/** Codec Bus Alias. */
export interface Bus<I extends any, O extends any> {
    readonly incoming: I;
    readonly outgoing: O;
}

export namespace Bus {
    //  TYPEDEFS  //

    /** Any Bus Typing. */
    export type Any = Bus<any, any>;

    export type Infer<T extends Parser.Facade<Any> | Codec.Abstract<Any> | undefined> = T extends undefined
        ? Bus<Buffer, Buffer>
        : T extends Parser.Facade<Any>
        ? Infer<NonNullable<T['codec']>>
        : T extends Codec.Abstract<Any>
        ? Bus<Parameters<T['decode']>[0], Parameters<T['encode']>[0]>
        : never;
}
