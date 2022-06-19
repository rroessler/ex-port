/** Protocol Type Aliases. */
export namespace Protocol {
    /** Generic Two-Way Protocol Interface. */
    export type Duplex<I extends any, O extends any[]> = {
        incoming: I;
        outgoing: O;
    };

    /** Defaulted Incoming Data. */
    export type Incoming = Buffer;

    /** Defaults Outgoing Data. */
    export type Outgoing = Buffer;

    /** Any Protocol Value. */
    export type Any = Duplex<any, any[]>;

    /** Defaulted Protocol Alias. */
    export type Default = Duplex<Incoming, [buffer: Outgoing, encoding?: BufferEncoding]>;
}
