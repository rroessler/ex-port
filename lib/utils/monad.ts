/** Monad Functionality. */
export namespace Monad {
    /**************
     *  TYPEDEFS  *
     **************/

    /** Available Result Outcomes. */
    export type Outcome = 'okay' | 'error';

    /** Base Matcher Interface. */
    export interface IResultMatcher<T, E, U> {
        readonly okay: (v: T) => U;
        readonly error: (e: E) => U;
    }

    /** Basic Result Interface. */
    export interface IResult<T, E> {
        is<O extends Outcome>(kind: O): this is 'okay' extends O ? IOkay<T, E> : IError<T, E>;
        unwrap(): T | E;
        or(next: T): T;
        match<U>(fn: IResultMatcher<T, E, U>): U;
    }

    /** Okay Result Interface. */
    export interface IOkay<T, E = never> extends IResult<T, E> {
        unwrap(): T;
        match<U>(fn: IResultMatcher<T, never, U>): U;
    }

    /** Error Result Interface. */
    export interface IError<T, E> extends IResult<T, E> {
        unwrap(): E;
        match<U>(fn: IResultMatcher<never, E, U>): U;
    }

    /********************
     *  IMPLEMENTATION  *
     ********************/

    /**
     * Monadic Okay Result.
     * @param v                 Okay value.
     */
    export const Okay = <T>(v: T): IOkay<T> => ({
        is: <O extends Outcome>(kind: O) => kind === 'okay',
        unwrap: () => v,
        or: (_: T) => v,
        match: <U>(fn: IResultMatcher<T, never, U>) => fn.okay(v),
    });

    /**
     * Monadic Error Result.
     * @param e                 Error item.
     */
    export const Error = <T, E>(e: E): IError<T, E> => ({
        is: <O extends Outcome>(kind: O) => kind === 'error',
        unwrap: () => e,
        or: (next: T) => next,
        match: <U>(fn: IResultMatcher<never, E, U>) => fn.error(e),
    });

    /**
     * Constructs a voided implementation.
     * @param kind              Kind of void result.
     */
    export const Void = <O extends Outcome>(kind: O) =>
        kind === 'okay' ? Okay<void>(void 0) : Error<any, void>(void 0);
}
