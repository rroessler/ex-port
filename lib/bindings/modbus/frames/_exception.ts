/// Vendor Modules
import * as Monads from 'ts-monadable';

/// Ext-Port Imports
import { Codec } from '../../../codec';

/// Modbus Utils
import { BufferUtils } from '../utils/buffer';
import { ModbusError } from '../utils/error';

/// Modbus Imports
import { EC } from '../codes/error';
import { Protocol } from '../protocol';
import { Direction, Generic } from './abstract';

/** Exception - Frame */
export namespace Exception {
    /************
     *  FRAMES  *
     ************/

    /** `Exception` Implementation. */
    export class Frame<K extends Direction> extends Generic<'exception', K> {
        /**
         * Constructs an Exception frame with the given arguments.
         * @param kind                      Frame Direction.
         * @param ecode                     Error Code.
         */
        constructor(kind: K, public readonly ecode: EC.Value) {
            // inherit from the base generic frame
            super((kind === 'request' ? new Request() : new Response()) as any, 'exception', kind);
        }

        /********************
         *  PUBLIC METHODS  *
         ********************/

        /** Gets the associated error reason. */
        reason() {
            return EC.reason(this.ecode);
        }
    }

    /***********
     *  CODEC  *
     ***********/

    /** `Exception` Request Codec. */
    export class Request extends Codec.Abstract<Protocol.Simplex<'request'>> {
        /**
         * Encodes a request frame.
         * @param frame                 Frame to encode.
         */
        encode(frame: Frame<'request'>): Monads.Maybe<Buffer> {
            const payload = Buffer.alloc(2);
            payload.writeUint8(frame.code, 0);
            payload.writeUint8(frame.ecode, 1);
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
                if (code > 0x2b) throw ModbusError('Frame::Exception<"request"> decoded an illegal function code');
                return Monads.Some(new Frame('request', 0x01));
            });
        }
    }

    /** `Exception` Response Codec. */
    export class Response extends Codec.Abstract<Protocol.Simplex<'response'>> {
        /**
         * Encodes a request frame.
         * @param frame                 Frame to encode.
         */
        encode(frame: Frame<'response'>): Monads.Maybe<Buffer> {
            const payload = Buffer.alloc(2);
            payload.writeUint8(frame.code + 0x80, 0);
            payload.writeUint8(frame.ecode, 1);
            return Monads.Some(payload);
        }

        /**
         * Decodes a request frame buffer.
         * @param buffer                Buffer to attempt decoding.
         * @param encoding              Optional encoding.
         */
        decode(buffer: Buffer, encoding?: BufferEncoding): Monads.Maybe<Frame<'response'>> {
            return BufferUtils.safeAccess(Monads.None(), () => {
                const code = buffer.readUint8(0) - 0x80;
                const ecode = buffer.readUint8(1);
                if (code > 0x2b) throw ModbusError('Frame::Exception<"response"> decoded an illegal function code');
                return Monads.Some(new Frame('response', ecode as EC.Value));
            });
        }
    }
}
