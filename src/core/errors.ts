/**
 * Custom error class for Calibre-related errors
 */
export class CalibreError extends Error {
  /**
   * The command that was executed when the error occurred
   */
  public readonly command: string;
  
  /**
   * The original error output from the calibredb command
   */
  public readonly stderr: string;
  
  /**
   * Creates a new CalibreError
   * 
   * @param message - The error message
   * @param command - The command that was being executed
   * @param stderr - The stderr output from calibredb
   */
  constructor(message: string, command: string, stderr: string) {
    super(message);
    this.name = "CalibreError";
    this.command = command;
    this.stderr = stderr;
  }
  
  /**
   * Returns a string representation of the error including the command and stderr
   */
  toString(): string {
    return `${this.name}: ${this.message}\nCommand: ${this.command}\nOutput: ${this.stderr}`;
  }
}

/**
 * Error thrown when a book is not found in the library
 */
export class BookNotFoundError extends CalibreError {
  /**
   * The ID of the book that was not found
   */
  public readonly bookId: number | string;
  
  /**
   * Creates a new BookNotFoundError
   * 
   * @param bookId - The ID of the book that was not found
   * @param command - The command that was being executed
   * @param stderr - The stderr output from calibredb
   */
  constructor(bookId: number | string, command: string, stderr: string) {
    super(`Book with ID ${bookId} not found`, command, stderr);
    this.name = "BookNotFoundError";
    this.bookId = bookId;
  }
}

/**
 * Error thrown when the calibredb executable is not found
 */
export class CalibreNotFoundError extends Error {
  /**
   * Creates a new CalibreNotFoundError
   * 
   * @param message - Additional details about the error
   */
  constructor(message = "calibredb executable not found") {
    super(message);
    this.name = "CalibreNotFoundError";
  }
}

/**
 * Error thrown when the library path is invalid or not accessible
 */
export class LibraryNotFoundError extends CalibreError {
  /**
   * The path to the library that was not found
   */
  public readonly libraryPath: string;
  
  /**
   * Creates a new LibraryNotFoundError
   * 
   * @param libraryPath - The path to the library that was not found
   * @param command - The command that was being executed
   * @param stderr - The stderr output from calibredb
   */
  constructor(libraryPath: string, command: string, stderr: string) {
    super(`Library not found at path: ${libraryPath}`, command, stderr);
    this.name = "LibraryNotFoundError";
    this.libraryPath = libraryPath;
  }
}

/**
 * Determines if an error is a specific type of calibre error based on error message
 * 
 * @param error - The error to check
 * @param command - The command that was executed
 * @param stderr - The stderr output from calibredb
 * @returns The appropriate error type or the original error if no specific type applies
 */
export function determineErrorType(
  error: Error, 
  command: string, 
  stderr: string
): Error {
  const errorMessage = stderr.toLowerCase();
  
  // Check for common error patterns and return appropriate error types
  if (errorMessage.includes("no book with id") || errorMessage.includes("book not found")) {
    // Extract book ID from error message if possible
    const idMatch = errorMessage.match(/id: (\d+)/);
    const bookId = idMatch ? parseInt(idMatch[1], 10) : "unknown";
    return new BookNotFoundError(bookId, command, stderr);
  }
  
  if (errorMessage.includes("library not found") || errorMessage.includes("cannot find library")) {
    // Extract library path from error message if possible
    const pathMatch = errorMessage.match(/path[:\s]+([^\s]+)/i);
    const libraryPath = pathMatch ? pathMatch[1] : "unknown";
    return new LibraryNotFoundError(libraryPath, command, stderr);
  }
  
  if (errorMessage.includes("command not found") || errorMessage.includes("calibredb: not found")) {
    return new CalibreNotFoundError();
  }
  
  // Default to generic CalibreError
  return new CalibreError(`Error executing calibredb ${command}`, command, stderr);
}
