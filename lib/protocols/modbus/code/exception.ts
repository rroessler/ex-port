/** Available Exception Codes. */
export const enum Exception {
    // internal failure codes
    INVALID_CRC = -3,
    DECODE_FAILURE = -2,
    NO_RESPONSE = -1,

    // explicit modbus codes
    ILLEGAL_FUNCTION = 1,
    ILLEGAL_DATA_ADDRESS = 2,
    ILLEGAL_DATA_VALUE = 3,
    SLAVE_DEVICE_FAILURE = 4,
    ACKNOWLEDGE = 5,
    SLAVE_DEVICE_BUSY = 6,
    NEGATIVE_ACKNOWLEDGE = 7,
    MEMORY_PARITY_ERROR = 8,
}
