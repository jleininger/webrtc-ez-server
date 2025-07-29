const DEBUG_MODE = Deno.env.get("DEBUG") ?? false;

export function log(msg: string, ...args: unknown[]) {
  if (DEBUG_MODE) {
    console.log(msg, ...args);
  }
}

export function logError(err: string, ...args: unknown[]) {
  if (DEBUG_MODE) {
    console.error(err, ...args);
  }
}
