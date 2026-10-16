export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  let result: Response;
  try {
    result = await fetch(`/api/v1/${path}`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(method !== "GET" ? { "Idempotency-Key": crypto.randomUUID() } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new ApiError(
      "Sem conexão com o servidor. Seus dados não enviados foram preservados nesta tela.",
      0,
      "NETWORK_ERROR",
    );
  }
  const data = await result.json();
  if (!result.ok)
    throw new ApiError(
      data.error?.message ?? "Não foi possível concluir.",
      result.status,
      data.error?.code ?? "UNKNOWN",
    );
  return data as T;
}
