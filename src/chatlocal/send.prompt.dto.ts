export class SendPromptDto {
  prompt: string;
  model?: string = 'gpt-oss';
  temperature?: number = 0;
  max_tokens?: number = 132000;
}