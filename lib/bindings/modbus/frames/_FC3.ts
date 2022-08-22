/// Vendor Modules
import * as Monads from 'ts-monadable';

/// Ext-Port Utils
import { Bytes } from '../../../stdint/bytes';

/// Ext-Port Imports
import { Codec } from '../../../codec';
import { uint16_t } from '../../../stdint';

/// Modbus Utils
import { BufferUtils } from '../utils/buffer';

/// Modbus Imports
import { Protocol } from '../protocol';
import { Direction, Generic } from './abstract';

/**************
 *  TYPEDEFS  *
 **************/

/** Read Holding Registers - Arguments Interface. */
export interface IReadHoldingRegisters {
    request: { start: number; quantity: number };
    response: { values: uint16_t[] };
}

/********************
 *  IMPLEMENTATION  *
 ********************/

/** Read Holding Registers - Frame. */
export namespace FC3 {
    /************
     *  FRAMES  *
     ************/

    /** `FC3` Implementation. */
    export class Frame<K extends Direction> extends Generic<'read-holding-registers', K> {
        /**
         * Constructs a FC3 frame with the given arguments.
         * @param kind                      Frame Direction.
         * @param args                      Arguments to Encode.
         */
        constructor(kind: K, public readonly args: IReadHoldingRegisters[K]) {
            // inherit from the base generic frame
            super((kind === 'request' ? new Request() : new Response()) as any, 'read-holding-registers', kind);
        }
    }

    /***********
     *  CODEC  *
     ***********/

    /** `FC3` Request Codec. */
    export class Request extends Codec.Abstract<Protocol.Simplex<'request'>> {
        /**
         * Encodes a request frame.
         * @param frame                 Frame to encode.
         */
        encode(frame: Frame<'request'>): Monads.Maybe<Buffer> {
            const { start, quantity } = frame.args;
            const payload = Buffer.alloc(5);
            payload.writeUint8(frame.code, 0);
            payload.writeUint16BE(start, 1);
            payload.writeUint16BE(quantity, 3);
            return Monads.Some(payload);
        }

        /**
         * Decodes a request frame buffer.
         * @param buffer                Buffer to attempt decoding.
         * @param encoding              Optional encoding.
         */
        decode(buffer: Buffer, encoding?: BufferEncoding): Monads.Maybe<Frame<'request'>> {
            return BufferUtils.safeAccess(Monads.None(), () => {
                const code = buffer.readUint8(0);
                const start = buffer.readUint16BE(1);
                const quantity = buffer.readUint16BE(3);
                Generic.assertCode(code, 3, 'request');
                return Monads.Some(new Frame('request', { start, quantity }));
            });
        }
    }

    /** `FC3` Response Codec. */
    export class Response extends Codec.Abstract<Protocol.Simplex<'response'>> {
        /**
         * Encodes a request frame.
         * @param frame                 Frame to encode.
         */
        encode(frame: Frame<'response'>): Monads.Maybe<Buffer> {
            const { values } = frame.args;
            const vbuf = Bytes.from('uint16', values);
            const payload = Buffer.alloc(2);
            payload.writeUint8(frame.code, 0);
            payload.writeUint8(vbuf.length, 1);
            return Monads.Some(Buffer.concat([payload, vbuf]));
        }

        /**
         * Decodes a request frame buffer.
         * @param buffer                Buffer to attempt decoding.
         * @param encoding              Optional encoding.
         */
        decode(buffer: Buffer, encoding?: BufferEncoding): Monads.Maybe<Frame<'response'>> {
            return BufferUtils.safeAccess(Monads.None(), () => {
                const code = buffer.readUint8(0);
                const count = buffer.readUint8(1);
                const vbuf = buffer.slice(2, 2 + count);
                Generic.assertCode(code, 3, 'response');
                return Monads.Some(new Frame('response', { values: Bytes.to('uint16', vbuf) }));
            });
        }
    }
}
