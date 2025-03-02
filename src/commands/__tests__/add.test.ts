import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { execa } from "execa";

import calibredb, { Book } from "../../index";
import {
  getLibraryPath,
  createTempDir,
  createMultipleBooks,
  cleanupTempDir,
  createMinimalBook,
  verifyBookExists
} from "../../__tests__/utils";

describe("add command", () => {
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
  
  it("should add a single book", async () => {
    const libraryPath = getLibraryPath();
    
    // Create a test book
    const bookPath = await createMinimalBook(booksDir, "test-single-book");
    
    // Add the book to the library
    const bookId = await calibredb.addBook(bookPath, { libraryPath });
    
    // Verify the book was added and has an ID
    expect(bookId).toBeTypeOf("number");
    expect(bookId).toBeGreaterThan(0);
    
    // Verify the book exists in the library
    const exists = await verifyBookExists(bookId as number);
    expect(exists).toBe(true);
  });

  it("should add multiple books", async () => {
    const libraryPath = getLibraryPath();
    
    // Create multiple test books
    const bookPaths = await createMultipleBooks(booksDir, 3, "test-multiple");
    
    // Add the books to the library
    const bookIds = await calibredb.add(bookPaths, { libraryPath });
    
    // Verify all books were added
    expect(bookIds).toHaveLength(3);
    
    // Verify each book exists
    for (const bookId of bookIds) {
      const exists = await verifyBookExists(bookId);
      expect(exists).toBe(true);
    }
  });

  it("should add a book with metadata", async () => {
    const libraryPath = getLibraryPath();
    
    // Create a test book
    const bookPath = await createMinimalBook(booksDir, "test-metadata-book");
    
    // Add the book with metadata
    const bookId = await calibredb.addBook(bookPath, {
      libraryPath,
      title: "Custom Title",
      author: "Custom Author",
      tags: ["Test", "Metadata"]
    });
    
    // Verify the book was added
    expect(bookId).toBeTypeOf("number");
    
    // Get the book to verify metadata
    const book = await calibredb.getBookById(bookId as number, {
      libraryPath,
      fields: ["title", "authors", "tags"]
    }) as Book;
    
    // Verify the metadata
    expect(book).not.toBeNull();
    expect(book?.title).toBe("Custom Title");
    expect(book?.authors).toContain("Custom Author");
    expect(book?.tags).toContain("Test");
    expect(book?.tags).toContain("Metadata");
  });

  it("should add an empty book with metadata", async () => {
    const libraryPath = getLibraryPath();
    
    // Add an empty book with required title
    const bookId = await calibredb.addEmptyBook({
      libraryPath,
      title: "Empty Book",
      author: "Nobody",
      tags: ["Empty"]
    });
    
    // Verify the book was added
    expect(bookId).toBeTypeOf("number");
    
    // Get the book to verify metadata
    const book = await calibredb.getBookById(bookId as number, {
      libraryPath,
      fields: ["title", "authors", "tags", "formats"]
    }) as Book;
    
    // Verify the metadata
    expect(book).not.toBeNull();
    expect(book?.title).toBe("Empty Book");
    expect(book?.authors).toContain("Nobody");
    expect(book?.tags).toContain("Empty");
    
    // An empty book should have no formats
    expect(book?.formats).toHaveLength(0);
  });

  it("should throw an error when adding an empty book without a title", async () => {
    const libraryPath = getLibraryPath();
    
    // Try to add an empty book without a title
    await expect(calibredb.addEmptyBook({
      libraryPath,
      author: "Nobody"
    })).rejects.toThrow("Title is required for an empty book");
  });

  it("should add books from a directory recursively", async () => {
    const libraryPath = getLibraryPath();
    
    // Create a nested structure
    const subDir = `${booksDir}/subdir`;
    await execa("mkdir", ["-p", subDir]);
    
    // Create books in both directories
    await createMinimalBook(booksDir, "root-book");
    await createMinimalBook(subDir, "sub-book");
    
    // Add the directory recursively
    const bookIds = await calibredb.addDirectory(booksDir, { libraryPath });
    
    // Verify both books were added
    expect(bookIds.length).toBeGreaterThanOrEqual(2);
    
    // Get all books to verify
    const books = await calibredb.list({ libraryPath });
    
    // Check for our books in the results
    const rootBook = books.find(book => book.title.includes("root-book"));
    const subBook = books.find(book => book.title.includes("sub-book"));
    
    expect(rootBook).toBeDefined();
    expect(subBook).toBeDefined();
  });

  it("should handle duplicate books with ignore-duplicates option", async () => {
    const libraryPath = getLibraryPath();
    
    // Create a test book
    const bookPath = await createMinimalBook(booksDir, "duplicate-test");
    
    // Add the book first time
    const firstId = await calibredb.addBook(bookPath, { libraryPath });
    expect(firstId).toBeTypeOf("number");
    
    // Try to add the same book again with ignoreDuplicates
    const secondId = await calibredb.addBook(bookPath, {
      libraryPath,
      allowDuplicates: false
    });
    expect(secondId).toBeNull();
    
    // Verify only one book exists
    const books = await calibredb.list({ libraryPath });
    expect(books.length).toBe(1);

    // Try to add the same book again with allowDuplicates
    const thirdId = await calibredb.addBook(bookPath, {
      libraryPath,
      allowDuplicates: true
    });
    expect(thirdId).toBeTypeOf("number");
    
    // Verify two books now exist
    const newBooks = await calibredb.list({ libraryPath });
    expect(newBooks.length).toBe(2);

  });
  
  it("should add a book with series metadata", async () => {
    const libraryPath = getLibraryPath();
    
    // Create a test book
    const bookPath = await createMinimalBook(booksDir, "test-series-book");
    
    // Add the book with series metadata
    const bookId = await calibredb.addBook(bookPath, {
      libraryPath,
      title: "Series Test",
      series: "Test Series",
      seriesIndex: 2.5
    });
    
    // Verify the book was added
    expect(bookId).toBeTypeOf("number");
    
    // Get the book to verify metadata
    const book = await calibredb.getBookById(bookId as number, {
      libraryPath,
      fields: ["title", "series", "series_index"]
    }) as Book;
    
    // Verify the series metadata
    expect(book).not.toBeNull();
    expect(book?.series).toBe("Test Series");
    expect(book?.series_index).toBe(2.5);
  });

  it("should add a book with identifier", async () => {
    const libraryPath = getLibraryPath();
    
    // Create a test book
    const bookPath = await createMinimalBook(booksDir, "test-identifier-book");
    
    // Add the book with an identifier
    const bookId = await calibredb.addBook(bookPath, {
      libraryPath,
      title: "Identifier Test",
      identifiers: ["isbn:9781234567890"]
    });
    
    // Verify the book was added
    expect(bookId).toBeTypeOf("number");
    
    // Get the book to verify metadata
    const book = await calibredb.getBookById(bookId as number, {
      libraryPath,
      fields: ["title", "identifiers"]
    }) as Book;
    
    // Verify the identifier
    expect(book).not.toBeNull();
    expect(book?.identifiers).toHaveProperty("isbn", "9781234567890");
  });
});
