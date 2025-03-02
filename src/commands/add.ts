import { execCalibre, execCalibreStream } from "../core/exec";
import type { AddOptions } from "../types/options";

/**
 * Add books to the Calibre library
 * 
 * @param paths - Array of paths to files or directories to add
 * @param options - Options for the add command
 * @returns Promise resolving to the IDs of the added books
 */
export async function add(
  paths: string[],
  options: AddOptions = {}
): Promise<number[]> {
  const args: string[] = [];
  
  // Add command-specific options
  if (options.automerge) {
    args.push("--automerge", options.automerge);
  }
  
  if (options.allowDuplicates) {
    args.push("--duplicates");
  }
  
  if (options.recursive) {
    args.push("--recurse");
  }

  if (options.oneBookPerDirectory) {
    args.push("--one-book-per-directory");
  }
  
  if (options.empty) {
    args.push("--empty");
  }
  
  if (options.author) {
    args.push("--author", options.author);
  }
  
  if (options.title) {
    args.push("--title", options.title);
  }
  
  if (options.tags && options.tags.length > 0) {
    args.push("--tags", options.tags.join(","));
  }
  
  if (options.series) {
    args.push("--series", options.series);
  }
  
  if (options.seriesIndex !== undefined) {
    args.push("--series-index", options.seriesIndex.toString());
  }

  if (options.isbn) {
    args.push("--isbn", options.isbn);
  }
  
  if (options.identifiers) {
    options.identifiers.forEach((identifier) => args.push("--identifier", identifier));
  }

  if (options.languages) {
    args.push("--languages", options.languages.join(","));
  }

  // Append paths to the end of command, after all options
  args.push(...paths);
  
  if (options.stream) {
    // Return the child process for streaming
    return execCalibreStream("add", args, options) as unknown as Promise<number[]>;
  }

  const output = await execCalibre("add", args, options);
  
  // Parse the book IDs from the output text
  // Typical output: "Added book ids: 1, 2, 3"
  const match = output.match(/Added book ids?: (.+)/i);
  
  if (match && match[1]) {
    // Extract numbers and convert to integers
    return match[1]
      .split(",")
      .map(id => id.trim())
      .filter(id => id.length > 0)
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));
  }
  
  // No IDs found in the output, possibly because of --ignore-duplicates
  return [];
}

/**
 * Add a single book to the Calibre library
 * 
 * @param path - Path to the file to add
 * @param options - Options for the add command
 * @returns Promise resolving to the ID of the added book or null if no book was added
 */
export async function addBook(
  path: string,
  options: AddOptions = {}
): Promise<number | null> {
  const ids = await add([path], options);
  return ids.length > 0 ? ids[0] : null;
}

/**
 * Add an empty book to the Calibre library with the specified metadata
 * 
 * @param options - Options and metadata for the empty book
 * @returns Promise resolving to the ID of the added book
 */
export async function addEmptyBook(
  options: Omit<AddOptions, "empty"> = {}
): Promise<number | null> {
  // Make sure we have at least a title for the empty book
  if (!options.title) {
    throw new Error("Title is required for an empty book");
  }
  
  const ids = await add([], {
    ...options,
    empty: true
  });
  
  return ids.length > 0 ? ids[0] : null;
}

/**
 * Add multiple books from a directory recursively
 * 
 * @param directoryPath - Path to the directory containing ebooks
 * @param options - Options for the add command
 * @returns Promise resolving to the IDs of the added books
 */
export async function addDirectory(
  directoryPath: string,
  options: Omit<AddOptions, "recursive"> = {}
): Promise<number[]> {
  return add([directoryPath], {
    ...options,
    recursive: true
  });
}
