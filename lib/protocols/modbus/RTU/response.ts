/// Vendor Modules
import __crc__ from 'crc/crc16modbus';

/// Package Modules
import { Code } from '../code';
import { Frame } from '../frame';
import { Packet } from '../types';
import { Bus } from '../../../bus';
import { Codec } from '../../../codec';
import { Utils } from '../../../utils';

/** Response RTU Codec Implementation. */
export class Response extends Codec.Complex<Bus.Simplex<Packet.Incoming>> {
    //  PROPERTIES  //

    /** Encoder Implementation. */
    private readonly m_encoder = new Response.Encoder();

    /** Decoder Implementation. */
    private readonly m_decoder = new Response.Decoder();

    //  PUBLIC METHODS  //

    /**
     * Handles encoding response packets.
     * @param packet                        Packet to encode.
     */
    override encode({ target, response }: Packet.Incoming): Buffer {
        // get the current request buffer to be used
        const buffer = this.m_encoder[response.code](response as any);
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
    override decode(buffer: Buffer): Packet.Incoming {
        // ensure our packet is of valid size
        if (buffer.length < 2) return { target: -1, response: Response.exception(-1, Code.Exception.DECODE_FAILURE) };

        // attempt reading the address, function-code and body
        const target = buffer.readUInt8();
        const code = buffer.readUInt8(1);
        const PDU = buffer.subarray(2, -2);

        // validate the incoming length expected
        if (!this.m_decoder.sizeof(code, PDU))
            return { target, response: Response.exception(code, Code.Exception.DECODE_FAILURE) };

        // check for validation codes
        const exception = code > 0x80;

        // ensure the crc is valid for the payload
        const crc = buffer.readUInt16LE(buffer.length - 2);
        const invalid = __crc__(buffer.subarray(0, -2)) !== crc;
        if (invalid) return { target, response: Response.exception(exception ? -1 : code, Code.Exception.INVALID_CRC) };

        // cast the code to a valid function-code
        const fc = exception ? Code.Function.EXCEPTION : (code as Exclude<Code.Function, Code.Function.EXCEPTION>);

        // return the decoded request
        return { target, response: (<any>this.m_decoder[fc])(fc, PDU) };
    }
}

//  NAMESPACES  //

export namespace Response {
    //  PUBLIC METHODS  //

    /**
     * Constructs simple exception frames.
     * @param code                              Function code.
     * @param error                             Exception code.
     */
    export const exception = (code: number, error: Code.Exception) =>
        new Frame.Response(Code.Function.EXCEPTION, { code, error });

    //  IMPLEMENTATIONS  //

    /** Encoder Implementations. */
    export class Encoder implements Frame.Codec.Encoder<Frame.Direction.RESPONSE> {
        //  PUBLIC METHODS  //

        [Code.Function.EXCEPTION](frame: Frame.Response<Code.Function.EXCEPTION>) {
            const payload = Buffer.alloc(2);
            const code = frame.data.code < 0 ? 0xff : frame.data.code + 0x80;
            payload.writeUInt8(code, 0);
            payload.writeUInt8(frame.data.error, 1);
            return payload;
        }

        [Code.Function.READ_COILS](frame: Frame.Response<Code.Function.READ_COILS>) {
            return this.m_array(frame.code, frame.data.status, true);
        }

        [Code.Function.READ_DISCRETE_INPUTS](frame: Frame.Response<Code.Function.READ_DISCRETE_INPUTS>) {
            return this.m_array(frame.code, frame.data.status, true);
        }

        [Code.Function.READ_HOLDING_REGISTERS](frame: Frame.Response<Code.Function.READ_HOLDING_REGISTERS>) {
            return this.m_array(frame.code, frame.data.array, false);
        }

        [Code.Function.READ_INPUT_REGISTERS](frame: Frame.Response<Code.Function.READ_INPUT_REGISTERS>) {
            return this.m_array(frame.code, frame.data.array, false);
        }

        [Code.Function.WRITE_SINGLE_COIL](frame: Frame.Response<Code.Function.WRITE_SINGLE_COIL>) {
            return this.m_single(frame.code, frame.data);
        }

        [Code.Function.WRITE_SINGLE_REGISTER](frame: Frame.Response<Code.Function.WRITE_SINGLE_REGISTER>) {
            return this.m_single(frame.code, frame.data);
        }

        [Code.Function.WRITE_MULTIPLE_COILS](frame: Frame.Response<Code.Function.WRITE_MULTIPLE_COILS>) {
            return this.m_multi(frame.code, frame.data);
        }

        [Code.Function.WRITE_MULTIPLE_REGISTERS](frame: Frame.Response<Code.Function.WRITE_MULTIPLE_REGISTERS>) {
            return this.m_multi(frame.code, frame.data);
        }

        //  PRIVATE METHODS  //

        /**
         * Handles constructing array-like buffers.
         * @param code                          Function code.
         * @param values                        Values to format.
         * @param bool                          Boolean flag.
         */
        private m_array(code: Code.Function, values: Array<boolean | number>, bool: boolean) {
            const buffer = Utils.Bytes.from(bool ? 'bool' : 'u16', values as any);
            const payload = Buffer.alloc(2);
            payload.writeUInt8(code, 0);
            payload.writeUInt8(values.length, 1);
            return Buffer.concat([payload, buffer]);
        }

