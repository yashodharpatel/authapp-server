class ApiResponse {
  static success(statusCode, message, data) {
    return new ApiResponse(statusCode, null, message, data, null);
  }

  static error(statusCode, title, message, stackTrace) {
    return new ApiResponse(statusCode, title, message, null, stackTrace);
  }

  constructor(statusCode, title, message, data, stackTrace) {
    statusCode && (this.statusCode = statusCode);
    title && (this.title = title);
    message && (this.message = message);
    data && (this.data = data);
    stackTrace && (this.stackTrace = this.stackTrace);
    this.success = statusCode < 400;
  }
}

export default ApiResponse;