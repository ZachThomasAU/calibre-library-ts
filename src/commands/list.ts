import { execCalibreJson } from "../core/exec";
import type { Book, BookMinimal } from "../types/book";
import type { ListOptions } from "../types/options";

/**
 * Lists the books in the Calibre library that match the criteria
 * 
 * @param options - Options for the list command
 * @returns Promise resolving to an array of books matching the criteria
 */
export async function list(options: ListOptions = {}): Promise<Book[] | BookMinimal[]> {
  const args: string[] = [];
  
  // Add command-specific options
  if (options.fields && options.fields.length > 0) {
    args.push("--fields", options.fields.join(","));
  }
  
  if (options.search) {
    args.push("--search", options.search);
  }
  
  if (options.limit !== undefined) {
    args.push("--limit", options.limit.toString());
  }
  
  if (options.sortBy) {
    const sortDirection = options.sortOrder === "DESC" ? "-" : "";
    args.push("--sort-by", `${sortDirection}${options.sortBy}`);
  }
  
  // Always use JSON (forMachine) output for easier parsing
  return execCalibreJson<Book[] | BookMinimal[]>("list", args, {
    ...options,
    forMachine: true
  });
}

/**
 * Lists all books in the Calibre library
 * 
 * @param options - Options for the list command
 * @returns Promise resolving to an array of all books
 */
export async function listAll(options: Omit<ListOptions, "search"> = {}): Promise<Book[] | BookMinimal[]> {
  return list(options);
}

/**
 * Searches for books matching the given search expression
 * 
 * @param searchExpression - Search expression to filter books
 * @param options - Additional options for the list command
 * @returns Promise resolving to an array of matching books
 */
export async function search(
  searchExpression: string,
  options: Omit<ListOptions, "search"> = {}
): Promise<Book[] | BookMinimal[]> {
  return list({
    ...options,
    search: searchExpression
  });
}

/**
 * Gets a book by its ID
 * 
 * @param id - The ID of the book to retrieve
 * @param options - Additional options for the list command
 * @returns Promise resolving to the book or null if not found
 */
export async function getBookById(
  id: number,
  options: Omit<ListOptions, "search"> = {}
): Promise<Book | BookMinimal | null> {
  const books = await list({
    ...options,
    search: `id:${id}`
  });
  
  return books.length > 0 ? books[0] : null;
}

/**
 * Gets books by their author
 * 
 * @param author - Author name to search for
 * @param options - Additional options for the list command
 * @returns Promise resolving to an array of books by the author
 */
export async function getBooksByAuthor(
  author: string,
  options: Omit<ListOptions, "search"> = {}
): Promise<Book[] | BookMinimal[]> {
  return list({
    ...options,
    search: `author:"=${author}"`
  });
}

/**
 * Gets books by their title
 * 
 * @param title - Title to search for
 * @param options - Additional options for the list command
 * @returns Promise resolving to an array of books with matching titles
 */
export async function getBooksByTitle(
  title: string,
  options: Omit<ListOptions, "search"> = {}
): Promise<Book[] | BookMinimal[]> {
  return list({
    ...options,
    search: `title:"=${title}"`
  });
}

/**
 * Gets books by a specific tag
 * 
 * @param tag - Tag to search for
 * @param options - Additional options for the list command
 * @returns Promise resolving to an array of books with the specified tag
 */
export async function getBooksByTag(
  tag: string,
  options: Omit<ListOptions, "search"> = {}
): Promise<Book[] | BookMinimal[]> {
  return list({
    ...options,
    search: `tags:"=${tag}"`
  });
}

/**
 * Gets books by their series
 * 
 * @param series - Series name to search for
 * @param options - Additional options for the list command
 * @returns Promise resolving to an array of books in the specified series
 */
export async function getBooksBySeries(
  series: string,
  options: Omit<ListOptions, "search"> = {}
): Promise<Book[] | BookMinimal[]> {
  return list({
    ...options,
    search: `series:"=${series}"`
  });
}

/**
 * Gets books with a particular format
 * 
 * @param format - Format to search for (e.g., "EPUB", "PDF", "MOBI")
 * @param options - Additional options for the list command
 * @returns Promise resolving to an array of books with the specified format
 */
export async function getBooksByFormat(
  format: string,
  options: Omit<ListOptions, "search"> = {}
): Promise<Book[] | BookMinimal[]> {
  return list({
    ...options,
    search: `formats:"=${format}"`
  });
}
