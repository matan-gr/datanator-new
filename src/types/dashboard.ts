export interface SyncRun {
 id: string;
 timestamp: string;
 status: string;
 totalFilesGenerated: number;
 totalItemsParsed: number;
 errorSummary: string | null;
 triggerType: string;
}

export interface SourceMetric {
 id: string;
 sourceName: string;
 sourceUrl: string;
 lastSyncTimestamp: string;
 itemsParsedLastSync: number;
 healthStatus: string;
 lastErrorMessage: string | null;
 lastTriggerType: string | null;
}

export interface AppLog {
 id: string;
 timestamp: string;
 level: string;
 message: string;
 syncRunId: string | null;
 metadata: string | null;
}

export interface OutputFile {
 name: string;
 size: number;
 lastModified: string;
}
