/// Package Modules
import { Codec } from './codec';
import { Packet } from '../types';
import { IOptions } from './options';
import { Parser as __Parser__ } from '../../../parser';
import { Frame } from '../frame';
import { Code } from '../code';

/** RTU Parser Implementation. */
export class Parser extends __Parser__.Abstract<Packet, Codec> {
    //  PROPERTIES  //

    /** Incoming data-buffer. */
    private m_buffer = Buffer.alloc(0);

    //  CONSTRUCTORS  //

    /**
     * Constructs an RTU parser.
     * @param options                   Parser options.
     */
    constructor(options: IOptions = {}) {
        super(new Codec(), options);
    }

    //  PRIVATE METHODS  //

    /**
     * Transforms the incoming data-chunk.
     * @param chunk                         Chunk to transform.
     */
    protected override m_transform(chunk: Buffer): Packet.Incoming[] {
        this.m_buffer = Buffer.concat([this.m_buffer, chunk]);
        const pushable: Packet.Incoming[] = [];

        do {
            // attempt decoding the current buffer instance
            const packet = this.m_codec.decode(this.m_buffer);

            // handle incoming issues with our data now
            if (Packet.invalid(packet) && Frame.Codec.response(packet.response, Code.Function.EXCEPTION)) {
                if (packet.response.data.error === Code.Exception.DECODE_FAILURE) break;
            }

            // push the packet now as necessary
            pushable.push(packet);

            // get the original length to be used
            const length = this.m_codec.incoming.encode(packet).length;

            // trim the buffer as necessary
            this.m_buffer = this.m_buffer.subarray(length + 3);
        } while (this.m_buffer.length);

        // push the currently available items
        return pushable;
    }

    /** Flushes all currently available data. */
    protected override m_flush(): Packet.Incoming[] {
        return (this.m_buffer = Buffer.alloc(0)), [];
    }
}
