/// Package Modules
import type { Code } from '../code';
import type { Data, Direction } from './types';

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
    constructor(readonly code: C, readonly data: Data.Infer<C, D>) {}
}

//  ALIASES  //

/** Request Frame Typing. */
export class Request<C extends Code.Function> extends Generic<C, Direction.REQUEST> {}

/** Response Frame Typing. */
export class Response<C extends Code.Function> extends Generic<C, Direction.RESPONSE> {}
