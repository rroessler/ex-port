/// Package Modules
import { Code } from '../code';
import { Generic } from './generic';

//  TYPEDEFS  //

/** Types of Frames. */
export const enum Direction {
    REQUEST,
    RESPONSE,
}

/** Available Data-Types. */
export namespace Data {
    //  TYPEDEFS  //

    /** Range Interface Type. */
    export interface Range {
        readonly start: number;
        readonly quantity: number;
    }

    /** State Interface Type. */
    export interface Status {
        readonly status: boolean[];
    }

    /** Exception Error Data. */
    export interface Error {
        readonly code: number;
        readonly error: Code.Exception;
    }

    /** Availbale Request Data. */
    export interface Request {
        [Code.Function.EXCEPTION]: Error;
        [Code.Function.READ_COILS]: Range;
        [Code.Function.READ_DISCRETE_INPUTS]: Range;
        [Code.Function.READ_HOLDING_REGISTERS]: Range;
        [Code.Function.READ_INPUT_REGISTERS]: Range;
        [Code.Function.WRITE_SINGLE_COIL]: { start: number; value: boolean };
        [Code.Function.WRITE_SINGLE_REGISTER]: { start: number; value: number };
        [Code.Function.WRITE_MULTIPLE_COILS]: { start: number; array: boolean[] };
        [Code.Function.WRITE_MULTIPLE_REGISTERS]: { start: number; array: number[] };
    }

    /** Availbale Response Data. */
    export interface Response {
        [Code.Function.EXCEPTION]: Error;
        [Code.Function.READ_COILS]: Status;
        [Code.Function.READ_DISCRETE_INPUTS]: Status;
        [Code.Function.READ_HOLDING_REGISTERS]: { array: number[] };
        [Code.Function.READ_INPUT_REGISTERS]: { array: number[] };
        [Code.Function.WRITE_SINGLE_COIL]: { address: number; value: boolean };
        [Code.Function.WRITE_SINGLE_REGISTER]: { address: number; value: number };
        [Code.Function.WRITE_MULTIPLE_COILS]: { address: number; quantity: number };
        [Code.Function.WRITE_MULTIPLE_REGISTERS]: { address: number; quantity: number };
    }

    /** Infers a Frames data type. */
    export type Infer<C extends Code.Function, D extends Direction> = D extends Direction.REQUEST
        ? Request[C]
        : Response[C];
}

/** Frame Codec Functionality. */
export namespace Codec {
    //  TYPEDEFS  //

    /** Encoder Abstraction. */
    export type Encoder<D extends Direction> = {
        [C in Code.Function]: (frame: Generic<C, D>) => Buffer;
    };

    /** Decoder Abstraction. */
    export type Decoder<D extends Direction> = {
        [C in Code.Function]: (code: C, buffer: Buffer) => Generic<C | Code.Function.EXCEPTION, D>;
    };
}
