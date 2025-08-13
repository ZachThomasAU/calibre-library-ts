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

// Temp directory for book files
let booksDir: string;
let libraryPath: string;

// Set up a temp directory for each test
beforeEach(async () => {
  booksDir = await createTempDir();
  libraryPath = getLibraryPath();
});

// Clean up temp directory after each test
afterEach(async () => {
  if (booksDir) {
    await cleanupTempDir(booksDir);
  }
});

describe("add command", () => {
  it("should add multiple books", async () => {
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
    // Create a test book
    const bookPath = await createMinimalBook(booksDir, "test-metadata-book");
    
    // Add the book with metadata
    const bookId = await calibredb.addBook(bookPath, {
      libraryPath,
      title: "Custom Title",
      authors: ["Author One", "Author Two"],
      tags: ["Test", "Metadata"],
      isbn: "9781451669411",
      languages: ["eng", "fra"] // English and French
    });
    
    // Verify the book was added
    expect(bookId).toBeTypeOf("number");
    
    // Get the book to verify metadata
    const book = await calibredb.getBookById(bookId as number, {
      libraryPath,
      fields: ["title", "authors", "tags", "identifiers", "languages"]
    }) as Book;
    
    // Verify the metadata
    expect(book).not.toBeNull();
    expect(book?.title).toBe("Custom Title");
    expect(book?.authors).contain("Author One");
    expect(book?.authors).contain("Author Two");
    expect(book?.tags).toEqual(expect.arrayContaining(["Test", "Metadata"]));
    expect(book.identifiers).toHaveProperty("isbn", "9781451669411");
    expect(book?.languages).toEqual(expect.arrayContaining(["eng", "fra"]));
  });

  it("should add books from a directory recursively", async () => {
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

  it("should handle duplicate books with allow-duplicates option", async () => {
    // Create a test book
    const bookPath = await createMinimalBook(booksDir, "duplicate-test");
    
    // Add the book first time
    const firstId = await calibredb.addBook(bookPath, { libraryPath });
    expect(firstId).toBeTypeOf("number");
    
    // Try to add the same book again with allowDuplicates
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
    // Create a test book
    const bookPath = await createMinimalBook(booksDir, "test-identifier-book");
    
    // Add the book with an identifier
    const bookId = await calibredb.addBook(bookPath, {
      libraryPath,
      title: "Identifier Test",
      identifiers: ["isbn:9780241248744", "doi:10.1002/andp.2005517S110"]
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
    expect(book?.identifiers).toHaveProperty("isbn", "9780241248744");
    expect(book?.identifiers).toHaveProperty("doi", "10.1002/andp.2005517S110");
  });
  
  it("should add books with oneBookPerDirectory option", async () => {
    // Create a directory with multiple formats of the same book
    const subDir = `${booksDir}/singlebook`;
    await execa("mkdir", ["-p", subDir]);
    
    // Create different format files in the directory
    await createMinimalBook(subDir, "same-book", "epub");
    await createMinimalBook(subDir, "same-book", "pdf"); 
    
    // Add the directory with oneBookPerDirectory option
    const bookIds = await calibredb.add([subDir], { 
      libraryPath,
      oneBookPerDirectory: true 
    });
    
    // Verify only one book was added (instead of two separate books)
    expect(bookIds).toHaveLength(1);
    
    // Get the book to verify it has multiple formats
    const book = await calibredb.getBookById(bookIds[0], {
      libraryPath,
      fields: ["formats"]
    }) as Book;
    
    // Verify the book has both formats
    expect(book.formats).toHaveLength(2);
    expect(book.formats.some(format => format.toLowerCase().includes("epub"))).toBe(true);
    expect(book.formats.some(format => format.toLowerCase().includes("pdf"))).toBe(true);
  });
  
  it("should respect automerge option", async () => {
    // Create multiple formats of the same book in parallel
    const [epubBookPath, pdfBookPath, newPdfBookPath] = await Promise.all([
      createMinimalBook(booksDir, "test-automerge"),
      createMinimalBook(booksDir, "test-automerge-pdf-format", "pdf"),
      createMinimalBook(booksDir, "test-automerge-overwritten-pdf-format", "pdf")
    ]);
    const EXPECTED_SIZE_OF_BOOK = 57;
    
    // Add the epub format
    const bookIds = await calibredb.add([epubBookPath, pdfBookPath], { 
      libraryPath,
      title: "Automerge Test",
      authors: ["Test Author"],
      automerge: "ignore"
    });
    
    // Check two book paths merged correctly.
    expect(bookIds).toHaveLength(1);
    let book = await calibredb.getBookById(bookIds[0], {libraryPath, fields: ["formats", "size"]}) as Book;
    expect(book.formats).toHaveLength(2);
    expect(book.formats.some(format => format.toLowerCase().includes("epub"))).toBe(true);
    expect(book.formats.some(format => format.toLowerCase().includes("pdf"))).toBe(true);
    expect(book.size).toEqual(EXPECTED_SIZE_OF_BOOK); 
    
    // Test with automerge="ignore" (should not add duplicate)
    const ignoreResult = await calibredb.addBook(newPdfBookPath, {
      libraryPath,
      title: "Automerge Test",
      authors: ["Test Author"],
      automerge: "ignore"
    });
    expect(ignoreResult).toBeNull();
    book = await calibredb.getBookById(bookIds[0], {libraryPath, fields: ["size"]}) as Book;
    expect(book.size).toEqual(EXPECTED_SIZE_OF_BOOK); // Expect no change in file contents

    // Test with automerge="overwrite" (should replace previous entry)
    const overwriteResult = await calibredb.addBook(newPdfBookPath, {
      libraryPath,
      title: "Automerge Test",
      authors: ["Test Author"],
      automerge: "overwrite"
    });
    expect(overwriteResult).toBeNull();
    book = await calibredb.getBookById(bookIds[0], {libraryPath, fields: ["size"]}) as Book;
    expect(book.size).toBeGreaterThan(EXPECTED_SIZE_OF_BOOK); // Expect longer pdf file name to increase size of book.
    
    // Test with automerge="new_record" (should create a new book)
    const newRecordId = await calibredb.addBook(pdfBookPath, {
      libraryPath,
      title: "Automerge Test",
      authors: ["Test Author"],
      automerge: "new_record"
    });
    expect(newRecordId).toBeTypeOf("number");
    expect(newRecordId).not.toBe(bookIds[0]);
    
    // Verify we now have two books
    const books = await calibredb.list({ libraryPath });
    expect(books).toHaveLength(2);
  }, 10000);
  
  it("should handle multiple authors properly", async () => {
    // Create a test book
    const bookPath = await createMinimalBook(booksDir, "test-multiple-authors");
    
    // Add the book with multiple authors
    const bookId = await calibredb.addBook(bookPath, {
      libraryPath,
      title: "Multiple Authors Test",
      authors: ["First Author", "Second Author", "Third Author"]
    });
    
    // Verify the book was added
    expect(bookId).toBeTypeOf("number");
    
    // Get the book to verify metadata
    const book = await calibredb.getBookById(bookId as number, {
      libraryPath,
      fields: ["title", "authors"]
    }) as Book;
    
    // Verify all authors are present
    expect(book).not.toBeNull();
    expect(book.authors).toContain("First Author");
    expect(book.authors).toContain("Second Author");
    expect(book.authors).toContain("Third Author");
  });
});

describe("addBook command", () => {
  it("should add a single book", async () => {
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
})

describe("addEmptyBook command", () => {
  it("should add an empty book with metadata", async () => {
    // Add an empty book with required title
    const bookId = await calibredb.addEmptyBook({
      libraryPath,
      title: "Empty Book",
      authors: ["Nobody"],
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
    // Try to add an empty book without a title
    await expect(calibredb.addEmptyBook({
      libraryPath,
      authors: ["Nobody"]
    })).rejects.toThrow("Title is required for an empty book");
  });
})
