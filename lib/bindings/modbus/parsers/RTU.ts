/// Native Modules
import { TransformOptions } from 'stream';

/// Ext-Port Utils
import { Maybe } from '../../../utils/maybe';

/// Ext-Port Imports
import { Codec } from '../../../codec';
import { Protocol } from '../protocol';
import { CRC } from '../../../checksum';

/// Modbus Utils
import { BufferUtils } from '../utils/buffer';
import { ModbusError } from '../utils/error';

/// Modbus Imports
import { Client } from './client';
import { Response } from '../frames/response';

/**************
 *  TYPEDEFS  *
 **************/

/** RTU Constructor Options. */
export interface IRTU extends TransformOptions {
    target: number;
    flushRate?: number;
}

/***********
 *  CODEC  *
 ***********/

/** RTU Codec Implementaiton. */
class _Codec_impl extends Codec.Abstract<Protocol.Full> {
    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Encodes a RTU request frame.
     * @param target                        Target Device.
     * @param frame                         Request Frame to Encode.
     */
    encode(target: number, frame: Protocol.Data<'request'>): Maybe.IPerhaps<Buffer> {
        const request = frame.buffer();
        const payload = Buffer.alloc(request.length + 1);

        // combine the required request and target details
        payload.writeUint8(target);
        request.copy(payload, 1, 0, payload.length);

        // generate the required CRC16 for Modbus
        const crc = Buffer.alloc(2);
        crc.writeUint16LE(CRC.modbus.fast(payload));

        // finally concatenate the resulting message
        return Maybe.Some(Buffer.concat([payload, crc]));
    }

    /**
     * Decodes a RTU response frame.
     * @param buffer                        Buffer to decode.
     * @param encoding                      Optional encoding.
     */
    decode(buffer: Buffer, encoding?: BufferEncoding): Maybe.IPerhaps<Protocol.Incoming> {
        return BufferUtils.safeAccess(Maybe.None(), () => {
            // ensure the buffer we have is a valid size
            if (buffer.length < 1) throw ModbusError('RTU::decode failed to parse an empty buffer');

            // read the target adress and PDU
            const target = buffer.readUint8();
            const PDU = buffer.slice(1, -2);

            // generate the required response body
            const result = Response.from(PDU);
            if (result.is('none')) return Maybe.None();

            // now ensure the CRC is valid against the PDU
            const crc = buffer.readUint16LE(buffer.length - 2);
            if (CRC.modbus.fast(buffer.slice(0, -2)) !== crc) return Maybe.None();

            // return the combined result
            return Maybe.Some({ target, response: result.unwrap() as any });
        });
    }
}

/************
 *  PARSER  *
 ************/

/** RTU Protocol Parser. */
export class RTU extends Client {
    /****************
     *  PROPERTIES  *
     ****************/

    /** Internal RTU buffer. */
    private m_buffer = Buffer.alloc(0);

    /** Internal RTU Flush-Rate. */
    private m_flushRate: number;

    /** Internal flush timeout. */
    private m_timeout: NodeJS.Timeout = null as any;

    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Coordinates constructing an RTU parser.
     * @param options                       RTU Options.
     */
    constructor(options: IRTU) {
        const { target, flushRate = 250, ...rest } = options;
        super(target, 'RTU', new _Codec_impl(), rest); // inherit from the base client

        // set the internal flush-rate
        this.m_flushRate = flushRate;
    }

    /*********************
     *  PRIVATE METHODS  *
     *********************/

    /**
     * RTU Transformer.
     * @param chunk                     Chunk to transform.
     * @param encoding                  Encoding to transform with.
     */
    protected m_transform(chunk: Buffer, encoding: BufferEncoding): Maybe.IPerhaps<Protocol.Incoming[]> {
        this.m_resetTimeout(); // reset the current transform time-out
        this.m_buffer = Buffer.concat([this.m_buffer, chunk]); // join the buffers
        const pushable: Protocol.Incoming[] = []; // incoming responses

        do {
            // attempt decoding the current buffer
            const result = this.codec.decode(this.m_buffer, encoding);

            // if we have a null response, then ignore the bad data
            if (result.is('none')) break;

            // destructure the response details
            const { response, target } = result.unwrap();

            // remove the buffer size found
            this.m_buffer = this.m_buffer.slice(response.buffer().length + 3);

            // emit this response using the target and function code
            pushable.push({ response, target });
        } while (1);

        // and return the resulting items
        return Maybe.Some(pushable);
    }

    /** RTU Flusher. */
    protected m_flush(): Maybe.IPerhaps<Protocol.Incoming[]> {
        this.m_buffer = Buffer.alloc(0);
        return Maybe.None();
    }

    /** Resets an internal timeout for flushing Modbus data. */
    private m_resetTimeout() {
        clearTimeout(this.m_timeout);
        this.m_timeout = setTimeout(() => this.m_flush(), this.m_flushRate);
    }
}
