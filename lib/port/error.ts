/// Ext-Port Utils
import { Exception } from '../utils/error';

/**************
 *  TYPEDEFS  *
 **************/

/** Port Warning Type-Alias. */
export type IPortWarning = ReturnType<typeof PortWarning>;

/** Port Error Type-Alias. */
export type IPortError = ReturnType<typeof PortError>;

/****************
 *  PROPERTIES  *
 ****************/

/** Port Warning Implementation. */
export const PortWarning = Exception.factory('PortWarning');

/** Port Error Implementation. */
export const PortError = Exception.factory('PortError');
