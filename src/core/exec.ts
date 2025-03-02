import { execa } from "execa";
import type { CalibreOptions } from "../types/options";
import { CalibreError } from "./errors";

/**
 * Executes a calibredb command with the provided arguments and options
 * 
 * @param command - The calibredb command to execute
 * @param args - Array of command arguments
 * @param options - Calibre options including library path, etc.
 * @returns Promise resolving to the command output
 * @throws {CalibreError} When the command execution fails
 */
export async function execCalibre(
  command: string,
  args: string[] = [],
  options: CalibreOptions = {}
): Promise<string> {
  const { libraryPath, calibreBin = "calibredb", forMachine = false } = options;
  
  const execArgs: string[] = [command];
  
  // Add library path if provided
  if (libraryPath) {
    execArgs.push("--library-path", libraryPath);
  }
  
  // Add for-machine flag if requested
  if (forMachine) {
    execArgs.push("--for-machine");
  }
  
  // Add all other arguments
  execArgs.push(...args);
  
  try {
    const { stdout } = await execa(calibreBin, execArgs);
    return stdout;
  } catch (error) {
    // Handle error from execa
    if (error instanceof Error) {
      // If it's from execa, it should have stdout, stderr, etc.
      const execaError = error as unknown as { stderr: string; stdout: string; message: string };
      
      throw new CalibreError(
        `Failed to execute calibredb ${command}: ${execaError.message}`,
        command,
        execaError.stderr || execaError.stdout || "No error output available"
      );
    }
    
    // Re-throw unknown errors
    throw error;
  }
}

/**
 * Executes a calibredb command that returns JSON output
 * 
 * @param command - The calibredb command to execute
 * @param args - Array of command arguments
 * @param options - Calibre options including library path, etc.
 * @returns Promise resolving to the parsed JSON output
 * @throws {CalibreError} When the command execution or JSON parsing fails
 */
export async function execCalibreJson<T>(
  command: string,
  args: string[] = [],
  options: CalibreOptions = {}
): Promise<T> {
  // Force forMachine to true for JSON output
  const jsonOptions: CalibreOptions = {
    ...options,
    forMachine: true
  };
  
  const output = await execCalibre(command, args, jsonOptions);
  
  try {
    return JSON.parse(output) as T;
  } catch (error) {
    throw new CalibreError(
      `Failed to parse JSON output from calibredb ${command}`,
      command,
      output
    );
  }
}

/**
 * Executes a calibredb command with streaming output
 * 
 * @param command - The calibredb command to execute
 * @param args - Array of command arguments
 * @param options - Calibre options including library path, etc.
 * @returns ExecaChildProcess for managing the streaming process
 */
export function execCalibreStream(
  command: string,
  args: string[] = [],
  options: CalibreOptions = {}
) {
  const { libraryPath, calibreBin = "calibredb", forMachine = false } = options;
  
  const execArgs: string[] = [command];
  
  if (libraryPath) {
    execArgs.push("--library-path", libraryPath);
  }
  
  if (forMachine) {
    execArgs.push("--for-machine");
  }
  
  execArgs.push(...args);
  
  return execa(calibreBin, execArgs, { 
    stdio: ["ignore", "pipe", "pipe"] 
  });
}
