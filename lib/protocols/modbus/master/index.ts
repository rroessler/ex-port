/// Package Modules
import { Code } from '../code';
import { Frame } from '../frame';
import { Packet } from '../types';
import { Port } from '../../../port';
import { Codec } from '../../../codec';
import { Parser } from '../../../parser';
import { Exception } from '../exception';

/** Modbus Master Implementation. */
export class Master<P extends Parser.Abstract<Packet, Codec.Abstract<Packet>>> implements Port.Bare {
    //  PROPERTIES  //

    /** Master properties to use. */
    private m_options: Required<Master.IOptions> = { threshold: 1000, throttle: 0 };

    /** Explicit port instance. */
    private readonly m_port: Port.Stream<P>;

    /** Current pending invokation. */
    private m_pending?: Promise<Frame.Generic<Code.Function, Frame.Direction.RESPONSE>>;

    //  GETTERS x SETTERS  //

    /** The underlying port-path. */
    get path() {
        return this.m_port.path;
    }

    /** The current baud-rate value. */
    get baudRate() {
        return this.m_port.baudRate;
    }

    /** Denotes if currently open. */
    get isOpen() {
        return this.m_port.isOpen;
    }

    //  CONSTRUCTORS  //

    /**
     * Constructs an instance of a Modbus Master.
     * @param options                       Options to use.
     */
    constructor(options: Master.IOptions & Port.Options.Binding<P>) {
        const { threshold, throttle, ...rest } = options;
        this.m_port = new Port.Stream(rest) as any;

        // assign the underlying options as necessary
        if (typeof threshold === 'number') this.m_options.threshold = threshold;
        if (typeof throttle === 'number') this.m_options.throttle = throttle;
    }

    /** Destroys the Modbus Master instance. */
    destroy() {
        return this.m_port.destroy();
    }

    //  PUBLIC METHODS  //

    /** Opens the Modbus Master port. */
    open() {
        return this.m_port.open();
    }

    /** Closes the Modbus Master port. */
    close() {
        return this.m_port.close();
    }

    //  PRIVATE METHODS  //

    /**
     * Attempts invoking a desired modbus function.
     * @param target                            Target value.
     * @param code                              Function code.
     * @param data                              Data to emit.
     */
    async m_invoke<C extends Exclude<Code.Function, Code.Function.EXCEPTION>>(
        target: number,
        code: C,
        data: Frame.Data.Request[C]
    ) {
        // ensure the target is a valid Modbus target
        if (target < 0 || target > 0xff) throw new Error(`Invalid Modbus target value`);

        // wait for the current invokation to finish
        try {
            await this.m_pending;
        } finally {
            this.m_pending = undefined;
        }

        // generate the required frame to be invoked
        const request = new Frame.Generic(code, Frame.Direction.REQUEST, data);

        // before continuing, delay execution if as necessary
        await new Promise<void>((resolve) => setTimeout(() => resolve(), this.m_options.throttle));

        // pre-flush the client before writing
        await this.m_port.flush();

        // prepare the promise we require
        const promise = new Promise<Frame.Generic<C, Frame.Direction.RESPONSE>>((resolve, reject) => {
            // prepare the listener necessary for resolution
            const listener = (packet: Packet.Incoming) => {
                // clear the current timer instance
                clearTimeout(timer);

                // ensure we actually have a valid packet
                Packet.invalid(packet)
                    ? reject(new Exception(packet.response.data as any))
                    : resolve(packet.response as any);
            };

            // and prepare a timer to be used
            const timer = setTimeout(() => {
                this.m_port.off('incoming', listener); // remove the listener instance
                reject(new Exception({ code: -1, error: Code.Exception.NO_RESPONSE }));
            }, this.m_options.threshold);

            // attach the listener for execution
            this.m_port.once('incoming', listener);
        });

        // latch the promise value now
        this.m_pending = promise;

        // append the request to be resolved
        return this.m_port.write({ target, request }).then(() => promise);
    }
}

export namespace Master {
    //  TYPEDEFS  //

    /** Modbus Master Options Interface. */
    export interface IOptions {
        threshold?: number;
        throttle?: number;
    }
}
