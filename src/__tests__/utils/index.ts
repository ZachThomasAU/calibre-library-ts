import { execa } from "execa";
import { rimraf } from "rimraf";
import { beforeAll, afterAll, beforeEach } from "vitest";

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { Book } from "../../types/book";

// Global state for all tests
let globalLibraryPath: string;
let globalTempDir: string;

/**
 * Setup one-time global Calibre library before all tests
 */
beforeAll(async () => {
  // Create a global temp directory
  globalTempDir = await fs.mkdtemp(path.join(os.tmpdir(), "calibredb-ts-global-"));
  globalLibraryPath = path.join(globalTempDir, "library");
  
  // Create the library
  try {
    await execa("calibredb", ["--library-path", globalLibraryPath, "list"]);
    console.log(`Global test library created at: ${globalLibraryPath}`);
  } catch (error) {
    throw new Error(`Failed to create global test library: ${error}`);
  }
});

/**
 * Clean up global library after all tests
 */
afterAll(async () => {
  if (globalTempDir) {
    await rimraf(globalTempDir);
    console.log("Global test library cleaned up");
  }
});

/**
 * Reset library before each test to ensure a clean state
 */
beforeEach(async () => {
  if (!globalLibraryPath) return;
  
  try {
    // Get all books in the library
    const { stdout } = await execa(
      "calibredb",
      ["--library-path", globalLibraryPath, "list", "--for-machine"],
      { reject: false }
    );
    
    try {
      const books = JSON.parse(stdout);
      
      // If there are any books, remove them all
      if (books && books.length > 0) {
        const bookIds = books.map((book: Book) => book.id.toString());
        await execa(
          "calibredb",
          ["--library-path", globalLibraryPath, "remove", ...bookIds],
          { reject: false }
        );
      }
    } catch (_) {
      // If parsing fails, the library is probably empty
    }
  } catch (error) {
    console.warn(`Warning: Failed to reset test library: ${error}`);
  }
});

/**
 * Creates a simplified test book that Calibre can import
 * This is much faster than creating full EPUB structure
 * 
 * @param dir Directory to create the HTML file in
 * @param filename Filename for the HTML (without extension)
 * @returns Promise resolving to the path of the created HTML file
 */
export async function createMinimalBook(dir: string, filename: string): Promise<string> {
  const htmlPath = path.join(dir, `${filename}.html`);
  
  // Create a simple HTML file that Calibre can import
  const content = `<!DOCTYPE html>
<html>
<head>
  <title>${filename}</title>
  <meta charset="utf-8"/>
</head>
<body>
  <h1>${filename}</h1>
  <p>This is a test book for calibredb-ts integration tests.</p>
  <p>Author: Test Author</p>
</body>
</html>`;
  
  await fs.writeFile(htmlPath, content, "utf8");
  return htmlPath;
}

/**
 * Creates a temporary directory for test files
 * 
 * @returns Promise resolving to the path of the temporary directory
 */
export async function createTempDir(): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "calibredb-ts-files-"));
  return tempDir;
}

/**
 * Removes a directory and all its contents
 * 
 * @param dir Directory to remove
 */
export async function cleanupTempDir(dir: string): Promise<void> {
  await rimraf(dir);
}

/**
 * Creates multiple EPUB files for testing
 * 
 * @param dir Directory to create the EPUBs in
 * @param count Number of EPUBs to create
 * @param prefix Prefix for the EPUB filenames
 * @returns Promise resolving to an array of paths to the created EPUBs
 */
export async function createMultipleBooks(
  dir: string, 
  count: number, 
  prefix = "test-book"
): Promise<string[]> {
  const paths: string[] = [];
  
  for (let i = 1; i <= count; i++) {
    const filename = `${prefix}-${i}`;
    const epubPath = await createMinimalBook(dir, filename);
    paths.push(epubPath);
  }
  
  return paths;
}

/**
 * Adds multiple books to the library in a single command
 * 
 * @param libraryPath Path to the Calibre library
 * @param bookPaths Array of paths to the books to add
 * @returns Promise resolving when the books are added
 */
export async function addBooksToLibrary(
  libraryPath: string,
  bookPaths: string[]
): Promise<void> {
  if (bookPaths.length === 0) return;
  
  // Add all books in a single command
  await execa("calibredb", ["--library-path", libraryPath, "add", ...bookPaths]);
}

/**
 * Verifies that a book exists in the library by ID
 * 
 * @param bookId ID of the book to verify
 * @returns Promise resolving to true if the book exists, false otherwise
 */
export async function verifyBookExists(bookId: number): Promise<boolean> {
  try {
    const { stdout } = await execa(
      "calibredb", 
      ["--library-path", globalLibraryPath, "list", "--search", `id:${bookId}`, "--for-machine"]
    );
    
    const books = JSON.parse(stdout);
    return books.length > 0 && books[0].id === bookId;
  } catch (_error) {
    return false;
  }
}

/**
 * Verifies that a book does not exist in the library by ID
 * 
 * @param bookId ID of the book to verify
 * @returns Promise resolving to true if the book does not exist, false otherwise
 */
export async function verifyBookNotExists(bookId: number): Promise<boolean> {
  return !(await verifyBookExists(bookId));
}

/**
 * Gets the global library path
 * 
 * @returns The path to the global test library
 */
export function getLibraryPath(): string {
  if (!globalLibraryPath) {
    throw new Error("Global library path not initialized");
  }
  return globalLibraryPath;
}
