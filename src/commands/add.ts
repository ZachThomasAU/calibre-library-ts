import { execCalibreJson, execCalibreStream } from "../core/exec";
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
  const args: string[] = [...paths];
  
  // Add command-specific options
  if (options.addToExisting) {
    args.push("--add-to-existing");
  }
  
  if (options.ignoreDuplicates) {
    args.push("--ignore-duplicates");
  }
  
  if (options.recursive) {
    args.push("--recursive");
  }
  
  if (options.duplicateIsbn) {
    args.push("--duplicate-isbn");
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
  
  if (options.identifier) {
    args.push("--identifier", options.identifier);
  }
  
  if (options.stream) {
    // Return the child process for streaming
    return execCalibreStream("add", args, options) as unknown as Promise<number[]>;
  }
  
  // Use JSON output for easier parsing
  const result = await execCalibreJson<{ book_ids: number[] }>("add", args, {
    ...options,
    forMachine: true
  });
  
  return result.book_ids;
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
