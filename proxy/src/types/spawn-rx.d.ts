declare module "spawn-rx" {
  export interface ExecutableResult {
    cmd: string;
    args: string[];
  }

  export function findActualExecutable(
    command: string,
    args: string[]
  ): ExecutableResult;
}
