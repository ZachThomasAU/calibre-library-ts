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
 * Creates a minimal valid EPUB file for testing
 * 
 * @param dir Directory to create the EPUB in
 * @param filename Filename for the EPUB (without extension)
 * @returns Promise resolving to the path of the created EPUB
 */
export async function createMinimalEpub(dir: string, filename: string): Promise<string> {
  const epubPath = path.join(dir, `${filename}.epub`);
  
  // Create a minimal OPF file structure in a temporary directory
  const epubContentDir = path.join(dir, `${filename}-content`);
  await fs.mkdir(epubContentDir, { recursive: true });
  
  // Create META-INF directory and container.xml
  const metaInfDir = path.join(epubContentDir, "META-INF");
  await fs.mkdir(metaInfDir, { recursive: true });
  
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  
  await fs.writeFile(path.join(metaInfDir, "container.xml"), containerXml);
  
  // Create mimetype file
  await fs.writeFile(path.join(epubContentDir, "mimetype"), "application/epub+zip");
  
  // Create content.opf file
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${filename}</dc:title>
    <dc:creator>Test Author</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId">urn:uuid:${generateUUID()}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="content" href="content.html" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="content"/>
  </spine>
</package>`;
  
  await fs.writeFile(path.join(epubContentDir, "content.opf"), contentOpf);
  
  // Create toc.ncx file
  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${generateUUID()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${filename}</text>
  </docTitle>
  <navMap>
    <navPoint id="navpoint-1" playOrder="1">
      <navLabel>
        <text>Start</text>
      </navLabel>
      <content src="content.html"/>
    </navPoint>
  </navMap>
</ncx>`;
  
  await fs.writeFile(path.join(epubContentDir, "toc.ncx"), tocNcx);
  
  // Create content.html file
  const contentHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${filename}</title>
</head>
<body>
  <h1>${filename}</h1>
  <p>This is a test book for calibredb-ts integration tests.</p>
</body>
</html>`;
  
  await fs.writeFile(path.join(epubContentDir, "content.html"), contentHtml);
  
  // Create the EPUB file using zip
  try {
    // Save the current directory
    const currentDir = process.cwd();
    
    // Change to the content directory
    process.chdir(epubContentDir);
    
    // Create the mimetype file first without compression
    await execa("zip", ["-X0", epubPath, "mimetype"]);
    
    // Add the rest of the files with compression
    await execa("zip", ["-Xr9D", epubPath, "*", "-x", "mimetype"]);
    
    // Restore the current directory
    process.chdir(currentDir);
    
    return epubPath;
  } catch (error) {
    throw new Error(`Failed to create EPUB file: ${error}`);
  }
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
 * Generates a UUID v4
 * 
 * @returns A random UUID v4 string
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Creates multiple EPUB files for testing
 * 
 * @param dir Directory to create the EPUBs in
 * @param count Number of EPUBs to create
 * @param prefix Prefix for the EPUB filenames
 * @returns Promise resolving to an array of paths to the created EPUBs
 */
export async function createMultipleEpubs(
  dir: string, 
  count: number, 
  prefix = "test-book"
): Promise<string[]> {
  const paths: string[] = [];
  
  for (let i = 1; i <= count; i++) {
    const filename = `${prefix}-${i}`;
    const epubPath = await createMinimalEpub(dir, filename);
    paths.push(epubPath);
  }
  
  return paths;
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
