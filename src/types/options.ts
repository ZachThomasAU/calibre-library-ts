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
   * Whether to request machine-readable output (JSON)
   * @default false
   */
  forMachine?: boolean;
  
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
   * Fields to include in the output
   */
  fields?: string[];
  
  /**
   * Search expression to filter books
   */
  search?: string;
  
  /**
   * Maximum number of books to return
   */
  limit?: number;
  
  /**
   * Ascending (ASC) or descending (DESC) sort order
   */
  sortOrder?: "ASC" | "DESC";
  
  /**
   * Field to sort by
   */
  sortBy?: string;
}

/**
 * Options specific to the `add` command
 */
export interface AddOptions extends CalibreOptions {
  /**
   * Whether to add formats to existing records based on identifier
   * @default false
   */
  addToExisting?: boolean;
  
  /**
   * Whether to ignore duplicate books
   * @default false
   */
  ignoreDuplicates?: boolean;
  
  /**
   * Whether to recurse through directories
   * @default false
   */
  recursive?: boolean;
  
  /**
   * Whether to add books with matching ISBNs to existing book records
   * @default false
   */
  duplicateIsbn?: boolean;
  
  /**
   * Whether to add empty book records
   * @default false
   */
  empty?: boolean;
  
  /**
   * Author string to use for all added books
   */
  author?: string;
  
  /**
   * Title string to use for all added books
   */
  title?: string;
  
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
   * Identifier for added books (like isbn:xxx, doi:xxx)
   */
  identifier?: string;
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
   * Fields to include in the output
   */
  fields?: string[];
}

/**
 * Options specific to the `add_format` command
 */
export interface AddFormatOptions extends CalibreOptions {
  /**
   * Whether to replace existing format
   * @default false
   */
  replace?: boolean;
}

/**
 * Options specific to the `show_metadata` command
 */
export interface ShowMetadataOptions extends CalibreOptions {
  /**
   * Whether to include all metadata fields
   * @default false
   */
  all?: boolean;
}

/**
 * Options specific to the `set_metadata` command
 */
export interface SetMetadataOptions extends CalibreOptions {
  /**
   * Field to update
   */
  field: string;
  
  /**
   * New value for the field
   */
  value: string;
}
