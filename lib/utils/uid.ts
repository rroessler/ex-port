/** Incrementing UID Generator. */
export class UID {
    /****************
     *  PROPERTIES  *
     ****************/

    /** Incrementing UID. */
    private m_uid = 1n;

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /** Returns the next available UID. */
    protected m_next() {
        return this.m_uid++;
    }
}
