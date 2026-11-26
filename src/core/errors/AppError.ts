/** Shared error shape for user-facing + technical details */
export type AppErrorCode =
  | 'storage'
  | 'import'
  | 'export'
  | 'preview'
  | 'ai'
  | 'validation'
  | 'unknown'

export interface AppError {
  code: AppErrorCode
  message: string
  technical?: string
  at: string
}

export function makeAppError(
  code: AppErrorCode,
  message: string,
  technical?: string,
): AppError {
  return { code, message, technical, at: new Date().toISOString() }
}
