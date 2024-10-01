/** Byte-Based Utilities. */
export namespace Bytes {
    //  TYPEDEFS  //

    /** Internal Cast Mapping. */
    export interface Cast {
        readonly bool: boolean[];
        readonly i16: number[];
        readonly u16: number[];
    }

    /** Endianess Available. */
    export type Endianess = 'BE' | 'LE';

    //  PROPERTIES  //

    /** Coordinates casting to values as necessary. */
    const m_to: { [C in keyof Cast]: (buffer: Buffer, endianess?: Endianess) => Cast[C] } = {
        bool: (buffer) => {
            const buf = Buffer.from(buffer);
            const out: boolean[] = [];

            for (let ii = 0; ii < buf.length * 8; ii++) {
                const pos = ii % 8;
                const cbi = Math.floor(ii / 8);
                const cb = buf.readUint8(cbi);
                const value = (cb & Math.pow(2, pos)) > 0;
                out.push(value ? true : false);
            }

            return out;
        },

        i16: (buffer, endianess = 'BE') => {
            const buf = Buffer.from(buffer);
            return m_range(0, buf.length, 2).map((ii) => buf[`readInt16${endianess}`](ii));
        },

        u16: (buffer, endianess = 'BE') => {
            const buf = Buffer.from(buffer);
            return m_range(0, buf.length, 2).map((ii) => buf[`readUint16${endianess}`](ii));
        },
    };

    /** Coordinates casting from values as necessary. */
    const m_from: { [C in keyof Cast]: (value: Cast[C], endianess?: Endianess) => Buffer } = {
        bool: (value) => {
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
        },

        i16: (value, endianess = 'BE') => {
            const buf = Buffer.alloc(value.length * 2);
            value.forEach((v, ii) => buf[`writeInt16${endianess}`](v & 0xffff, ii * 2));
            return buf;
        },

        u16: (value, endianess = 'BE') => {
            const buf = Buffer.alloc(value.length * 2);
            value.forEach((v, ii) => buf[`writeUInt16${endianess}`](v & 0xffff, ii * 2));
            return buf;
        },
    };

    //  PUBLIC METHODS  //

    /**
     * Casts a given input from a buffer.
     * @param cast                          Cast to coordinate.
     * @param buffer                        Buffer to cast.
     * @param endianess                     Optional endianess (default is BE).
     */
    export const to = <C extends keyof Cast>(cast: C, buffer: Buffer, endianess?: Endianess): Cast[C] =>
        m_to[cast](buffer, endianess);

    /**
     * Casts a given input to the desired buffer.
     * @param cast                          Cast to coordinate.
     * @param value                         Value to cast.
     * @param endianess                     Optional endianess (default is BE).
     */
    export const from = <C extends keyof Cast>(cast: C, value: Cast[C], endianess?: Endianess): Buffer =>
        m_from[cast](value, endianess);

    //  PRIVATE METHODS  //

    /**
     * Constructs a simply range value.
     * @param start                         Starting value.
     * @param end                           End value.
     * @param step                          Step to use.
     */
    const m_range = (start: number, end: number, step = 1) =>
        Array(Math.ceil((end - start) / step))
            .fill(void 0)
            .map((_, ii) => start + ii * step);
}
