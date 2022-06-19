/** Exception Utilities. */
export namespace Exception {
    /**************
     *  TYPEDEFS  *
     **************/

    /** Exception Generic Interface Alias. */
    export interface IGeneric<N extends string> extends Error {
        name: N;
    }

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Custom Error Factory.
     * @param name                  Name of error.
     */
    export const factory = <N extends string>(name: N) => {
        /** Default Error Proxy. */
        class ErrorProxy extends Error {
            constructor(message: string) {
                super(message);
                this.name = name;
            }
        }

        /// closure based error.
        return (message: string): IGeneric<N> => new ErrorProxy(message) as any;
    };
}
