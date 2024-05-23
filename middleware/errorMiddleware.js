const formatResponse = (message, stack) => {
   return process.env.NODE_ENV === "production"
      ? { message }
      : { message, stack };
};

class BadRequestError extends Error {
   constructor(message) {
      super(message);
      this.name = "BadRequestError";
      this.statusCode = 400;
   }
}

class NotFoundError extends Error {
   constructor(message) {
      super(message);
      this.name = "NotFoundError";
      this.statusCode = 404;
   }
}

class UnauthorizedError extends Error {
   constructor(message) {
      super(message);
      this.name = "UnauthorizedError";
      this.statusCode = 401;
   }
}

const errorHandler = (err, req, res, next) => {
   let statusCode = err.statusCode || 500;

   if (
      err instanceof BadRequestError ||
      err instanceof NotFoundError ||
      err instanceof UnauthorizedError
   ) {
      statusCode = err.statusCode;
   }
   res.status(statusCode).json(formatResponse(err.message, err.stack));
};
module.exports = {
   errorHandler,
   BadRequestError,
   NotFoundError,
   UnauthorizedError,
};
