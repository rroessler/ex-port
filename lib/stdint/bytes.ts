/// Modbus Imports
import { uint8_t, uint16_t, uint32_t, float_t, bool_t, buffer_t } from '.';

/// Buffer Manipulation.
export namespace Bytes {
    /**************
     *  TYPEDEFS  *
     **************/

    /** Helper Type Alias. */
    interface ICast<V, A extends any[]> {
        __value__: V;
        __args__: A;
    }

    /** Available Byte Casts. */
    export interface Casts {
        bool: ICast<bool_t[], [buffer_t]>;
        uint16: ICast<uint16_t[], [buffer_t, Endianess?]>;
    }

    /** Available Endianess. */
    export type Endianess = 'BE' | 'LE';

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Casts the given values (based on kind) to a buffer.
     * @param kind                      Kind to convert from.
     * @param value                     Value to convert.
     * @param endianess                 Optional endianess.
     */
    export const from = <K extends keyof Casts>(kind: K, value: Casts[K]['__value__'], endianess?: Endianess): Buffer =>
        (<any>m_from)[kind](value, endianess);

    /**
     * Converts a given buffer (or other) to the value required.
     * @param kind                      Kind to convert to.
     * @param args                      Arguments to convert.
     */
    export const to = <K extends keyof Casts>(kind: K, ...args: Casts[K]['__args__']): Casts[K]['__value__'] =>
        (<any>m_to)[kind](...args);

    /*********************
     *  PRIVATE METHODS  *
     *********************/

    /** Casts from Values. */
    namespace m_from {
        /**
         * Casts an array of boolean values to a buffer.
         * @param value                 0|1 values to convert.
         */
        export const bool = (value: bool_t[]) => {
            const count = Math.ceil(value.length / 8);
            const buf = Buffer.alloc(count);

            for (let ii = 0; ii < value.length; ii++) {
                const o8 = Math.floor(ii / 8);
                const o1 = ii % 8;
                let byte = buf.readUint8(o8);
                byte += value[ii] ? Math.pow(2, o1) : 0;
                buf.writeUint8(byte, o8);
            }

            return buf;
        };

        /**
         * Casts an array of UINT16 values to a buffer.
         * @param value                 Values to convert.
         * @param endianess             Endianess of UINT16.
         */
        export const uint16 = (value: uint16_t[], endianess: Endianess = 'BE') => {
            const buf = Buffer.alloc(value.length * 2);
            value.forEach((v, ii) => buf[`writeUint16${endianess}`](v & 0xffff, ii * 2));
            return buf;
        };
    }

    /** Casts to Values. */
    namespace m_to {
        /**
         * Casts a buffer-like value to a boolean array.
         * @param bufferLike            Buffer to convert.
         */
        export const bool = (bufferLike: buffer_t) => {
            const buf = Buffer.from(bufferLike);
            const out: bool_t[] = [];

            for (let ii = 0; ii < buf.length * 8; ii++) {
                const pos = ii % 8;
                const cbi = Math.floor(ii / 8);
                const cb = buf.readUint8(cbi);
                const value = (cb & Math.pow(2, pos)) > 0;
                out.push(value ? 1 : 0);
            }

            return out;
        };

        /**
         * Converts a buffer-like value to a UINT16 array.
         * @param bufferLike            Buffer to convert.
         * @param endianess             Endianess of UINT16.
         */
        export const uint16 = (bufferLike: buffer_t, endianess: Endianess = 'BE') => {
            const buf = Buffer.from(bufferLike);
            return range(0, buf.length, 2).map((ii) => buf[`readUint16${endianess}`](ii));
        };
    }

    /********************
     *  HELPER METHODS  *
     ********************/

    /**
     * Generates a range from `beg` => `end` with given step increment.
     * @param beg                           Starting value.
     * @param end                           Ending value.
     * @param step                          Incrementor.
     */
    export const range = (beg: number, end: number, step = 1) =>
        Array(Math.ceil((end - beg) / step))
            .fill(void 0)
            .map((_, y) => beg + y * step);
}
