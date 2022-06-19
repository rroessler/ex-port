/**************
 *  TYPEDEFS  *
 **************/

/** Opaque-Typings. Ensures numeric types can be "fixed" in a sense. */
type Opaque<K> = number & { __meta__: K };

/** Non-Negative Guards. */
export type NonNegative<T extends number> = number extends T ? never : `${T}` extends `-${string}` ? never : T;

/** Integer Guards. */
export type IntegerGuard<T extends number> = number extends T
    ? never
    : `${T}` extends `${string}.${string}`
    ? never
    : T;

/** Unsigned Integer Guards. */
export type UnsignedIntegerGuard<T extends number> = NonNegative<T> & IntegerGuard<T>;

/****************
 *  PRIMITIVES  *
 ****************/

export type uint8_t = Opaque<'uint8'>;
export type uint16_t = Opaque<'uint16'>;
export type uint32_t = Opaque<'uint32'>;

export type int8_t = Opaque<'int8'>;
export type int16_t = Opaque<'int16'>;
export type int32_t = Opaque<'int32'>;

export type float_t = Opaque<'float'>;
export type buffer_t = number[] | Uint8Array | Buffer;
export type bool_t = 0 | 1;

/********************
 *  HELPER METHODS  *
 ********************/

/**
 * Helper method to limit incoming values.
 * @param n                             Value to clamp.
 * @param threshold                     Threshold to limit to.
 * @param abs                           Take the absolute value.
 */
const m_limit = <N extends number>(n: number, threshold: number, abs = false): N => {
    n %= threshold;
    return (abs ? Math.abs(n) : n) as N;
};

/***************
 *  FACTORIES  *
 ***************/

export const uint8 = <N extends number>(n: UnsignedIntegerGuard<N>) => m_limit<uint8_t>(n, 0xff + 1, true);
export const uint16 = <N extends number>(n: UnsignedIntegerGuard<N>) => m_limit<uint16_t>(n, 0xffff + 1, true);
export const uint32 = <N extends number>(n: UnsignedIntegerGuard<N>) => m_limit<uint32_t>(n, 0xffffffff + 1, true);

export const int8 = <N extends number>(n: IntegerGuard<N>) => m_limit<int8_t>(n, 0xff + 1);
export const int16 = <N extends number>(n: IntegerGuard<N>) => m_limit<int16_t>(n, 0xffff + 1);
export const int32 = <N extends number>(n: IntegerGuard<N>) => m_limit<int32_t>(n, 0xffffffff + 1);

export const float = (n: number) => n as float_t;
