/// Package Modules
import { Packet } from '../types';
import { Request } from './request';
import { Response } from './response';
import { Codec as __Codec__ } from '../../../codec';

/** RTU Codec Implementation. */
export class Codec extends __Codec__.Merge<Packet> {
    //  CONSTRUCTORS  //

    /** Constructs an RTU codec. */
    constructor() {
        super(new Response(), new Request());
    }
}
