/// Vendor Modules
import __crc__ from 'crc/crc16modbus';

/// Package Modules
import { Code } from '../code';
import { Frame } from '../frame';
import { Packet } from '../types';
import { Bus } from '../../../bus';
import { Codec } from '../../../codec';
import { Utils } from '../../../utils';

/** Request RTU Codec Implementation. */
export class Request extends Codec.Complex<Bus<Packet.Outgoing<true>, Packet.Outgoing>> {
    //  PROPERTIES  //

    /** Encoder Implementation. */
    private readonly m_encoder = new Request.Encoder();

    /** Decoder Implementation. */
    private readonly m_decoder = new Request.Decoder();

    //  PUBLIC METHODS  //

    /**
     * Handles encoding request packets.
     * @param packet                        Packet to encode.
     */
    override encode({ target, request }: Packet.Outgoing): Buffer {
        // get the current request buffer to be used
        const buffer = this.m_encoder[request.code](request as any);
        const payload = Buffer.alloc(buffer.length + 1);

        // combine the required request and target details
        payload.writeUInt8(target);
        buffer.copy(payload, 1, 0, payload.length);

        // generate the required CRC value for mod-bus
        const crc = Buffer.alloc(2);
        crc.writeUInt16LE(__crc__(payload));

        // finally concatenate the result
        return Buffer.concat([payload, crc]);
    }

    /**
     * Handles decoding request packets.
     * @param buffer                        Buffer to decode.
     */
    override decode(buffer: Buffer): Packet.Outgoing<true> {
        // ensure our packet is of valid size
        if (buffer.length < 2) return { target: -1, request: Request.exception(-1, Code.Exception.DECODE_FAILURE) };

        // attempt reading the address, function-code and body
        const target = buffer.readUInt8();
        const code = buffer.readUInt8(1);
        const PDU = buffer.subarray(2, -2);

        // ensure the crc is valid for the payload
        const crc = buffer.readUInt16LE(buffer.length - 2);
        const invalid = __crc__(buffer.subarray(0, -2)) !== crc;
        if (invalid) return { target, request: Request.exception(code, Code.Exception.INVALID_CRC) };

        // ensure we have a valid request
        if (code > 0x2b) return { target, request: Request.exception(code, Code.Exception.ILLEGAL_FUNCTION) };

        // cast the code to a valid function-code
        const fc = code as Exclude<Code.Function, Code.Function.EXCEPTION>;

        // return the decoded request
        return { target, request: (<any>this.m_decoder[fc])(fc, PDU) };
    }
}

//  NAMESPACES  //

export namespace Request {
    //  PUBLIC METHODS  //

    /**
     * Constructs simple exception frames.
     * @param code                              Function code.
     * @param error                             Exception code.
     */
    export const exception = (code: number, error: Code.Exception) =>
        new Frame.Generic(Code.Function.EXCEPTION, Frame.Direction.REQUEST, { code, error });

    //  IMPLEMENTATIONS  //

    /** Encoder Implementations. */
    export class Encoder implements Omit<Frame.Codec.Encoder<Frame.Direction.REQUEST>, Code.Function.EXCEPTION> {
        //  PUBLIC METHODS  //

        [Code.Function.READ_COILS](frame: Frame.Request<Code.Function.READ_COILS>) {
            return this.m_range(frame.code, frame.data);
        }

        [Code.Function.READ_DISCRETE_INPUTS](frame: Frame.Request<Code.Function.READ_DISCRETE_INPUTS>) {
            return this.m_range(frame.code, frame.data);
        }

        [Code.Function.READ_HOLDING_REGISTERS](frame: Frame.Request<Code.Function.READ_HOLDING_REGISTERS>) {
            return this.m_range(frame.code, frame.data);
        }

        [Code.Function.READ_INPUT_REGISTERS](frame: Frame.Request<Code.Function.READ_INPUT_REGISTERS>) {
            return this.m_range(frame.code, frame.data);
        }

        [Code.Function.WRITE_SINGLE_COIL](frame: Frame.Request<Code.Function.WRITE_SINGLE_COIL>) {
            return this.m_value(frame.code, frame.data);
        }

        [Code.Function.WRITE_SINGLE_REGISTER](frame: Frame.Request<Code.Function.WRITE_SINGLE_REGISTER>) {
            return this.m_value(frame.code, frame.data);
        }

        [Code.Function.WRITE_MULTIPLE_COILS](frame: Frame.Request<Code.Function.WRITE_MULTIPLE_COILS>) {
            return this.m_array(frame.code, frame.data, true);
        }

        [Code.Function.WRITE_MULTIPLE_REGISTERS](frame: Frame.Request<Code.Function.WRITE_MULTIPLE_REGISTERS>) {
            return this.m_array(frame.code, frame.data, false);
        }

        //  PRIVATE METHODS  //

        /**
         * Constructs a suitable range-payload.
         * @param code                          Code to use.
         * @param data                          Data to payload.
         */
        private m_range(code: Code.Function, { start, quantity }: Frame.Data.Range): Buffer {
            const payload = Buffer.alloc(5);
            payload.writeUInt8(code, 0);
            payload.writeUInt16BE(start, 1);
            payload.writeUInt16BE(quantity, 3);
            return payload;
        }

