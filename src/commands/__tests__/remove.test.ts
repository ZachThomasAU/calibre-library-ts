import { describe, it, expect, afterEach, beforeEach } from "vitest";

import calibredb from "../../index";
import {
  getLibraryPath,
  createTempDir,
  createMultipleBooks,
  cleanupTempDir,
  createMinimalBook,
  addBooksToLibrary,
  verifyBookNotExists
} from "../../__tests__/utils";

describe("remove command", () => {
  // Temp directory for book files
  let booksDir: string;
  
  // Set up a temp directory for each test
  beforeEach(async () => {
    booksDir = await createTempDir();
  });
  
  // Clean up temp directory after each test
  afterEach(async () => {
    if (booksDir) {
      await cleanupTempDir(booksDir);
    }
  });
  
  it("should remove a single book", async () => {
    const libraryPath = getLibraryPath();
    
    // Create and add a test book
    const bookPath = await createMinimalBook(booksDir, "test-remove-single");
    await addBooksToLibrary(libraryPath, [bookPath]);
    
    // Get the book ID
    const books = await calibredb.list({ libraryPath });
    expect(books).toHaveLength(1);
    const bookId = books[0].id;
    
    // Remove the book
    await calibredb.removeBook(bookId, { libraryPath });
    
    // Verify the book was removed
    const exists = await verifyBookNotExists(bookId);
    expect(exists).toBe(true);
    
    // The library should be empty
    const remainingBooks = await calibredb.list({ libraryPath });
    expect(remainingBooks).toHaveLength(0);
  });

  it("should remove multiple books", async () => {
    const libraryPath = getLibraryPath();
    
    // Create and add multiple test books
    const bookPaths = await createMultipleBooks(booksDir, 3, "test-remove-multiple");
    await addBooksToLibrary(libraryPath, bookPaths);
    
    // Get the book IDs
    const books = await calibredb.list({ libraryPath });
    expect(books).toHaveLength(3);
    const bookIds = books.map(book => book.id);
    
    // Remove the books
    await calibredb.remove(bookIds, { libraryPath });
    
    // Verify all books were removed
    for (const bookId of bookIds) {
      const exists = await verifyBookNotExists(bookId);
      expect(exists).toBe(true);
    }
    
    // The library should be empty
    const remainingBooks = await calibredb.list({ libraryPath });
    expect(remainingBooks).toHaveLength(0);
  });

  it("should permanently remove a book", async () => {
    const libraryPath = getLibraryPath();
    
    // Create and add a test book
    const bookPath = await createMinimalBook(booksDir, "test-permanent-remove");
    await addBooksToLibrary(libraryPath, [bookPath]);
    
    // Get the book ID
    const books = await calibredb.list({ libraryPath });
    expect(books).toHaveLength(1);
    const bookId = books[0].id;
    
    // Remove the book permanently
    await calibredb.removePermanently([bookId], { libraryPath });
    
    // Verify the book was removed
    const exists = await verifyBookNotExists(bookId);
    expect(exists).toBe(true);
    
    // The library should be empty
    const remainingBooks = await calibredb.list({ libraryPath });
    expect(remainingBooks).toHaveLength(0);
  });

  it("should handle removing non-existent books gracefully", async () => {
    const libraryPath = getLibraryPath();
    
    // Try to remove a non-existent book
    const nonExistentId = 99999;
    
    // Should not throw an error
    await expect(calibredb.removeBook(nonExistentId, { libraryPath }))
      .resolves.not.toThrow();
  });

  it("should handle removing multiple books when some don't exist", async () => {
    const libraryPath = getLibraryPath();
    
    // Create and add a test book
    const bookPath = await createMinimalBook(booksDir, "test-partial-remove");
    await addBooksToLibrary(libraryPath, [bookPath]);
    
    // Get the book ID
    const books = await calibredb.list({ libraryPath });
    expect(books).toHaveLength(1);
    const bookId = books[0].id;
    
    // Try to remove the existing book along with a non-existent one
    const nonExistentId = 99999;
    await calibredb.remove([bookId, nonExistentId], { libraryPath });
    
    // Verify the existing book was removed
    const exists = await verifyBookNotExists(bookId);
    expect(exists).toBe(true);
    
    // The library should be empty
    const remainingBooks = await calibredb.list({ libraryPath });
    expect(remainingBooks).toHaveLength(0);
  });
});
