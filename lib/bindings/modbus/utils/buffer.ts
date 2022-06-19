/** Buffer Utilities. */
export namespace BufferUtils {
    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Safe buffer accessor. Wrap a callback in a range-accessor. Returns the default
     * value given as the result if any buffer-access exceeds the available range.
     * @param next                              Next value.
     * @param callback                          Callback to wrap.
     */
    export const safeAccess = <T>(next: T, callback: () => T): T => {
        try {
            return callback();
        } catch (err) {
            if (!(err instanceof RangeError)) throw err;
            return next;
        }
    };
}
