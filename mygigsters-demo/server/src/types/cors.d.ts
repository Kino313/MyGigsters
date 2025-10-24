// Minimal TypeScript declarations for 'cors' to satisfy TS7016 if @types/cors is not installed.
declare module 'cors' {
  import type { RequestHandler } from 'express'

  export interface CorsOptions {
    origin?:
      | boolean
      | string
      | RegExp
      | (string | RegExp)[]
      | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void)
    methods?: string | string[]
    allowedHeaders?: string | string[]
    exposedHeaders?: string | string[]
    credentials?: boolean
    maxAge?: number
    preflightContinue?: boolean
    optionsSuccessStatus?: number
  }

  const cors: (options?: CorsOptions) => RequestHandler
  export default cors
}

