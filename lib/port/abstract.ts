/// Node Modules
import EventEmitter from 'events';

/// Vendor Modules
import TypedEmitter from 'typed-emitter';
import { DisconnectedError } from '@serialport/stream';

/// Package Modules
import { Bus } from '../bus';
import { Parser } from '../parser';
import { IEvents } from './events';
import { Options, Target } from './types';

/** Port-Stream Abstraction. */
export abstract class Abstract<T extends Target, P extends Parser.Any | undefined> {
    //  PROPERTIES  //

    /** Wrapped Port Instance. */
    protected m_instance: T;

    /** Parser Facade Instance. */
    readonly parser: P extends undefined ? undefined : P;

    /** Underlying event-emitter instance. */
    private m_emitter = new EventEmitter() as TypedEmitter<IEvents<Bus.Infer<P>>>;

    //  GETTERS x SETTERS  //

    /** The serial-port path property. */
    get path() {
        return this.m_instance.path;
    }

    /** Current baud-rate value. */
    get baudRate() {
        return this.m_instance.baudRate;
    }

    /** Denotes if currently open. */
    get isOpen() {
        return this.m_instance.isOpen;
    }

    /** Handles registering event-listeners. */
    get on(): typeof this.m_emitter.on {
        return this.m_emitter.on.bind(this.m_emitter);
    }

    /** Handles registering once-only event-listeners. */
    get once(): typeof this.m_emitter.once {
        return this.m_emitter.once.bind(this.m_emitter);
    }

    /** Handles removing event-listeners. */
    get off(): typeof this.m_emitter.off {
        return this.m_emitter.off.bind(this.m_emitter);
    }

    //  CONSTRUCTORS  //

    /**
     * Constructs a port-abstraction.
     * @param factory                       Binding factory.
     * @param options                       Constructor options.
     */
    constructor(factory: new (...arg: any[]) => T, options: Options.Infer<T, P>) {
        // resolve the necessary options to be used
        const { parser, ...rest }: Options.Infer<T, P> = Object.assign({ autoOpen: false }, options);

        // construct our port instance
        this.m_instance = new factory(rest);

        // update the current parser value to be used
        this.parser = parser as any;

        // prepare all necessary event-listeners
        this.m_registerEventListeners();
    }

    /** Disposes of the port instance. */
    destroy() {
        this.m_instance.destroy();
        this.m_instance.removeAllListeners();
    }

    //  PUBLIC METHODS  //

    /** Handles safely opening the port-abstraction. */
    open() {
        // if already open, then declare a warning
        if (this.isOpen) return void this.m_emitter.emit('_warning', `Port "${this.path}" is already opened`);

        // attempt opening the port as a wrapped promise
        return new Promise<void>((resolve, reject) =>
            this.m_instance.open((error) => {
                // if an error occured, propagate as necessary
                if (error) return this.m_emitter.emit('_error', error), reject(error);

                // validly opening, so we can emit the open-event
                this.m_emitter.emit('open'), resolve();
            })
        );
    }

    /** Handles safely closing the port-abstraction. */
    close() {
        // regardless of the state, always attempt to close
        return new Promise<void>((resolve, reject) =>
            this.m_instance.close((error) => {
                // if an error occured, propagate as necessary
                if (error) return this.m_emitter.emit('_error', error), reject(error);

                // validly opening, so we can emit the open-event
                this.m_emitter.emit('close', false), resolve();
            })
        );
    }

    /** Handles flushing the port-abstraction. */
    flush() {
        return new Promise<void>((resolve) => this.m_instance.flush(() => resolve()));
    }

    /**
     * Updates a serial-ports current baud-rate.
     * @param baudRate                          Baud-rate to use.
     */
    update(baudRate: number) {
        return new Promise<void>((resolve, reject) =>
            this.m_instance.update({ baudRate }, (error) => {
                // if an error occured, propagate as necessary
                if (error) return this.m_emitter.emit('_error', error), reject(error);

                // otherwise declare the update event a success
                this.m_emitter.emit('update', baudRate), resolve();
            })
        );
    }

    /**
     * Writes outgoing data to the port.
     * @param output                            Output to write.
     */
    write(output: Bus.Infer<P>['outgoing']) {
        return new Promise<void>((resolve, reject) => {
            // convert the output into a suitable value
            const buffer = this.parser?.codec?.encode(output) ?? Buffer.from(output);

            // attempt writing the value necessary
            this.m_instance.write(buffer, 'binary', (error) => {
                // if an error occured, propagate as necessary
                if (error) return this.m_emitter.emit('_error', error), reject(error);

                // otherwise declare as a success for writing
                this.m_emitter.emit('outgoing', output), resolve();
            });
        });
    }

    //  EVENT HANDLERS  //

    /** Prepares all necessary event-listeners. */
    private m_registerEventListeners() {
        // propagate any incoming error events
        this.m_instance.on('error', (error) => this.m_emitter.emit('_error', error));

        // propagate any close events with a disconnection status
        this.m_instance.on('close', (error?: DisconnectedError | null) =>
            this.m_emitter.emit('close', error?.disconnected || false)
        );

        // attempt registering a data-handler
        (this.parser ?? this.m_instance).on('data', (chunk) => {
            this.m_emitter.emit('data', Buffer.from(chunk));
            chunk = this.parser?.codec?.deserialize(chunk) ?? chunk;
            this.m_emitter.emit('incoming', chunk);
        });
    }
}