        /**
         * Constructs a value-based payload.
         * @param code                          Code to use.
         * @param data                          Data to payload.
         */
        private m_value(code: Code.Function, { start, value }: { start: number; value: boolean | number }) {
            const payload = Buffer.alloc(5);
            payload.writeUInt8(code, 0);
            payload.writeUInt16BE(start, 1);
            payload.writeUInt16BE(typeof value === 'boolean' ? (value ? 0xff00 : 0x0000) : value, 3);
            return payload;
        }

        /**
         * Handles encoding array-based payloads.
         * @param code                          Code to use.
         * @param data                          Data to payload.
         * @param bool                          Boolean type-flag.
         */
        private m_array(
            code: Code.Function,
            { start, array }: { start: number; array: Array<boolean | number> },
            bool: boolean
        ) {
            const values = Utils.Bytes.from(bool ? 'bool' : 'u16', array as any);
            const quantity = array.length;
            const count = 6 + values.length;

            const payload = Buffer.alloc(count);
            payload.writeUInt8(code, 0);
            payload.writeUInt16BE(start, 1);
            payload.writeUInt16BE(quantity, 3);
            payload.writeUInt8(values.length, 5);
            values.copy(payload, 6, 0, count);
            return payload;
        }
    }

    /** Decoder Implementations. */
    export class Decoder implements Omit<Frame.Codec.Decoder<Frame.Direction.REQUEST>, Code.Function.EXCEPTION> {
        //  PUBLIC METHODS  //

        [Code.Function.READ_COILS](code: Code.Function.READ_COILS, buffer: Buffer) {
            return this.m_range(code, buffer);
        }

        [Code.Function.READ_DISCRETE_INPUTS](code: Code.Function.READ_DISCRETE_INPUTS, buffer: Buffer) {
            return this.m_range(code, buffer);
        }

        [Code.Function.READ_HOLDING_REGISTERS](code: Code.Function.READ_HOLDING_REGISTERS, buffer: Buffer) {
            return this.m_range(code, buffer);
        }

        [Code.Function.READ_INPUT_REGISTERS](code: Code.Function.READ_INPUT_REGISTERS, buffer: Buffer) {
            return this.m_range(code, buffer);
        }

        [Code.Function.WRITE_SINGLE_COIL](code: Code.Function.WRITE_SINGLE_COIL, buffer: Buffer) {
            return this.m_value(code, buffer, true);
        }

        [Code.Function.WRITE_SINGLE_REGISTER](code: Code.Function.WRITE_SINGLE_REGISTER, buffer: Buffer) {
            return this.m_value(code, buffer, false);
        }

        [Code.Function.WRITE_MULTIPLE_COILS](code: Code.Function.WRITE_MULTIPLE_COILS, buffer: Buffer) {
            return this.m_array(code, buffer, true);
        }

        [Code.Function.WRITE_MULTIPLE_REGISTERS](code: Code.Function.WRITE_MULTIPLE_REGISTERS, buffer: Buffer) {
            return this.m_array(code, buffer, false);
        }

        //  PRIVATE METHODS  //

        /**
         * Handles constructing range-based decoding.
         * @param code                                  Function code.
         * @param buffer                                Buffer to decode.
         */
        private m_range<C extends Code.Function>(code: C, buffer: Buffer): Frame.Request<C | Code.Function.EXCEPTION> {
            if (buffer.length !== 4) return exception(code, Code.Exception.DECODE_FAILURE);
            const start = buffer.readUInt16BE(0);
            const quantity = buffer.readUInt16BE(2);
            return new Frame.Generic(code, Frame.Direction.REQUEST, { start, quantity } as any);
        }

        /**
         * Handles constructing value-based decoding.
         * @param code                                  Function code.
         * @param buffer                                Buffer to decode.
         * @param bool                                  Expect boolean flag.
         */
        private m_value<C extends Code.Function>(
            code: C,
            buffer: Buffer,
            bool: boolean
        ): Frame.Request<C | Code.Function.EXCEPTION> {
            if (buffer.length !== 4) return exception(code, Code.Exception.DECODE_FAILURE);
            const start = buffer.readUInt16BE(0);
            const value = buffer.readUInt16BE(2);
            return new Frame.Generic(code, Frame.Direction.REQUEST, {
                start,
                value: bool ? value === 0xff00 : value,
            } as any);
        }

        private m_array<C extends Code.Function>(
            code: C,
            buffer: Buffer,
            bool: boolean
        ): Frame.Request<C | Code.Function.EXCEPTION> {
            // ensure we have a valid initial length
            if (buffer.length < 5) return exception(code, Code.Exception.DECODE_FAILURE);

            const start = buffer.readUInt16BE(0);
            const count = buffer.readUInt8(4);

            // ensure the buffer is now fully formed
            if (buffer.length !== 5 + count) return exception(code, Code.Exception.DECODE_FAILURE);

            // and construct the resulting details
            const values = buffer.subarray(5, 5 + count);
            const array = Utils.Bytes.to(bool ? 'bool' : 'u16', values);
            return new Frame.Generic(code, Frame.Direction.REQUEST, { start, array } as any);
        }
    }
}
