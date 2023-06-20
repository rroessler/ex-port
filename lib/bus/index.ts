/// Package Modules
import { Codec } from '../codec';
import { Parser } from '../parser';

/** Codec Bus Alias. */
export interface Bus<I, O> {
    readonly incoming: I;
    readonly outgoing: O;
}

export namespace Bus {
    //  TYPEDEFS  //

    /** Any Bus Typing. */
    export type Any = Bus<any, any>;

    /** Simplex Bus Typings. */
    export type Simplex<T> = Bus<T, T>;

    /** Helper to infer bus-typings. */
    export type Infer<T extends Parser.Facade<Any> | Codec.Abstract<Any> | undefined> = T extends undefined
        ? Bus<Buffer, Buffer>
        : T extends Parser.Facade<Any>
        ? Infer<NonNullable<T['codec']>>
        : T extends Codec.Abstract<Any>
        ? Bus<Parameters<T['serialize']>[0], Parameters<T['encode']>[0]>
        : never;
}
