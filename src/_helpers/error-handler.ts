class errorHandler extends Error {
    status: number = 400;
    message: string;

    constructor(message, status) {
        super(message);
        this.message = message;
        this.setStatus(status);
    }
    setStatus(val) {
        if (val !== null && val !== undefined) {
            this.status = val;
        }
    }
}

export default errorHandler;
