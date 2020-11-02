/// <reference types="mssql" />

declare module "mssql" {
  type GlobalConnection = any;

  export function connect(config: config | string, callback?: (err: any) => void): Promise<ConnectionPool>;
  export function close(callback?: (err: any) => void): void;
  export function on(event: string, handler: (e: Event) => void): GlobalConnection;
  export function removeListener (event: string, handler: (e: Event) => void): GlobalConnection;
  export function query(command: TemplateStringsArray, ...interpolations: any[]): Promise<IResult<any>>;
  export function batch(strings: TemplateStringsArray, ...interpolations: any[]): Promise<IResult<any>>;
}