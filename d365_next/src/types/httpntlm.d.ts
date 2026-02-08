declare module "httpntlm" {
  interface HttpNtlmOptions {
    url: string;
    username: string;
    password: string;
    domain?: string;
    workstation?: string;
    headers?: Record<string, string>;
    body?: string;
  }

  interface HttpNtlmResponse {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  type HttpNtlmCallback = (
    err: Error | null,
    res: HttpNtlmResponse
  ) => void;

  export function get(
    options: HttpNtlmOptions,
    callback: HttpNtlmCallback
  ): void;

  export function post(
    options: HttpNtlmOptions,
    callback: HttpNtlmCallback
  ): void;

  export function put(
    options: HttpNtlmOptions,
    callback: HttpNtlmCallback
  ): void;

  export function patch(
    options: HttpNtlmOptions,
    callback: HttpNtlmCallback
  ): void;

  export function delete_(
    options: HttpNtlmOptions,
    callback: HttpNtlmCallback
  ): void;
}
