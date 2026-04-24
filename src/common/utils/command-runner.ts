import { exec } from "child_process";
import { Logger } from "@nestjs/common";
import { promisify } from "util";
import { getErrorMessage } from "./error-message";

const execAsync = promisify(exec);
const logger = new Logger('CommandRunner');

export const runLinuxCommand = async (command: string): Promise<string> => {
  if (process.platform === 'win32') {
    logger.warn(`[SIMULACIÓN WINDOWS]: ${command}`);
    return 'Success';
  }
  try {
    const { stdout } = await execAsync(command);
    return stdout;
  } catch (error: unknown) {
    const errMsg = getErrorMessage(error);
    logger.error(errMsg);
    throw new Error(errMsg);
  }
};
