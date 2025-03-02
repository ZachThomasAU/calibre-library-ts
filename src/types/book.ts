/**
 * Represents a format of a book (e.g., EPUB, PDF, MOBI)
 */
export interface BookFormat {
  /**
   * The format name (e.g., EPUB, PDF, MOBI)
   */
  format: string;
  
  /**
   * Path to the format file
   */
  path: string;
  
  /**
   * Size of the format file in bytes
   */
  size: number;
  
  /**
   * Last modified date of the format file
   */
  mtime: string;
}

/**
 * Represents a book author
 */
export interface Author {
  /**
   * The author's name
   */
  name: string;
  
  /**
   * Link to the author's page (if available)
   */
  link?: string;
}

/**
 * Represents a book's publication information
 */
export interface PublicationInfo {
  /**
   * The publisher's name
   */
  publisher?: string;
  
  /**
   * Publication date (ISO string)
   */
  publishDate?: string;
  
  /**
   * ISBN-10 identifier
   */
  isbn?: string;
  
  /**
   * ISBN-13 identifier
   */
  isbn13?: string;
}

/**
 * Represents a series that a book belongs to
 */
export interface Series {
  /**
   * The name of the series
   */
  name: string;
  
  /**
   * The book's position in the series
   */
  index: number;
}

/**
 * Represents an identifier for a book
 */
export interface Identifier {
  /**
   * The type of identifier (e.g., isbn, doi, amazon)
   */
  type: string;
  
  /**
   * The value of the identifier
   */
  value: string;
}

/**
 * Represents a book in the Calibre library
 */
export interface Book {
  /**
   * The unique ID of the book in the library
   */
  id: number;
  
  /**
   * The book's title
   */
  title: string;
  
  /**
   * The list of authors
   */
  authors: string[];
  
  /**
   * The book's primary author
   */
  author_sort?: string;
  
  /**
   * The book's formats as an array of format names
   */
  formats: string[];
  
  /**
   * The detailed information about each format
   */
  format_metadata?: Record<string, BookFormat>;
  
  /**
   * The UUID of the book
   */
  uuid: string;
  
  /**
   * The timestamp when the book was added to the library
   */
  timestamp: string;
  
  /**
   * The timestamp of the last modified date for the book
   */
  last_modified: string;
  
  /**
   * The book's tags
   */
  tags?: string[];
  
  /**
   * The book's comments or description
   */
  comments?: string;
  
  /**
   * The series information
   */
  series?: string;
  
  /**
   * The book's position in the series
   */
  series_index?: number;
  
  /**
   * The path to the book's cover image
   */
  cover?: string;
  
  /**
   * The book's publisher
   */
  publisher?: string;
  
  /**
   * The book's publication date
   */
  pubdate?: string;
  
  /**
   * The book's languages
   */
  languages?: string[];
  
  /**
   * The book's identifiers (ISBN, DOI, etc.)
   */
  identifiers?: Record<string, string>;
  
  /**
   * The book's size in bytes
   */
  size?: number;
  
  /**
   * User-defined custom fields (metadata)
   * The keys are the custom field names, the values depend on the field type
   */
  user_metadata?: Record<string, unknown>;
  
  /**
   * The book's rating (0-5)
   */
  rating?: number;
  
  /**
   * Whether the book has been read
   */
  read?: boolean;
}

/**
 * Represents a stripped-down version of a book with minimal fields
 * Used for list command results when fields aren't specified
 */
export interface BookMinimal {
  /**
   * The unique ID of the book in the library
   */
  id: number;
  
  /**
   * The book's title
   */
  title: string;
  
  /**
   * The list of authors
   */
  authors: string[];
}

/**
 * All possible fields that can be requested for a book
 */
export enum BookField {
  ID = "id",
  TITLE = "title",
  AUTHORS = "authors",
  AUTHOR_SORT = "author_sort",
  SERIES = "series",
  SERIES_INDEX = "series_index",
  PUBLISHER = "publisher",
  TAGS = "tags",
  LANGUAGES = "languages",
  IDENTIFIERS = "identifiers",
  TIMESTAMP = "timestamp",
  LAST_MODIFIED = "last_modified",
  PUBDATE = "pubdate",
  COMMENTS = "comments",
  RATING = "rating",
  UUID = "uuid",
  FORMATS = "formats",
  SIZE = "size",
  COVER = "cover",
  READ = "read"
}
