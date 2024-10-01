/// Package Modules
import { Code } from '../code';
import { Draft } from '../draft';
import { Frame } from '../frame';
import { Packet } from '../types';
import { Port } from '../../../port';
import { Codec } from '../../../codec';
import { Parser } from '../../../parser';
import { Exception } from '../exception';

/** Modbus Master Implementation. */
export class Master<P extends Parser.Abstract<Packet, Codec.Abstract<Packet>>, D extends Draft.Any = Draft.Any>
    implements Port.Bare
{
    //  PROPERTIES  //

    /** Underlying mapping details. */
    private m_draft?: D;

    /** Explicit port instance. */
    private readonly m_port: Port.Stream<P>;

    /** Underlying promise queue. */
    private m_pending = Promise.resolve();

    /** Master properties to use. */
    private m_options: Required<Omit<Master.IOptions<D>, 'draft'>> = { threshold: 1000, throttle: 0 };

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
    constructor(options: Master.IOptions<D> & Port.Options.Binding<P>) {
        const { draft, threshold, throttle, ...rest } = options;
        this.m_port = new Port.Stream(rest) as any;

        // set the base draft to be used
        this.m_draft = draft;

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

    /**
     * Makes a request for a mapped modbus-entry.
     * @param options                           Options necessary.
     */
    async request<K extends keyof D>({
        target,
        key,
        ...data
    }: Draft.Options<D, K>): Promise<Frame.Response<D[K]['code']>['data']> {
        // ensure we actually have a draft to use
        if (typeof this.m_draft === 'undefined') throw new Error('Modbus::Draft not set');
        if (!(key in this.m_draft)) throw new Error(`Modbus::Draft invalid key "${key.toString()}"`);

        // get the necessary details to be used
        const { code, ...preset } = this.m_draft[key];
        return this.invoke(target, code as any, Object.assign({}, preset, data)).then((response) => response.data);
    }

    /**
     * Attempts a raw-invokation for a desired modbus function.
     * @param target                            Target value.
     * @param code                              Function code.
     * @param data                              Data to emit.
     */
    async invoke<C extends Exclude<Code.Function, Code.Function.EXCEPTION>>(
        target: number,
        code: C,
        data: Frame.Data.Request[C]
    ) {
        // ensure the target is a valid Modbus target
        if (target < 0 || target > 0xff) throw new Error(`Invalid Modbus target value`);

        // generate the required frame to be invoked
        const request = new Frame.Request(code, data);

        // attempt waiting for this instance to finish now
        return this.m_enqueue(target, request);
    }

    //  PRIVATE METHODS  //

    /**
     * Handles enqueuing a desired request.
     * @param target                    Target to request.
     * @param request                   Request packet to send.
     */
    private m_enqueue<C extends Exclude<Code.Function, Code.Function.EXCEPTION>>(
        target: number,
        request: Frame.Request<C>
    ) {
        return new Promise<Frame.Response<C>>((resolve, reject) => {
            this.m_pending = this.m_pending
                .then(() => this.m_invoke(target, request))
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Handles internal invocation.
     * @param target                    Target to request.
     * @param request                   Request packet to send.
     */
    private async m_invoke<C extends Exclude<Code.Function, Code.Function.EXCEPTION>>(
        target: number,
        request: Frame.Request<C>
    ) {
        // before continuing, delay execution if necessary to do so
        await new Promise<void>((resolve) => setTimeout(() => resolve(), this.m_options.throttle));

        // prepare a deferred promise instance
        const deferred = this.m_defer<C>();

        // and prepare a timer to be used
        const timer = setTimeout(() => {
            this.m_port.off('incoming', listener); // remove the listener instance
            deferred.reject(new Exception({ code: -1, error: Code.Exception.NO_RESPONSE }));
        }, this.m_options.threshold);

        // prepare the listener necessary for resolution
        const listener = (packet: Packet.Incoming) => {
            // clear the current timer instance
            clearTimeout(timer);

            // ensure we actually have a valid packet
            Packet.invalid(packet)
                ? deferred.reject(new Exception(packet.response.data as any))
                : deferred.resolve(packet.response as any);
        };

        // pre-flush the client before writing
        await this.m_port.flush();

        // attach the listener for execution
        this.m_port.once('incoming', listener);

        // run the write request now (do not await, we want it to run later)
        this.m_port.write({ target, request }).catch((error) => deferred.reject(error));

        // latch and return the promise value now
        return deferred.promise;
    }

    /** Constructs a deferred promise. */
    private m_defer<C extends Exclude<Code.Function, Code.Function.EXCEPTION>>(): {
        promise: Promise<Frame.Response<C>>;
        resolve: Function;
        reject: Function;
    } {
        const deferred = Object.create(null); // prepare the result object to bind to
        deferred.promise = new Promise((resolve, reject) => ((deferred.resolve = resolve), (deferred.reject = reject)));
        return deferred; // and return the resulting deferred details now
    }
}

export namespace Master {
    //  TYPEDEFS  //

    /** Modbus Master Options Interface. */
    export interface IOptions<D extends Draft.Any> {
        draft?: D;
        threshold?: number;
        throttle?: number;
    }
}
