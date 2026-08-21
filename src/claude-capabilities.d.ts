// Ambient types for the optional `window.claude` runtime API exposed when
// this app runs inside a published Claude Artifact. Absent in a normal
// browser deployment, where `window.claude` is simply `undefined`.
interface ClaudeDownloadsSaveRequest {
  filename: string;
  data: string | Blob | ArrayBuffer | ArrayBufferView;
}

interface ClaudeDownloadsSaveResult {
  status: "saved";
}

interface ClaudeDownloads {
  save(request: ClaudeDownloadsSaveRequest): Promise<ClaudeDownloadsSaveResult>;
}

interface ClaudeCapabilityMap {
  downloads: ClaudeDownloads;
}

interface ClaudeRuntime {
  use<K extends keyof ClaudeCapabilityMap>(name: K): Promise<ClaudeCapabilityMap[K] | null>;
}

interface Window {
  claude?: ClaudeRuntime;
}
