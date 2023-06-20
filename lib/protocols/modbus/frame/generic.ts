/// Package Modules
import { Code } from '../code';
import { Data, Direction } from './types';

//  TYPEDEFS  //

/** Request Frame Typing. */
export type Request<C extends Code.Function> = Generic<C, Direction.REQUEST>;

/** Response Frame Typing. */
export type Response<C extends Code.Function> = Generic<C, Direction.RESPONSE>;

//  IMPLEMENTATIONS  //

/** Generic Frame Instance. */
export class Generic<C extends Code.Function, D extends Direction> {
    //  CONSTRUCTORS  //

    /**
     * Constructs a generic frame with the given details.
     * @param code                          Code to use.
     * @param direction                     Direction of frame.
     * @param data                          Underlying packet data.
     */
    constructor(readonly code: C, readonly direction: D, readonly data: Data.Infer<C, D>) {}
}
