/** Maybe Monad Functionality. */
export namespace Maybe {
    /**************
     *  TYPEDEFS  *
     **************/

    /** Maybe Pattern Type. */
    export type Pattern = 'some' | 'none';

    /** Either Some or None Type. */
    export interface IPerhaps<T> {
        is: <P extends Pattern>(p: P) => this is 'some' extends P ? ISome<T> : INone;
        unwrap: () => T;
    }

    /** Some Result Interface. */
    export interface ISome<T> extends IPerhaps<T> {}

    /** None Result Interface. */
    export interface INone extends IPerhaps<never> {}

    /********************
     *  IMPLEMENTATION  *
     ********************/

    /**
     * Some result generator.
     * @param v                 Result value.
     */
    export const Some = <T>(v: T): ISome<T> => ({
        is: <P extends Pattern>(p: P) => p === 'some',
        unwrap: () => v,
    });

    /** None result generator. */
    export const None = (): INone => ({
        is: <P extends Pattern>(p: P) => p === 'none',
        unwrap: () => {
            throw TypeError("Cannot call unwrap on 'none' monad.");
        },
    });
}
