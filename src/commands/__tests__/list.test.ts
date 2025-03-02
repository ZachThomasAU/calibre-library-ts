import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { execa } from "execa";

import calibredb from "../../index";
import {
  getLibraryPath,
  createTempDir,
  createMultipleEpubs,
  cleanupTempDir
} from "../../__tests__/utils";

describe("list command", () => {
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
  
  it("should list all books in an empty library", async () => {
    const libraryPath = getLibraryPath();
    
    // Empty library should return an empty array
    const books = await calibredb.list({ libraryPath });
    
    expect(books).toEqual([]);
  });

  it("should list all books in a non-empty library", async () => {
    const libraryPath = getLibraryPath();
    
    // Create test books
    const epubPaths = await createMultipleEpubs(booksDir, 3);
    
    // Add books to the library
    for (const epubPath of epubPaths) {
      await execa("calibredb", ["--library-path", libraryPath, "add", epubPath]);
    }
    
    // List all books
    const books = await calibredb.list({ libraryPath });
    
    // Verify the results
    expect(books).toHaveLength(3);
    expect(books[0]).toHaveProperty("id");
    expect(books[0]).toHaveProperty("title");
    expect(books[0]).toHaveProperty("authors");
  });

  it("should filter books by search query", async () => {
    const libraryPath = getLibraryPath();
    
    // Create test books with specific titles
    const epubPaths = [
      await createMultipleEpubs(booksDir, 1, "romance"),
      await createMultipleEpubs(booksDir, 1, "mystery")
    ].flat();
    
    // Add books to the library
    for (const epubPath of epubPaths) {
      await execa("calibredb", ["--library-path", libraryPath, "add", epubPath]);
    }
    
    // Search for books with "romance" in the title
    const romanceBooks = await calibredb.search("title:romance", { libraryPath });
    
    // Verify the results
    expect(romanceBooks).toHaveLength(1);
    expect(romanceBooks[0].title).toContain("romance");
    
    // Get a book by ID
    const allBooks = await calibredb.list({ libraryPath });
    const firstBookId = allBooks[0].id;
    
    const bookById = await calibredb.getBookById(firstBookId, { libraryPath });
    
    // Verify the result
    expect(bookById).not.toBeNull();
    expect(bookById).toHaveProperty("id", firstBookId);
  });

  it("should return specific fields when requested", async () => {
    const libraryPath = getLibraryPath();
    
    // Create test books
    const epubPaths = await createMultipleEpubs(booksDir, 1);
    
    // Add book to the library
    await execa("calibredb", ["--library-path", libraryPath, "add", epubPaths[0]]);
    
    // List books with specific fields
    const books = await calibredb.list({
      libraryPath,
      fields: ["id", "title", "authors", "tags"]
    });
    
    // Verify the results
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty("id");
    expect(books[0]).toHaveProperty("title");
    expect(books[0]).toHaveProperty("authors");
    expect(books[0]).toHaveProperty("tags");
    
    // Some fields should not be included
    expect(books[0]).not.toHaveProperty("formats");
    expect(books[0]).not.toHaveProperty("publisher");
  });

  it("should correctly handle sorting", async () => {
    const libraryPath = getLibraryPath();
    
    // Create test books with alphabetical titles
    const prefixes = ["A-Book", "B-Book", "C-Book"];
    const epubPaths: string[][] = [];
    
    for (const prefix of prefixes) {
      epubPaths.push(await createMultipleEpubs(booksDir, 1, prefix));
    }
    
    // Add books to the library
    for (const epubPath of epubPaths.flat()) {
      await execa("calibredb", ["--library-path", libraryPath, "add", epubPath]);
    }
    
    // List books sorted by title in ascending order
    const ascBooks = await calibredb.list({
      libraryPath,
      sortBy: "title",
      sortOrder: "ASC"
    });
    
    // Verify ascending order
    expect(ascBooks).toHaveLength(3);
    expect(ascBooks[0].title).toContain("A-Book");
    expect(ascBooks[1].title).toContain("B-Book");
    expect(ascBooks[2].title).toContain("C-Book");
    
    // List books sorted by title in descending order
    const descBooks = await calibredb.list({
      libraryPath,
      sortBy: "title",
      sortOrder: "DESC"
    });
    
    // Verify descending order
    expect(descBooks).toHaveLength(3);
    expect(descBooks[0].title).toContain("C-Book");
    expect(descBooks[1].title).toContain("B-Book");
    expect(descBooks[2].title).toContain("A-Book");
  });

  it("should correctly handle limit option", async () => {
    const libraryPath = getLibraryPath();
    
    // Create multiple test books
    const epubPaths = await createMultipleEpubs(booksDir, 5);
    
    // Add books to the library
    for (const epubPath of epubPaths) {
      await execa("calibredb", ["--library-path", libraryPath, "add", epubPath]);
    }
    
    // List books with a limit
    const limitedBooks = await calibredb.list({
      libraryPath,
      limit: 2
    });
    
    // Verify the results
    expect(limitedBooks).toHaveLength(2);
    
    // List all books without limit
    const allBooks = await calibredb.list({ libraryPath });
    
    // Verify all books are returned
    expect(allBooks).toHaveLength(5);
  });

  it("should handle getting book by author correctly", async () => {
    const libraryPath = getLibraryPath();
    
    // Create test book
    const epubPath = await createMultipleEpubs(booksDir, 1, "author-test");
    
    // Add book with custom author
    await execa("calibredb", [
      "--library-path", libraryPath, 
      "add", epubPath[0], 
      "--author", "Jane Doe"
    ]);
    
    // Get book by author
    const booksByAuthor = await calibredb.getBooksByAuthor("Jane Doe", { libraryPath });
    
    // Verify the results
    expect(booksByAuthor).toHaveLength(1);
    expect(booksByAuthor[0].authors).toContain("Jane Doe");
    
    // Search for non-existent author
    const nonExistentAuthorBooks = await calibredb.getBooksByAuthor("Non-Existent Author", { libraryPath });
    
    // Verify no books are returned
    expect(nonExistentAuthorBooks).toHaveLength(0);
  });
});
