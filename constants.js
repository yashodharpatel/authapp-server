const StatusCodes = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const EmailTypes = {
  VERIFY: "verify_email",
  RESET: "reset_password",
};

const COMPANY_NAME = "Coding Peer";

export default { StatusCodes, EmailTypes, COMPANY_NAME };