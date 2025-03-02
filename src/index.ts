// Re-export error types for better error handling
export * from "./core/errors";

// Re-export type definitions
export * from "./types/book";
export * from "./types/options";

// Export commands
import * as list from "./commands/list";
import * as add from "./commands/add";
import * as remove from "./commands/remove";

// Create a unified API object
const calibredb = {
  /**
   * List and search commands
   */
  list: list.list,
  listAll: list.listAll,
  search: list.search,
  getBookById: list.getBookById,
  getBooksByAuthor: list.getBooksByAuthor,
  getBooksByTitle: list.getBooksByTitle,
  getBooksByTag: list.getBooksByTag,
  getBooksBySeries: list.getBooksBySeries,
  getBooksByFormat: list.getBooksByFormat,
  
  /**
   * Add commands
   */
  add: add.add,
  addBook: add.addBook,
  addEmptyBook: add.addEmptyBook,
  addDirectory: add.addDirectory,
  
  /**
   * Remove commands
   */
  remove: remove.remove,
  removeBook: remove.removeBook,
  removePermanently: remove.removePermanently,
  removeBySearch: remove.removeBySearch
};

// Export default instance
export default calibredb;

// Also export all commands individually
export {
  list,
  add,
  remove
};
