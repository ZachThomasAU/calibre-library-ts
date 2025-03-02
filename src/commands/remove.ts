import { execCalibre } from "../core/exec";
import type { RemoveOptions } from "../types/options";

/**
 * Remove books from the Calibre library
 * 
 * @param bookIds - Array of book IDs to remove
 * @param options - Options for the remove command
 * @returns Promise resolving when the books are removed
 */
export async function remove(
  bookIds: number[],
  options: RemoveOptions = {}
): Promise<void> {
  const args: string[] = bookIds.map(id => id.toString());
  
  // Add command-specific options
  if (options.permanent) {
    args.push("--permanent");
  }
  
  // The remove command doesn't return useful data, so we just wait for it to complete
  await execCalibre("remove", args, options);
}

/**
 * Remove a single book from the Calibre library
 * 
 * @param bookId - ID of the book to remove
 * @param options - Options for the remove command
 * @returns Promise resolving when the book is removed
 */
export async function removeBook(
  bookId: number,
  options: RemoveOptions = {}
): Promise<void> {
  return remove([bookId], options);
}

/**
 * Remove multiple books from the Calibre library permanently (including the files)
 * 
 * @param bookIds - Array of book IDs to remove permanently
 * @param options - Additional options for the remove command
 * @returns Promise resolving when the books are removed
 */
export async function removePermanently(
  bookIds: number[],
  options: Omit<RemoveOptions, "permanent"> = {}
): Promise<void> {
  return remove(bookIds, {
    ...options,
    permanent: true
  });
}

/**
 * Remove books matching a search expression
 * 
 * @param searchExpression - Search expression to match books to remove
 * @param options - Options for the remove command
 * @returns Promise resolving when the books are removed
 */
export async function removeBySearch(
  searchExpression: string,
  _options: RemoveOptions = {}
): Promise<void> {
  // TODO: After implementing search
  throw new Error("Not Implemented!");
}
