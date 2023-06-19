/// Node Modules
import stream from 'node:stream';

//// Package Modules
import { Bus } from '../bus';
import { Codec } from '../codec';
import { IOptions } from './options';

/** Parser Facade Interface. */
export interface Facade<B extends Bus.Any> extends stream.Transform {
    codec?: Codec.Abstract<B>;
}

/** Parser Abstraction. */
export abstract class Abstract<B extends Bus.Any> extends stream.Transform implements Facade<B> {
    //  GETTERS x SETTERS  //

    /** Gets the underlying codec instance. */
    get codec() {
        return this.m_codec;
    }

    //  CONSTRUCTORS  //

    /**
     * Constructs a parser instance.
     * @param m_codec                       Codec to use.
     * @param options                       Transform options.
     */
    constructor(private readonly m_codec: Codec.Abstract<B>, options?: IOptions) {
        super(options);
    }

    //  PUBLIC METHODS  //

    /**
     * Outward facing `_transform` handler.
     * @param callback                      Transformation callback.
     */
    override _transform(chunk: any, encoding: BufferEncoding, callback: stream.TransformCallback) {
        const results = this.m_transform(Buffer.from(chunk), encoding);
        results.forEach((item) => this.push(this.m_codec.serialize(item)));
        return callback(); // and declare as complete now
    }

    /**
     * Outward facing `_flush` handler.
     * @param callback                      Transformation callback.
     */
    override _flush(callback: stream.TransformCallback) {
        const results = this.m_flush();
        results.forEach((item) => this.push(this.m_codec.serialize(item)));
        return callback(); // and declare as complete now
    }

    //  PRIVATE METHODS  //

    /**
     * Handles transforming incoming data.
     * @param chunk                         Chunk to transform.
     * @param encoding                      Buffer encoding.
     */
    protected abstract m_transform(chunk: Buffer, encoding: BufferEncoding): B['incoming'][];

    /** Flushes all final values. */
    protected abstract m_flush(): B['incoming'][];
}
