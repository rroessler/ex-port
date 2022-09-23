/// Native Modules.
import { EventEmitter } from 'events';

/// Ext-Port Utils.
import { UID } from './uid';

/** Emitter Functionality. */
export namespace Emitter {
    /**************
     *  TYPEDEFS  *
     **************/

    /** Default Event Handler. */
    export type Handler<A extends any[] = any[]> = (...args: A) => any;

    /** Event Emitter Argument Mapping. */
    export type EventMap<T> = Record<keyof T, any[]>;

    /** Base Typed-Emitter Interface Agreement. */
    export interface ITyped<T extends EventMap<T>> {
        on<U extends keyof T>(eventName: U, handler: Handler<T[U]>): bigint;
        once<U extends keyof T>(eventName: U, handler: Handler<T[U]>): bigint;
        emit<U extends keyof T>(eventName: U, ...args: T[U]): void;
        ignore<U extends keyof T>(eventName: U, ...keys: bigint[]): number;
    }

    /** Simplex Emitter (does not expose 'emit' method). */
    export type ISimplex<T extends EventMap<T>> = Omit<ITyped<T>, 'emit'>;

    /********************
     *  IMPLEMENTATION  *
     ********************/

    /** Typed Emitter Utility. */
    export class Typed<T extends EventMap<T>> extends UID implements ITyped<T> {
        /****************
         *  PROPERTIES  *
         ****************/

        /** Internal Event Emitter. */
        private m_core = new EventEmitter();

        /** Available References. */
        private m_refs: Partial<Record<keyof T, Map<bigint, Handler>>> = {};

        /********************
         *  PUBLIC METHODS  *
         ********************/

        /**
         * Wraps an underlying `EventEmitter:on` method. Returns a key denoting the handler key.
         * @param eventName                         Event name.
         * @param handler                           Event callback.
         */
        on<U extends keyof T>(eventName: U, handler: Handler<T[U]>): bigint {
            this.m_core.on(eventName as string, handler);
            const next = this.m_next();

            this.m_refs[eventName] ??= new Map();
            this.m_refs[eventName]?.set(next, handler);

            return next;
        }

        /**
         * Wraps an underlying `EventEmitter:once` method. Returns a key denoting the handler key.
         * @param eventName                         Event name.
         * @param handler                           Event callback.
         */
        once<U extends keyof T>(eventName: U, handler: Handler<T[U]>): bigint {
            this.m_core.once(eventName as string, handler);
            const next = this.m_next();

            this.m_refs[eventName] ??= new Map();
            this.m_refs[eventName]?.set(next, handler);

            return next;
        }

        /**
         * Wraps an underlying `EventEmitter:emit` method.
         * @param eventName                         Event name.
         * @param args                              Event arguments.
         */
        emit<U extends keyof T>(eventName: U, ...args: T[U]) {
            this.m_core.emit(eventName as string, ...args);
        }

        /**
         * Ignores the given event either by key-values or completely if no keys are given.
         * @param eventName                         Event to ignore.
         * @param keys                              Optional handler keys.
         */
        ignore<U extends keyof T>(eventName: U, ...keys: bigint[]): number {
            if (!keys.length) keys = [...(this.m_refs[eventName]?.keys() ?? [])];
            keys.forEach((key) => this.m_refs[eventName]?.delete(key));
            return keys.length;
        }
    }
}
