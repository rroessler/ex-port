/// SerialPort Modules
import { SerialPort, SerialPortMock, SerialPortMockOpenOptions, SerialPortOpenOptions } from 'serialport';
import { CreatePortOptions } from '@serialport/binding-mock';
import { AutoDetectTypes } from '@serialport/bindings-cpp';
import { DisconnectedError } from '@serialport/stream';

/// Vendor Modules
import * as Monads from 'ts-monadable';

/// Ext-Port Utils
import { Delay } from '../utils/delay';
import { Emitter } from '../utils/emitter';

/// Ext-Port Modules
import { Protocol } from '../codec';
import { IPortEvents } from './events';
import { IParser } from '../parser/impl';
import { IPortOptions, DefaultPortOptions, IPortUpdateOptions } from './options';
import { PortError, PortWarning, IPortError, IPortWarning } from './error';

/// Re-Exports
export { PortError, PortWarning, IPortError, IPortWarning, IPortOptions, IPortUpdateOptions };

/**************
 *  TYPEDEFS  *
 **************/

/** Bare-Bones Port Interface. */
export interface IBarePort {
    readonly path: string;
    readonly baudRate: number;
    readonly isOpen: boolean;

    open: () => Promise<Monads.Maybe<string>>;
    close: () => Promise<Monads.Maybe<string>>;
    sleep: <T = void>(duration: number, next?: T) => Promise<T>;
}

/** Basic Port Interface (with events). */
export interface IPort<P extends Protocol.Any = Protocol.Default> extends IBarePort, Emitter.ISimplex<IPortEvents<P>> {
    update: (opts: IPortUpdateOptions<P>) => void;
    write: (...args: P['outgoing']) => Promise<Monads.Maybe<string>>;
}

/*****************
 *  ABSTRACTION  *
 *****************/

