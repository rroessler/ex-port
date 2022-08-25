/// Vendor Modules
import * as Monads from 'ts-monadable';

/// Ext-Port Modules
import { Protocol } from '../protocol';

/**************
 *  TYPEDEFS  *
 **************/

/** Available Codec */
export interface IOptions {
    readonly bufferize: boolean;
    readonly encoding: BufferEncoding;
}

/** Codec Interface Agreement. */
export interface ICodec<P extends Protocol.Any> extends IOptions {
    itob(input: P['incoming']): Buffer;
    btoi(buffer: Buffer): P['incoming'];
    encode(...args: P['outgoing']): Monads.Maybe<Buffer>;
    decode(buffer: Buffer, encoding?: BufferEncoding): Monads.Maybe<P['incoming']>;
}

/** Codec Constructor Type Alias. */
export interface ICodecConstructor<P extends Protocol.Any> {
    new (encoding?: BufferEncoding): Abstract<P>;
}

/********************
 *  IMPLEMENTATION  *
 ********************/

/** Base Codec Declaration. */
export abstract class Abstract<P extends Protocol.Any = Protocol.Default> implements ICodec<P> {
    /****************
     *  PROPERTIES  *
     ****************/

    readonly bufferize: boolean = false; // Internal flag for bufferizing incoming data.
    readonly encoding: BufferEncoding = 'binary'; // Denotes the encoding to use.

    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Constructs a Codec abstraction with a desired outgoing encoding.
     * @param options                               Codec Options.
     */
    constructor(readonly options: Partial<IOptions> = {}) {
        Object.assign(this, options); // update the internal options
    }

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Encodes outgoing protocol data to a writable buffer.
     * @param args                          Arguments to encode.
     */
    abstract encode(...args: P['outgoing']): Monads.Maybe<Buffer>;

    /**
     * Decodes an incoming serial-buffer.
     * @param buffer                        Buffer to decode.
     */
    abstract decode(buffer: Buffer, encoding?: BufferEncoding): Monads.Maybe<P['incoming']>;

    /**
     * Converts a given input to a buffer.
     * @param input                         Incoming data to bufferize.
     */
    itob(input: P['incoming']): Buffer {
        if (<any>input instanceof Buffer) return input;
        return Buffer.from(JSON.stringify(input));
    }

    /**
     * Converts a buffer back into a desired incoming message.
     * @param buffer                        Data to re-form.
     */
    btoi(buffer: Buffer): P['incoming'] {
        return JSON.parse(buffer.toString());
    }
}
