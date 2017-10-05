import {HttpError} from 'routing-controllers';
/**
 * Exception for 304 HTTP error.
 */
export class NotModified extends HttpError {
    name: string;
    constructor(message?: string) {
        super(304, message);
    };
}
