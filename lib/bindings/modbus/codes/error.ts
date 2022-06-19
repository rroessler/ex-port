/** Modbus Error Codes. */
export namespace EC {
    /**************
     *  TYPEDEFS  *
     **************/

    /** Available Error Values. */
    export type Value = typeof _list_impl[number];

    /****************
     *  PROPERTIES  *
     ****************/

    /// Error Codes List.
    const _list_impl = [-1, 1, 2, 3, 4, 5, 6, 7, 8] as const;

    /// Error Code Reasons.
    const _reasons_impl = {
        [-1]: 'Received No Response',
        1: 'Illegal Function',
        2: 'Illegal Data Address',
        3: 'Illegal Data Value',
        4: 'Master Device Failure',
        5: 'Acknowledge',
        6: 'Master Device Busy',
        7: 'Negative Acknowledge',
        8: 'Memory Parity Error',
    } as const;

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Gets the associated error reason.
     * @param c                     Error Code.
     */
    export const reason = <C extends Value>(c: C) => _reasons_impl[c];
}
