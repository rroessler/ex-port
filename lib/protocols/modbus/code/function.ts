/** Modbus Function Codes. */
export const enum Function {
    EXCEPTION = -1,

    /** Coils [00001 - 09999] */
    READ_COILS = 1,

    /** Discrete Inputs [10001 - 19999] */
    READ_DISCRETE_INPUTS = 2,

    /** Holding Registers [30001 - 39999] */
    READ_HOLDING_REGISTERS = 3,

    /** Input Registers [40001 - 49999] */
    READ_INPUT_REGISTERS = 4,

    /** Coils [00001 - 09999] */
    WRITE_SINGLE_COIL = 5,

    /** Input Registers [40001 - 49999] */
    WRITE_SINGLE_REGISTER = 6,

    /** Coils [00001 - 09999] */
    WRITE_MULTIPLE_COILS = 15,

    /** Input Registers [40001 - 49999] */
    WRITE_MULTIPLE_REGISTERS = 16,
}