        /**
         * Handles constructing single-write buffers.
         * @param code                          Function code.
         * @param values                        Values to format.
         * @param bool                          Boolean flag.
         */
        private m_single(code: Code.Function, { address, value }: { address: number; value: boolean | number }) {
            const payload = Buffer.alloc(5);
            payload.writeUInt8(code, 0);
            payload.writeUInt16BE(address, 1);
            payload.writeUInt16BE(typeof value === 'boolean' ? (value ? 0xff00 : 0x0000) : value);
            return payload;
        }

        /**
         * Handles constructing a multi-write buffer.
         * @param code                          Function code.
         * @param data                          Data to write.
         */
        private m_multi(code: Code.Function, { address, quantity }: { address: number; quantity: number }) {
            const payload = Buffer.alloc(5);
            payload.writeUInt8(code, 0);
            payload.writeUInt16BE(address, 1);
            payload.writeUInt16BE(quantity, 3);
            return payload;
        }
    }

    /** Decoder Implementations. */
    export class Decoder implements Frame.Codec.Decoder<Frame.Direction.RESPONSE> {
        //  PUBLIC METHODS  //

        [Code.Function.EXCEPTION](code: Code.Function.EXCEPTION, buffer: Buffer) {
            if (code > 0x80 + 0x2b) return exception(-1, Code.Exception.ILLEGAL_FUNCTION);
            if (buffer.length !== 1) return exception(code, Code.Exception.DECODE_FAILURE);
            return exception(code - 0x80, buffer.readUInt8(0));
        }

        [Code.Function.READ_COILS](code: Code.Function.READ_COILS, buffer: Buffer) {
            return this.m_array(code, buffer, true);
        }

        [Code.Function.READ_DISCRETE_INPUTS](code: Code.Function.READ_DISCRETE_INPUTS, buffer: Buffer) {
            return this.m_array(code, buffer, true);
        }

        [Code.Function.READ_HOLDING_REGISTERS](code: Code.Function.READ_HOLDING_REGISTERS, buffer: Buffer) {
            return this.m_array(code, buffer, false);
        }

        [Code.Function.READ_INPUT_REGISTERS](code: Code.Function.READ_INPUT_REGISTERS, buffer: Buffer) {
            return this.m_array(code, buffer, false);
        }

        [Code.Function.WRITE_SINGLE_COIL](code: Code.Function.WRITE_SINGLE_COIL, buffer: Buffer) {
            return this.m_single(code, buffer, true);
        }

        [Code.Function.WRITE_SINGLE_REGISTER](code: Code.Function.WRITE_SINGLE_REGISTER, buffer: Buffer) {
            return this.m_single(code, buffer, false);
        }

        [Code.Function.WRITE_MULTIPLE_COILS](code: Code.Function.WRITE_MULTIPLE_COILS, buffer: Buffer) {
            return this.m_multi(code, buffer);
        }

        [Code.Function.WRITE_MULTIPLE_REGISTERS](code: Code.Function.WRITE_MULTIPLE_REGISTERS, buffer: Buffer) {
            return this.m_multi(code, buffer);
        }

        /**
         * Validates incoming response code sizes.
         * @param code                                  Function code.
         * @param data                                  Data to validate.
         */
        sizeof(code: Code.Function, data: Buffer): boolean {
            switch (code) {
                case Code.Function.READ_COILS:
                case Code.Function.READ_DISCRETE_INPUTS:
                case Code.Function.READ_HOLDING_REGISTERS:
                case Code.Function.READ_INPUT_REGISTERS: {
                    if (data.length < 1) return false;
                    return data.length === 1 + data.readUInt8(0);
                }

                default: return data.length === 4; // prettier-ignore
            }
        }

        //  PRIVATE METHODS  //

        /**
         * Handles constructing array-based decoding.
         * @param code                          Function code.
         * @param buffer                        Buffer to decode.
         * @param bool                          Boolean flag.
         */
        private m_array<C extends Code.Function>(
            code: C,
            buffer: Buffer,
            bool: boolean
        ): Frame.Response<C | Code.Function.EXCEPTION> {
            // ensure we have a base length necessary
            if (buffer.length < 1) return exception(code, Code.Exception.DECODE_FAILURE);

            // deconstruct the details necessary
            const count = buffer.readUInt8(0);
            if (buffer.length !== 1 + count) return exception(code, Code.Exception.DECODE_FAILURE);

            // can successfully retrieve the status
            const values = Utils.Bytes.to(bool ? 'bool' : 'u16', buffer.subarray(1, 1 + count));
            return new Frame.Response(code, { [bool ? 'status' : 'array']: values } as any);
        }

        /**
         * Handles constructing single-write decoding.
         * @param code                          Function code.
         * @param buffer                        Buffer to decode.
         * @param bool                          Boolean flag.
         */
        private m_single<C extends Code.Function>(
            code: C,
            buffer: Buffer,
            bool: boolean
        ): Frame.Response<C | Code.Function.EXCEPTION> {
            if (buffer.length !== 4) return exception(code, Code.Exception.DECODE_FAILURE);
            const address = buffer.readUInt16BE(0);
            const value = buffer.readUInt16BE(2);
            return new Frame.Response(code, { address, value: bool ? value === 0xff00 : value } as any);
        }

        /**
         * Handles constructing multi-write decoding.
         * @param code                          Function code.
         * @param buffer                        Buffert to decode.
         */
        private m_multi<C extends Code.Function>(code: C, buffer: Buffer): Frame.Response<C | Code.Function.EXCEPTION> {
            if (buffer.length !== 4) return exception(code, Code.Exception.DECODE_FAILURE);
            const address = buffer.readUInt16BE(0);
            const quantity = buffer.readUInt16BE(2);
            return new Frame.Response(code, { address, quantity } as any);
        }
    }
}
