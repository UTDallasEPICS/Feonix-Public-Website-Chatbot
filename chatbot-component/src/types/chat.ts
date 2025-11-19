export type MessageRole = 'user' | 'bot' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ExampleQuestion {
  id: string;
  question: string;
}

export interface ChatbotConfig {
  sessionId?: string | null;
  apiEndpoint: string;
  exampleQuestions?: ExampleQuestion[];
  privacyPolicyUrl?: string;
  logoElement?: React.ReactNode;
  welcomeMessage?: string;
}

export interface ChatbotProps {
  apiEndpoint: string;
  exampleQuestions?: ExampleQuestion[];
  privacyPolicyUrl?: string;
  logoElement?: React.ReactNode;
  welcomeMessage?: string;
}

export interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export interface ChatbotPanelProps {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  config: ChatbotConfig;
  onClose: () => void;
  onSend: (message: string) => void;
  onClearChat: () => void;
}

export interface ChatHeaderProps {
  onClose: () => void;
  onClearChat: () => void;
  logoElement?: React.ReactNode;
  title?: string;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatMessageProps {
  message: Message;
}

export interface WelcomeScreenProps {
  welcomeMessage?: string;
  privacyPolicyUrl?: string;
  exampleQuestions?: ExampleQuestion[];
  onQuestionSelect: (question: string) => void;
}

export interface ApiRequest {
  message: string;
  messages: Message[];
  sessionId: string;
}

export interface ApiResponse {
  message: string;
  role: MessageRole;
}
