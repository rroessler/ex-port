export namespace Delay {
    /**************
     *  TYPEDEFS  *
     **************/

    /** Async Delay Interface. */
    export interface ISleep {
        <T = void>(duration: number, next?: T): Promise<T>;
    }

    /** Blocking Delay Interface. */
    export interface IBlocking {
        (duration: number): void;
    }

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Asynchronous sleep implementation. Allows pass-through of an optional value.
     * @param duration                          Duration to sleep for.
     * @param next                              Optional pass-through value.
     */
    export const sleep: ISleep = <T = void>(duration: number, next: T = void 0 as unknown as T) => {
        m_assertDuration(duration);
        return new Promise<T>((resolve) => setTimeout(() => resolve(next), duration));
    };

    /**
     * Synchronous delay implementation.
     * @param duration                          Duration to block execution for.
     */
    export const blocking = (duration: number) => {
        m_assertDuration(duration);
        const eventually = new Date().getTime() + duration;
        while (eventually > new Date().getTime());
    };

    /*********************
     *  PRIVATE METHODS  *
     *********************/

    /**
     * Ensures the given duration is valid.
     * @param duration                  Duration to assert.
     */
    const m_assertDuration = (duration: number) => {
        if (duration < 0) throw new RangeError('Duration must be postive');
    };
}
