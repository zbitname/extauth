export class ProviderError extends Error {
  public message: any;
  public code: any;

  /**
   * Creates an instance of ProviderError.
   */
  constructor(message: any, code?: any) {
    super();

    this.message = message;
    this.code = code;
  }
}
