/// Modbus Utils
import { ModbusError } from '../utils/error';

/// Modbus Modules
import { Codec } from '../../../codec';
import { FC } from '../codes/function';
import { Protocol } from '../protocol';

/**************
 *  TYPEDEFS  *
 **************/

/** Modbus Frame Direction. */
export type Direction = 'request' | 'response';

/*****************
 *  ABSTRACTION  *
 *****************/

/** Generic Frame Class. */
export abstract class Generic<N extends FC.Name, K extends Direction> {
    /****************
     *  PROPERTIES  *
     ****************/

    /** Fixed Function Code. */
    readonly code: FC.Value;

    /** Denotes if the internal buffer is ready. */
    private m_ready = false;

    /** Encoded Frame Buffer. */
    private m_buffer = Buffer.alloc(0);

    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Base Modbus frame constructor.
     * @param codec                     Direction Codec.
     * @param name                      Name of function code.
     * @param kind                      Kind of frame.
     * @param eflag                     If the exception flag is set.
     */
    constructor(
        public readonly codec: Codec.Abstract<Protocol.Simplex<K>>,
        public readonly name: N,
        public readonly kind: K,
        public readonly eflag = false
    ) {
        this.code = FC.code(name);
    }

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /** Gets the internally encoded buffer. */
    buffer() {
        // if already complete, return as normal
        if (this.m_ready) return this.m_buffer;

        // attempt encoding the frame
        const buffer = this.codec.encode(this as any);

        // ensure the encoded buffer is valid
        if (buffer.is('none')) throw new TypeError('Could not encode Modbus::Frame');

        this.m_buffer = buffer.unwrap();
        this.m_ready = true;
        return this.m_buffer;
    }

    /**
     * Asserts a function code for a required frame.
     * @param given                         Given code.
     * @param expect                        Code to expect.
     * @param kind                          Kind of frame.
     */
    static assertCode(given: any, expect: FC.Value, kind: Direction) {
        if (given !== expect) throw ModbusError(`Invalid function code for frame FC${expect}<"${kind}">`);
    }
}
