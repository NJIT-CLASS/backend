export const MASTER_EMAIL = 'njitplamaster@gmail.com';
export const MASTER_PASSWORD = 'plamaster123';
export const EMAIL_SERVER_STATUS = true;
export const FILE_SIZE = 52428800;
export const MAX_NUM_FILES = 3;

exports.EXECUTION_STATUS ={
    NOT_YET_STARTED: 'not_yet_started', //default
    STARTED: 'started',
    COMPLETED: 'completed',
    BYPASSED: 'bypassed',
    AUTOMATIC: 'automatic'
};

exports.CANCELLATION_STATUS ={
    NORMAL: 'normal', //default
    CANCELLED: 'cancelled',
};

exports.REVISION_STATUS={
    NOT_AVAILABLE: 'n/a', //default
    ORIGINAL_VERSION: 'original_version',
    SUBMITTED_FOR_APPROVAL: 'submitted_for_approval',
    BEING_REVISED: 'being_revised',
    APPROVED: 'approved',
    APPROVED_TIMED_OUT: 'approved_timed_out',
    ITERATION: 'iteration'
};

exports.DUE_STATUS={
    BEFORE_END_TIME:'before_end_time',//default
    LATE:'late',
    TIMED_OUT:'timed_out',
    SUBMITTED: 'submitted'
};

exports.PAGE_INTERACTION_STATUS={
    NOT_OPENED:'not_opened', //default
    VIEWED:'viewed',
    SAVED:'saved',
    SUBMITTED: 'submitted'
};

exports.REALLOCATION_STATUS={
    ORIGINAL_USER:'orginal_user', //default
    REALLOCATED_NO_EXTRA_CREDIT: 'reallocated_no_extra_credit',
    REALLOCATED_EXTRA_CREDIT: 'reallocated_extra_credit'
};
