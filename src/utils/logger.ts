import chalk from "chalk";
import path from "node:path";
import { fileURLToPath } from "node:url";

const Logger = console.log;
const IS_PROD = false;

function getCallerInfo(): string {
  if (IS_PROD) return "";

  const error = {} as Error;
  Error.captureStackTrace(error, getCallerInfo);

  const stack = (error.stack || "").split("\n");
  const callerLine = stack[2];
  if (!callerLine) return "";

  const match =
    callerLine.match(/\((.*):(\d+):(\d+)\)$/) ||
    callerLine.match(/at (.*):(\d+):(\d+)$/);

  if (!match) return "";

  let fileName = match[1]!;
  const lineNumber = match[2];

  if (fileName.startsWith("file://")) {
    fileName = fileURLToPath(fileName);
  }

  const relativePath = path
    .relative(process.cwd(), fileName)
    .replace(/\\/g, "/");

  return chalk.gray(`[${relativePath}:${lineNumber}]`);
}

export function log(
  message: string,
  type: "info" | "error" | "warning" | "success" = "info",
) {
  const time = new Date().toLocaleTimeString();
  const location = getCallerInfo();
  const prefix = `[${time}]`;

  switch (type) {
    case "info":
      Logger(chalk.blue(`${prefix} [INFO]`), location, message);
      break;
    case "error":
      Logger(chalk.red(`${prefix} [ERROR]`), location, message);
      break;
    case "warning":
      Logger(chalk.yellow(`${prefix} [WARNING]`), location, message);
      break;
    case "success":
      Logger(chalk.green(`${prefix} [SUCCESS]`), location, message);
      break;
  }
}
