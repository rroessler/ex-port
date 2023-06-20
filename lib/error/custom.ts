//  IMPLEMENTATIONS  //

/** Custom Error Abstraction. */
export abstract class Custom extends Error {
    //  PROPERTIES  //

    /** Error Prototyping. */
    public __proto__: Error;

    //  CONSTRUCTORS  //

    /**
     * Handles constructing a custom-error.
     * @param message                           Message instance.
     * @param options                           Options to use.
     */
    constructor(message?: string, options?: ErrorOptions) {
        const proto = new.target.prototype;
        super(message, options);
        this.__proto__ = proto;
    }
}
