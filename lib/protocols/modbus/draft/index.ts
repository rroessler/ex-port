/// Package Modules
import { Code } from '../code';
import { Frame } from '../frame';

/** Modbus Mapping Functionality. */
export namespace Draft {
    //  TYPEDEFS  //

    /** Any type of Modbus Map. */
    export type Any = Record<string, Entry<any, any>>;

    /** Defines a Modbus mapping entry. */
    export type Entry<C extends Code.Function, D extends Partial<Frame.Data.Request[C]>> = { readonly code: C } & D;

    /** Draft Request Options. */
    export type Options<D extends Any, K extends keyof D> = { target: number; key: K } & (K extends Draft.Complete<D>
        ? {}
        : Omit<Frame.Data.Request[D[K]['code']], keyof D[K]>);

    /** Inferred Data Mapping. */
    export type Complete<D extends Any> = {
        [K in keyof D]: D[K] extends Frame.Data.Request[D[K]['code']] ? K : never;
    }[keyof D];
}

export namespace Draft.Entry {
    //  PUBLIC METHODS  //

    /**
     * Helper method to construct fully-formed map-data.
     * @param code                          Code to use.
     * @param data                          Associated data.
     */
    export const from = <C extends Code.Function, D extends Partial<Frame.Data.Request[C]>>(code: C, data: D) => ({
        code,
        ...data,
    });
}
