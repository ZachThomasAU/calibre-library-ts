# calibre-library-ts

A fully-typed TypeScript wrapper for the [Calibre](https://calibre-ebook.com/) command-line tool (`calibredb`). This library allows Node.js applications to interact with a Calibre library programmatically.

## Features

- 🔒 **Type-safe API** - Fully typed with TypeScript for better developer experience
- 🛠️ **Command coverage** - Support for the most commonly used calibredb commands
- 🔄 **Promise-based** - Modern Promise-based API for all operations
- 📊 **Parsed responses** - Automatically parses JSON responses for easier consumption
- 🐞 **Improved error handling** - Detailed error messages and specialized error types
- 🔍 **Search capabilities** - Rich search functionality matching Calibre's search syntax
- 🔄 **Streaming support** - Stream output from long-running commands

## Installation

```bash
# npm
npm install calibre-library

# pnpm
pnpm add calibre-library

# yarn
yarn add calibre-library
```

## Prerequisites

- [Calibre](https://calibre-ebook.com/) must be installed and available in your PATH
- Node.js 18 or later

## Usage

### Basic usage

```typescript
import db from 'calibre-library';

// List all books in the default library
const books = await db.listAll();
console.log(`Found ${books.length} books`);

// Search for books by author
const tolkienBooks = await db.getBooksByAuthor('J.R.R. Tolkien');
console.log(`Found ${tolkienBooks.length} books by Tolkien`);

// Add a book to the library
const bookId = await db.addBook('/path/to/book.epub');
console.log(`Added book with ID: ${bookId}`);

// Remove a book
await db.removeBook(123);
```

### Working with a specific library

```typescript
import db from 'calibre-library';

// Define library path
const libraryPath = '/path/to/calibre/library';

// List all books with custom fields
const books = await db.listAll({
  libraryPath,
  fields: ['title', 'authors', 'tags', 'series']
});

// Add a book to the specified library
const bookId = await db.addBook('/path/to/book.epub', { 
  libraryPath,
  tags: ['fantasy', 'bestseller']
});
```

### Advanced search

```typescript
import db from 'calibre-library';

// Search for books published after 2020 with "programming" in the title
const recentProgrammingBooks = await db.search(
  'title:programming pubdate:>2020'
);

// Search for books with a specific tag
const fantasyBooks = await db.getBooksByTag('fantasy');

// Get books in a series
const potterBooks = await db.getBooksBySeries('Harry Potter');
```

### Error handling

```typescript
import db, { BookNotFoundError, LibraryNotFoundError } from 'calibre-library';

try {
  await db.removeBook(999999);
} catch (error) {
  if (error instanceof BookNotFoundError) {
    console.error(`Book not found: ${error.bookId}`);
  } else if (error instanceof LibraryNotFoundError) {
    console.error(`Library not found: ${error.libraryPath}`);
  } else {
    console.error(`Unknown error: ${error.message}`);
  }
}
```

## API Reference

### List Commands

#### `list(options?: ListOptions): Promise<Book[] | BookMinimal[]>`

Lists books in the library according to specified options.

#### `listAll(options?: Omit<ListOptions, "search">): Promise<Book[] | BookMinimal[]>`

Lists all books in the library.

#### `search(searchExpression: string, options?: Omit<ListOptions, "search">): Promise<Book[] | BookMinimal[]>`

Searches for books matching the expression.

#### `getBookById(id: number, options?: Omit<ListOptions, "search">): Promise<Book | BookMinimal | null>`

Gets a book by ID or null if not found.

#### `getBooksByAuthor(author: string, options?: Omit<ListOptions, "search">): Promise<Book[] | BookMinimal[]>`

Gets books by author name.

#### `getBooksByTitle(title: string, options?: Omit<ListOptions, "search">): Promise<Book[] | BookMinimal[]>`

Gets books matching the title.

#### `getBooksByTag(tag: string, options?: Omit<ListOptions, "search">): Promise<Book[] | BookMinimal[]>`

Gets books with the specified tag.

#### `getBooksBySeries(series: string, options?: Omit<ListOptions, "search">): Promise<Book[] | BookMinimal[]>`

Gets books in the specified series.

#### `getBooksByFormat(format: string, options?: Omit<ListOptions, "search">): Promise<Book[] | BookMinimal[]>`

Gets books with the specified format.

### Add Commands

#### `add(paths: string[], options?: AddOptions): Promise<number[]>`

Adds books from the specified paths.

#### `addBook(path: string, options?: AddOptions): Promise<number | null>`

Adds a single book from the path.

#### `addEmptyBook(options?: Omit<AddOptions, "empty">): Promise<number | null>`

Adds an empty book with the specified metadata.

#### `addDirectory(directoryPath: string, options?: Omit<AddOptions, "recursive">): Promise<number[]>`

Adds all books from a directory recursively.

### Remove Commands

#### `remove(bookIds: number[], options?: RemoveOptions): Promise<void>`

Removes books with the specified IDs.

#### `removeBook(bookId: number, options?: RemoveOptions): Promise<void>`

Removes a single book by ID.

#### `removePermanently(bookIds: number[], options?: Omit<RemoveOptions, "permanent">): Promise<void>`

Permanently removes books (including files).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
