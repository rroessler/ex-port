/// Package Modules
import { Codec } from './codec';
import { Packet } from '../types';
import { IOptions } from './options';
import { Parser as __Parser__ } from '../../../parser';

/** RTU Parser Implementation. */
export class Parser extends __Parser__.Abstract<Packet, Codec> {
    //  PROPERTIES  //

    /** Current flushing rate. */
    private m_flushRate: number;

    /** Incoming data-buffer. */
    private m_buffer = Buffer.alloc(0);

    /** Flush-timer instance. */
    private m_timeout: any;

    //  CONSTRUCTORS  //

    /**
     * Constructs an RTU parser.
     * @param options                   Parser options.
     */
    constructor(options: IOptions = {}) {
        const { flushRate, ...rest } = options;
        super(new Codec(), rest);
        this.m_flushRate = flushRate ?? 250;
    }

    //  PRIVATE METHODS  //

    /**
     * Transforms the incoming data-chunk.
     * @param chunk                         Chunk to transform.
     */
    protected override m_transform(chunk: Buffer): Packet.Incoming[] {
        this.m_reset(); // reset the underlying time
        this.m_buffer = Buffer.concat([this.m_buffer, chunk]);
        const pushable: Packet.Incoming[] = [];

        console.log(this.m_buffer);

        do {
            // attempt decoding the current buffer instance
            const packet = this.m_codec.decode(this.m_buffer);

            // always pre-push the response found
            pushable.push(packet);

            // check if we have a bad frame instance
            if (Packet.invalid(packet) && (<any>packet.response.data).error < 0) break;

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
        clearTimeout(this.m_timeout); // force-clear
        return (this.m_buffer = Buffer.alloc(0)), [];
    }

    /** Handles reseting the internal flush-timer. */
    private m_reset() {
        clearTimeout(this.m_timeout); // ensure properly removed
        this.m_timeout = setTimeout(() => this.m_flush(), this.m_flushRate);
    }
}
