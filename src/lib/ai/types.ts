export interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: "text->text";
    tokenizer: "Llama3";
    instruct_type: "none";
  };
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
    input_cache_read: string;
    input_cache_write: string;
    web_search: string;
    internal_reasoning: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: null | number; // Added null type to match the provided object
    is_moderated: boolean;
  };
  per_request_limits: null | any; //  Added null | any as the original object's value is null
}
