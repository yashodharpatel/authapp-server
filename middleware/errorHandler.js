import constants from "#constants";
import ApiResponse from "#utilities/apiResponse";

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  switch (statusCode) {
    case constants.StatusCodes.VALIDATION_ERROR:
      res.json(
        ApiResponse.error(
          constants.StatusCodes.VALIDATION_ERROR,
          "Validation Failed",
          err.message,
          err.stack
        )
      );
      break;
    case constants.StatusCodes.UNAUTHORIZED:
      res.json(
        ApiResponse.error(
          constants.StatusCodes.VALIDATION_ERROR,
          "Unauthorized",
          err.message,
          err.stack
        )
      );
      break;
    case constants.StatusCodes.FORBIDDEN:
      res.json(
        ApiResponse.error(
          constants.StatusCodes.VALIDATION_ERROR,
          "Forbidden",
          err.message,
          err.stack
        )
      );
      break;
    case constants.StatusCodes.NOT_FOUND:
      res.json(
        ApiResponse.error(
          constants.StatusCodes.VALIDATION_ERROR,
          "Not Found",
          err.message,
          err.stack
        )
      );
      break;
    case constants.StatusCodes.SERVER_ERROR:
      res.json(
        ApiResponse.error(
          constants.StatusCodes.VALIDATION_ERROR,
          "Internal Server Error",
          err.message,
          err.stack
        )
      );
      break;
    default:
      res.json(
        ApiResponse.error(
          constants.StatusCodes.VALIDATION_ERROR,
          "Internal Server Error",
          err.message,
          err.stack
        )
      );
      break;
  }
};

export default errorHandler;
