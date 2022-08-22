/// Vendor Modules
import * as Monads from 'ts-monadable';

/// Ext-Port Imports
import { Codec } from '../../../codec';
import { bool_t } from '../../../stdint';

/// Modbus Utils
import { BufferUtils } from '../utils/buffer';

/// Modbus Imports
import { Protocol } from '../protocol';
import { Direction, Generic } from './abstract';

/**************
 *  TYPEDEFS  *
 **************/

/** Write Single Coil - Arguments Interface. */
export interface IWriteSingleCoil {
    request: { start: number; value: bool_t };
    response: { address: number; value: bool_t };
}

/********************
 *  IMPLEMENTATION  *
 ********************/

/** Write Single Coil - Frame. */
export namespace FC5 {
    /************
     *  FRAMES  *
     ************/

    /** `FC5` Implementation. */
    export class Frame<K extends Direction> extends Generic<'write-single-coil', K> {
        /**
         * Constructs a FC5 frame with the given arguments.
         * @param kind                      Frame Direction.
         * @param args                      Arguments to Encode.
         */
        constructor(kind: K, public readonly args: IWriteSingleCoil[K]) {
            // inherit from the base generic frame
            super((kind === 'request' ? new Request() : new Response()) as any, 'write-single-coil', kind);
        }
    }

    /***********
     *  CODEC  *
     ***********/

    /** `FC5` Request Codec. */
    export class Request extends Codec.Abstract<Protocol.Simplex<'request'>> {
        /**
         * Encodes a request frame.
         * @param frame                 Frame to encode.
         */
        encode(frame: Frame<'request'>): Monads.Maybe<Buffer> {
            const { start, value } = frame.args;
            const payload = Buffer.alloc(5);
            payload.writeUint8(frame.code, 0);
            payload.writeUint16BE(start, 1);
            payload.writeUint16BE(value ? 0xff00 : 0x000, 3);
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
                const value = buffer.readUint16BE(3) === 0xff00 ? 1 : 0;
                Generic.assertCode(code, 5, 'request');
                return Monads.Some(new Frame('request', { start, value }));
            });
        }
    }

    /** `FC5` Response Codec. */
    export class Response extends Codec.Abstract<Protocol.Simplex<'response'>> {
        /**
         * Encodes a request frame.
         * @param frame                 Frame to encode.
         */
        encode(frame: Frame<'response'>): Monads.Maybe<Buffer> {
            const { address, value } = frame.args;
            const payload = Buffer.alloc(5);
            payload.writeUInt8(frame.code, 0);
            payload.writeUint16BE(address, 1);
            payload.writeUint16BE(value ? 0xff00 : 0x0000, 3);
            return Monads.Some(payload);
        }

        /**
         * Decodes a request frame buffer.
         * @param buffer                Buffer to attempt decoding.
         * @param encoding              Optional encoding.
         */
        decode(buffer: Buffer, encoding?: BufferEncoding): Monads.Maybe<Frame<'response'>> {
            return BufferUtils.safeAccess(Monads.None(), () => {
                const code = buffer.readUint8(0);
                const address = buffer.readUint16BE(1);
                const value = buffer.readUint16BE(3) === 0xff00 ? 1 : 0;
                Generic.assertCode(code, 5, 'response');
                return Monads.Some(new Frame('response', { address, value }));
            });
        }
    }
}
