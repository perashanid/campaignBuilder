// Global type declarations as fallback
declare module 'pg' {
  export interface Pool {
    query(text: string, params?: any[]): Promise<{ rows: any[] }>;
    connect(): Promise<any>;
    on(event: string, listener: (...args: any[]) => void): void;
    end(): Promise<void>;
  }
  export class Pool {
    constructor(config?: any);
  }
}

// Ensure Node.js globals are available
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      DATABASE_URL?: string;
      PORT?: string;
      CORS_ORIGINS?: string;
    }
    interface Process {
      env: ProcessEnv;
      argv: string[];
      exit(code?: number): never;
    }
  }
  
  var process: NodeJS.Process;
}

export {};