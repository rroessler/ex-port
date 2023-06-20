/** Bare Serial-Port Interface. */
export interface Bare {
    readonly path: string;
    readonly baudRate: number;
    readonly isOpen: boolean;

    open(): Promise<void>;
    close(): Promise<void>;
    destroy(): void;
}
