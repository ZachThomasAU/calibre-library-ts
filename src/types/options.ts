type Field = "id" | "author_sort" | "authors" | "comments" | "cover" | "formats"
  | "identifiers" | "isbn" | "languages" | "last_modified" | "pubdate"
  | "publisher" | "rating" | "series" | "series_index" | "size" | "tags"
  | "template" | "timestamp" | "title" | "uuid" | "all"

/**
 * Base configuration options for all calibredb commands
 */
export interface CalibreOptions {
  /**
   * Path to the Calibre library
   * If not provided, calibredb will use the default configured library
   */
  libraryPath?: string;
  
  /**
   * Custom path to the calibredb executable
   * @default "calibredb"
   */
  calibreBin?: string;
  
  /**
   * Whether to use streaming mode for the command output
   * @default false
   */
  stream?: boolean;
  
  /**
   * Whether to log commands being executed to console
   * Useful for debugging
   * @default false
   */
  debug?: boolean;
}

/**
 * Options specific to the `list` command
 */
export interface ListOptions extends CalibreOptions {
  /**
   * Fields to include in the output. The special field "all" can be used to
   * select all fields
   * @default ["title", "authors"]
   */
  fields?: Field[];
  
  /**
   * Field to sort by
   */
  sortBy?: string | string[];
  
  /**
   * Ascending (ASC) or descending (DESC) sort order
   * @default "DESC"
   */
  sortOrder?: "ASC" | "DESC";
  
  /**
   * Search expression to filter books
   */
  search?: string;
  
  /**
   * Maximum number of books to return
   */
  limit?: number;

  /**
   * Whether to request machine-readable output (JSON)
   * @default false
   */
  forMachine?: boolean;
}

/**
 * Options specific to the `add` command
 */
export interface AddOptions extends CalibreOptions {
  /**
   * Whether to allow duplicate books. Comparison is done based on book titles
   * and authors. NOTE: `automerge` takes precedence.
   * @default false
   */
  allowDuplicates?: boolean;

  /**
   * If books with similar titles and authors are found, merge the incoming
   * formats (files) automatically into existing book records. A value of
   * "ignore" means duplicate formats are discarded. A value of "overwrite"
   * means duplicate formats in the library are overwritten with the newly added
   * files. A value of "new_record" means duplicate formats are placed into a
   * new book record.
   * @default "ignore"
   */
  automerge?: "ignore" | "overwrite" | "new_record";
  
  /**
   * Whether to add empty book records (with no formats)
   * @default false
   */
  empty?: boolean;
  
  /**
   * Title string to use for all added books
   */
  title?: string;
  
  /**
   * Author string to use for all added books
   */
  author?: string;

  /**
   * ISBN string to use for all added books
   */
  isbn?: string;
  
  /**
   * Identifier for added books (like isbn:xxx, doi:xxx)
   */
  identifiers?: string[];
  
  /**
   * Tags to add to added books
   */
  tags?: string[];
  
  /**
   * Series name for added books
   */
  series?: string;
  
  /**
   * Series index for added books
   */
  seriesIndex?: number;

  /**
   * List of languages (best to use ISO639 language codes, though some language
   * names may also be recognized)
   */
  languages?: string[];
  
  /**
   * Whether to recurse through directories
   * @default false
   */
  recursive?: boolean;

  /**
   * Assume that each folder has only a single logical book and that all files
   * in it are different e-book formats of that book
   * @default false
   */
  oneBookPerDirectory?: boolean;
}

/**
 * Options specific to the `remove` command
 */
export interface RemoveOptions extends CalibreOptions {
  /**
   * Whether to permanently delete the book files
   * @default false
   */
  permanent?: boolean;
}

/**
 * Options specific to the `search` command
 */
export interface SearchOptions extends CalibreOptions {
  /**
   * Maximum number of books to return
   */
  limit?: number;
}

/**
 * Options specific to the `add_format` command
 */
export interface AddFormatOptions extends CalibreOptions {
  /**
   * Whether to replace existing format
   * @default true
   */
  replace?: boolean;

  /**
   * Add the file as an extra data file to the book, not an ebook format
   * @default true
   */
  asExtraDataFile?: boolean;
}

/**
 * Options specific to the `show_metadata` command
 */
export interface ShowMetadataOptions extends CalibreOptions {
  /**
   * Print metadata in OPF form (XML)
   * @default false
   */
  asOpf?: boolean;
}

/**
 * Options specific to the `set_metadata` command
 */
export interface SetMetadataOptions extends CalibreOptions {
  /**
   * Field to update
   */
  field: Field;
}

// TODO: 
// export
// catalog
// saved_searches
// add_custom_column
// custom_columns
// remove_custom_column
// set_custom
// restore_database
// check_library
// list_categories
// backup_metadata
// clone
// embed_metadata
// search
// fts_index
// fts_search
