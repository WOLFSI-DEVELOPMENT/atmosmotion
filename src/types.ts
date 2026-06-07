export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  clarificationQuestion?: {
    question: string;
    options: string[];
  };
  planApproval?: boolean;
}

export interface Source {
  title: string;
  url: string;
  content: string;
  icon?: string;
}

export interface RemotionData {
  code: string;
  durationInFrames: number;
  fps: number;
  compositionWidth?: number;
  compositionHeight?: number;
  planMarkdown?: string;
  sources?: Source[];
  prompt?: string;
}

export interface SavedMedia {
  id: string;
  name: string;
  content: string; // The base64 or raw SVG string
}

export interface VideoFolder {
  id: string;
  name: string;
  color: string;
  videoIds: string[];
}

export interface SavedVideo {
  id: string;
  prompt: string;
  date: string;
  durationInFrames: number;
  code?: string;
  fps?: number;
  compositionWidth?: number;
  compositionHeight?: number;
  messages?: Message[];
  dataHistory?: RemotionData[];
  historyIndex?: number;
  folderId?: string;
}

export interface ChatResponse {
  textResponse: string;
  planMarkdown?: string;
  remotionCode: string;
  durationInFrames: number;
  fps: number;
  compositionWidth?: number;
  compositionHeight?: number;
  sources?: Source[];
  clarificationQuestion?: {
    question: string;
    options: string[];
  };
  planApproval?: boolean;
}