/** Port Abstraction / Implementation. */
abstract class Abstract<S extends SerialPort | SerialPortMock, P extends Protocol.Any, T extends AutoDetectTypes>
    implements IPort<P>
{
    /****************
     *  PROPERTIES  *
     ****************/

    /** Internal Serial-Port Instance. */
    private m_port: S;

    /** Internal Emitter Instance. */
    private m_emitter = new Emitter.Typed<IPortEvents<P>>();

    /** Available Parser Implementation. */
    private m_parser?: IParser<P>;

    /***********************
     *  GETTERS / SETTERS  *
     ***********************/

    /** Getter for `SerialPort::path`. Returns the serial-port path. */
    get path() {
        return this.m_port.path;
    }

    /** Getter for `SerialPort::baudRate`. Returns the serial-port baud-rate. */
    get baudRate() {
        return this.m_port.baudRate;
    }

    /** Getter for `SerialPort::isOpen`. Returns whether or not the serial-port is open. */
    get isOpen() {
        return this.m_port.isOpen;
    }

    /**
     * Sets the next required parser. If given null, removes the current parser implementation.
     * @param next                              Next parser to assign.
     */
    set parser(next: IParser<P> | null) {
        // ensure the port is not actually open now
        if (this.m_port.isOpen) throw PortError('Cannot change ext::Port.parser whilst port is open');

        // remove the current parser implementation
        this.m_port.unpipe();
        this.m_parser?.destroy();

        // update the desired state of the next parser
        this.m_parser = next ? this.m_port.pipe(next) : undefined;

        // need to clear any potential data listeners
        this.m_port.removeAllListeners('data');
        this.m_parser?.removeAllListeners('data');

        // determine the most suitable data emitter
        const emitter = this.m_parser ?? this.m_port;

        // and propagate any incoming data
        emitter.on('data', (chunk) => this.m_emitter.emit('incoming', chunk));
    }

    /******************
     *  CONSTRUCTORS  *
     ******************/

    /**
     * Constructs a new port implementation with the given options.
     * @param target                            Target serial-port constructor.
     * @param opts                              Options to use.
     */
    constructor(
        target: new (...args: any[]) => S,
        opts: IPortOptions<P> & (SerialPortOpenOptions<T> | SerialPortMockOpenOptions)
    ) {
        const overriden = Object.assign({}, DefaultPortOptions, opts); // set some default values
        const { parser, ...rest } = overriden; // pull out the available options
        this.m_port = new target(rest); // construct the core port instance

        // prepare any event handlers that may be required
        this.m_registerPortEvents();

        // if given a parser to use, attach now or remove as necessary
        this.parser = parser ?? null;
    }

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Coordinates sleeping for the given duration.
     * @param duration                      Time to sleep for.
     * @param next                          Optional pass-through value.
     */
    sleep<T>(duration: number, next?: T) {
        return Delay.sleep(duration, next);
    }

    /** Coordinates opening the underlying port instance. */
    open() {
        return this.m_toggle('open');
    }

    /** Coordinates closing the underlying port instance. */
    close() {
        return this.m_toggle('close');
    }

    /**
     * Coordinates a write sequence for the underlying port instance.
     * @param args                              Arguments to decode to a suitable outgoing buffer.
     */
    write(...args: P['outgoing']): Promise<Monads.Maybe<string>> {
        return new Promise<Monads.Maybe<string>>((resolve) => {
            // cast the outgoing arguments into a suitable buffer to use
            const outgoing = this.m_parser?.codec.encode(...args) ?? Monads.Some<Buffer>(args[0]);

            // declare an error if we have an invalid message
            if (outgoing.is('none')) {
                const message = `Could not write to ext::Port. ${outgoing.unwrap()}`;
                this.m_emitter.emit('_error', PortError(message));
                return resolve(Monads.Some(message));
            }

            // update the required encoding
            const encoding = this.m_parser?.codec.encoding ?? args[1] ?? undefined;

            // convert any strings into a suitable buffer
            const raw = outgoing.unwrap() as any;
            const buffer = typeof raw === 'string' ? Buffer.from(raw) : (raw as Buffer);

            // ensure we actually have a buffer
            if (!(buffer instanceof Buffer)) {
                const message = `Could not write to ext::Port. Outgoing data could not be converted to a buffer`;
                this.m_emitter.emit('_error', PortError(message));
                return resolve(Monads.Some(message));
            }

            // everything is good, so write away
            this.m_port.write(buffer, encoding, (err) => {
                // handle any errors that may occur
                if (err) {
                    const message = `ext::Port write error. ${err.message}`;
                    this.m_emitter.emit('_error', PortError(message));
                    return resolve(Monads.Some(message));
                }

                // valid message, so resolve normally
                this.m_emitter.emit('outgoing', buffer);
                resolve(Monads.None());
            });
        });
    }

    /** Coordinates flushing the port instance. */
    flush() {
        return new Promise<void>((resolve) => this.m_port.flush(() => resolve()));
    }

    /**
     * Coordinates updating various port-options.
     * @param opts                              Options to update.
     */
    update(opts: IPortUpdateOptions<P>) {
        const { parser, baudRate } = opts;
        if (baudRate) this.m_port.update({ baudRate });
        if (parser) this.parser = parser;
    }

    /**
     * Allows attaching a handler for when a port-event occurs.
     * @param eventName                         Event name.
     * @param handler                           Event handler.
     */
    on<U extends keyof IPortEvents<P>>(eventName: U, handler: Emitter.Handler<IPortEvents<P>[U]>): bigint {
        return this.m_emitter.on(eventName, handler);
    }

    /**
     * Allows attaching a handler for when a port-event occurs the first time after registration.
     * @param eventName                         Event name.
     * @param handler                           Event handler.
     */
    once<U extends keyof IPortEvents<P>>(eventName: U, handler: Emitter.Handler<IPortEvents<P>[U]>): bigint {
        return this.m_emitter.once(eventName, handler);
    }

    /**
     * Removes the port-event listeners by pre-defined keys, or all listeners for the event if no keys are given.
     * @param eventName                         Event name.
     * @param keys                              Keys of subscribers to remove.
     */
    ignore<U extends keyof IPortEvents<P>>(eventName: U, ...keys: bigint[]): number {
        return this.m_emitter.ignore(eventName, ...keys);
    }

    /*********************
     *  PRIVATE METHODS  *
     *********************/

    /**
     * Internal state change handler. Allows safely setting the next required port state.
     * @param state                         State to change to.
     */
    private m_toggle = (state: 'open' | 'close') =>
        new Promise<Monads.Maybe<string>>((resolve) => {
            // determine the current state
            const current = this.m_port.isOpen ? 'open' : 'close';

            // if already in the desired state, then declare a warning
            if (state === current) {
                const message = `ext::Port is already ${state === 'close' ? 'closed' : 'open'}`;
                this.m_emitter.emit('_warning', PortWarning(message));
                return resolve(Monads.Some(message));
            }

            // otherwise attempt the required state change
            this.m_port[state]((err) => {
                if (err) {
                    const message = `Could not change ext::Port state. ${err.message}`;
                    this.m_emitter.emit('_error', PortError(message));
                    return resolve(Monads.Some(message));
                }

                // successfully changed state
                this.m_emitter.emit(state, state === 'close' ? false : void 0);
                resolve(Monads.None());
            });
        });

    /********************
     *  EVENT HANDLERS  *
     ********************/

    /// Registers all required port-events.
    private m_registerPortEvents() {
        // propagate any error events
        this.m_port.on('error', (err) => this.m_emitter.emit('_error', PortError(err.message)));

        // propagate the close events with disconnection status
        this.m_port.on('close', (err?: DisconnectedError | null) =>
            this.m_emitter.emit('close', err?.disconnected ?? false)
        );
    }
}

/********************
 *  IMPLEMENTATION  *
 ********************/

/** Generic Port Extension Class. */
export class Port<
    P extends Protocol.Any = Protocol.Default,
    T extends AutoDetectTypes = AutoDetectTypes
> extends Abstract<SerialPort, P, T> {
    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Constructs a new port implementation with the given options.
     * @param opts                              Options to use.
     */
    constructor(opts: IPortOptions<P>) {
        super(SerialPort, opts); // inherit from the abstraction
    }
}

/** Generic Port Mock Extension Class. */
export class PortMock<
    P extends Protocol.Any = Protocol.Default,
    T extends AutoDetectTypes = AutoDetectTypes
> extends Abstract<SerialPortMock, P, T> {
    /*****************
     *  CONSTRUCTOR  *
     *****************/

    /**
     * Constructs a new port implementation with the given options.
     * @param opts                              Options to use.
     */
    constructor(opts: IPortOptions<P> & SerialPortMockOpenOptions) {
        super(SerialPortMock, opts); // inherit from the abstraction
    }

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /**
     * Registers a mock-port for use.
     * @param path                              Port path.
     * @param opts                              Creation options.
     */
    static register(path: string, opts?: CreatePortOptions) {
        SerialPortMock.binding.createPort(path, opts);
    }
}
