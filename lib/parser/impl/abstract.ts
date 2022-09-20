import { Transform, TransformCallback, TransformOptions } from 'stream';

/// Vendor Modules
import * as Monads from 'ts-monadable';
/// Ext-Port Modules
import { Codec } from '../../codec';
import { Protocol } from '../../codec/protocol';

/**************
 *  TYPEDEFS  *
 **************/

/** Core Parser Interface. */
export interface IParser<P extends Protocol.Any> extends Transform {
    readonly codec: Codec.ICodec<P>;

    readonly _flush: (callback: TransformCallback) => void;
    readonly _transform: (chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) => void;
}

/********************
 *  IMPLEMENTATION  *
 ********************/

/** Default Parser Abstraction. */
export abstract class Abstract<P extends Protocol.Any = Protocol.Default> extends Transform implements IParser<P> {
    /******************
     *  CONSTRUCTORS  *
     ******************/

    /**
     * Constructs a parser implementation with a given code.
     * @param codec                         Codec to wrap.
     * @param options                       Transform options.
     */
    constructor(public readonly codec: Codec.ICodec<P>, options?: TransformOptions) {
        super({ ...options, defaultEncoding: codec.encoding }); // inherit from the base transform instance
    }

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Overriden transform implementation.
     * @param chunk                     Chunk to transform.
     * @param encoding                  Encoding to use.
     * @param callback                  Transform callback.
     */
    override _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
        // call the user-defined transformation method
        this.m_transform(chunk, encoding)
            .map((result) => result.map((item) => (this.codec.bufferize ? this.codec.itob(item) : (item as Buffer))))
            .map((pushable) => (pushable.forEach((item) => this.push(item)), callback()));
    }

    /**
     * Overriden flush implementation.
     * @param callback                  Transform callback.
     */
    override _flush(callback: TransformCallback) {
        this.m_flush()
            .map((result) => result.map((item) => (this.codec.bufferize ? this.codec.itob(item) : (item as Buffer))))
            .map((pushable) => (pushable.forEach((item) => this.push(item)), callback()));
    }

    /*********************
     *  PRIVATE METHODS  *
     *********************/

    /** User-implemented transform method. */
    protected abstract m_transform(chunk: Buffer, encoding: BufferEncoding): Monads.Maybe<P['incoming'][]>;

    /** User-implemented flusher. */
    protected abstract m_flush(): Monads.Maybe<P['incoming'][]>;
}
