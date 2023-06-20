/// Package Modules
import { Code } from '../code';
import { Frame } from '../frame';
import { Error } from '../../../error';

//  PROPERTIES  //

/** Available Exception Reasons. */
const m_reasons: Record<Code.Exception, string> = {
    // internal failure codes
    [Code.Exception.INVALID_CRC]: 'Invalid CRC value',
    [Code.Exception.DECODE_FAILURE]: 'Failed to decode Modbus rx-buffer',
    [Code.Exception.NO_RESPONSE]: 'Modbus device did not return a response',

    // explicit modbus codes
    [Code.Exception.ILLEGAL_FUNCTION]: 'Illegal function code',
    [Code.Exception.ILLEGAL_DATA_ADDRESS]: 'Illegal data address',
    [Code.Exception.ILLEGAL_DATA_VALUE]: 'Illegal data value',
    [Code.Exception.SLAVE_DEVICE_FAILURE]: 'Slave device failure',
    [Code.Exception.ACKNOWLEDGE]: 'Ackowledged by will timeout',
    [Code.Exception.SLAVE_DEVICE_BUSY]: 'Slave device busy',
    [Code.Exception.NEGATIVE_ACKNOWLEDGE]: 'Cannot perform desired function',
    [Code.Exception.MEMORY_PARITY_ERROR]: 'Detected a memory parity error',
};

//  IMPLEMENTATIONS  //

/** Exception Error Instance. */
export class Exception extends Error.Custom {
    //  PROPERTIES  //

    /** Modbus Function Code. */
    readonly code: Code.Function;

    //  CONSTRUCTORS  //

    /**
     * Constructs a simple Modbus exception.
     * @param data                      Exception data.
     */
    constructor({ code, error }: Frame.Data.Error) {
        super(m_reasons[error]);
        this.code = code;
    }
}
