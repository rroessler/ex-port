/// Native Modules
import { TransformOptions } from 'stream';

/// Ext-Port Imports
import { Abstract } from './abstract';
import { Codec, Protocol } from '../../codec';
import { Maybe } from '../../utils/maybe';

/**************
 *  TYPEDEFS  *
 **************/

/** Delimiter Parser Options. */
export interface IDelimiterOptions extends TransformOptions {
    delim: string | Buffer | number[];
    include?: boolean;
}

/********************
 *  IMPLEMENTATION  *
 ********************/

/** Delimiter Parser Implementation. */
export class Delimiter extends Abstract {
    /****************
     *  PROPERTIES  *
     ****************/

    delim: Buffer; // Internal Delimiter.
    include: boolean; // Whether to include the delimiter.
    private m_buffer: Buffer = Buffer.alloc(0); // Internal Transform Buffer.

    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Constructs a new instance of a delimiter.
     * @param params                        Delimiter Options.
     */
    constructor({ delim, include = false, ...opts }: IDelimiterOptions) {
        super(new Codec.PassThrough(), opts); // inherit from base class

        // ensure we have a delimiter and it is valid
        if (delim === undefined) throw new TypeError('Invalid "delim" property for Parser::Delimiter');
        if (delim.length === 0) throw new TypeError('Parser::Delimiter "delim" property has an invalid length');

        // assign the given options
        this.delim = Buffer.from(delim);
        this.include = include;
    }

    /*********************
     *  PRIVATE METHODS  *
     *********************/

    /**
     * Transforms incoming chunks into a series of pushable delimited sequences.
     * @param chunk                             Chunk to transform.
     * @param encoding                          Chunk encoding.
     */
    protected override m_transform(chunk: Buffer, encoding: BufferEncoding): Maybe.IPerhaps<Protocol.Incoming[]> {
        const pushable: Buffer[] = [];
        let data = Buffer.concat([this.m_buffer, chunk]);
        let pos: number;

        while ((pos = data.indexOf(this.delim)) !== -1) {
            pushable.push(data.slice(0, pos + (this.include ? this.delim.length : 0)));
            data = data.slice(pos + this.delim.length);
        }

        this.m_buffer = data;
        return Maybe.Some(pushable);
    }

    /** Coordinates flushing any trailing data. */
    protected override m_flush(): Maybe.IPerhaps<Protocol.Incoming[]> {
        const pushable = [Buffer.from(this.m_buffer)];
        this.m_buffer = Buffer.alloc(0);
        return Maybe.Some(pushable);
    }
}
