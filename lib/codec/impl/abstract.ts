/// Vendor Modules
import * as Monads from 'ts-monadable';

/// Ext-Port Modules
import { Protocol } from '../protocol';

/**************
 *  TYPEDEFS  *
 **************/

/** Codec Interface Agreement. */
export interface ICodec<P extends Protocol.Any> {
    readonly encoding: BufferEncoding;
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
    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Constructs a Codec abstraction with a desired outgoing encoding.
     * @param encoding                      Encoding to target.
     */
    constructor(public readonly encoding: BufferEncoding = 'binary') {}

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
}
