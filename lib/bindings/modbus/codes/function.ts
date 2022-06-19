/** Modbus Function Codes Namespace. */
export namespace FC {
    /**************
     *  TYPEDEFS  *
     **************/

    /** Default Function Code Values. */
    export type Value = typeof _names_impl[keyof typeof _names_impl];

    /** All Function Code Names. */
    export type Name = keyof typeof _names_impl;

    /****************
     *  PROPERTIES  *
     ****************/

    /// Available Function Code Names.
    const _names_impl = {
        exception: -1,
        'read-coils': 1,
        'read-discrete-inputs': 2,
        'read-holding-registers': 3,
        'read-input-registers': 4,
        'write-single-coil': 5,
        'write-single-register': 6,
        'write-multiple-coils': 15,
        'write-multiple-registers': 16,
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
