/// Package Modules
import { Bus } from '../bus';

/** Port-Events Mapping. */
export type IEvents<B extends Bus.Any> = {
    open(): void; // port-opened
    close(disconnected: boolean): void; // port-closed
    update(baudRate: number): void; // port-updated

    data(buffer: Buffer): void; // raw incoming data
    incoming(data: B['incoming']): void; // incoming event-data
    outgoing(output: B['outgoing']): void; // outgoing event-data

    _warning(reason: string): void; // warning messages
    _error(error: Error): void; // error instances
};
