/** Modbus Function Codes Namespace. */
export namespace FC {
    /**************
     *  TYPEDEFS  *
     **************/

    /** Default Function Code Values. */
    export type Value = typeof _names_impl[keyof typeof _names_impl];

    /** All Function Code Names. */
    export type Name = keyof typeof _names_impl;

    /** Readable Function Code Names. */
    export type Readable = Exclude<Name, `${'single' | 'multiple'}-${string}`>;

    /** Writable Function Code Names. */
    export type Writable = Exclude<Name, Readable>;

    /****************
     *  PROPERTIES  *
     ****************/

    /// Available Function Code Names.
    const _names_impl = {
        exception: -1,
        coils: 1,
        'discrete-inputs': 2,
        'holding-registers': 3,
        'input-registers': 4,
        'single-coil': 5,
        'single-register': 6,
        'multiple-coils': 15,
        'multiple-registers': 16,
    } as const;

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Gets the associated function code for a given function code name.
     * @param name                              Name of function code.
     */
    export const code = <N extends Name>(name: N) => _names_impl[name];
}
