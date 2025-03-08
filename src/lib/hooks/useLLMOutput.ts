import { useState, useEffect } from 'react';
import type { LLMOutputComponent } from "@llm-ui/react";

interface Block {
  type: string;
  match: (text: string) => boolean;
  component: LLMOutputComponent;
}

interface BlockMatch {
  type: string;
  output: string;
  component: LLMOutputComponent;
}

interface UseLLMOutputOptions {
  llmOutput: string;
  blocks: Block[];
  fallbackBlock: Block;
  isStreamFinished: boolean;
}

export function useLLMOutput({
  llmOutput,
  blocks,
  fallbackBlock,
  isStreamFinished
}: UseLLMOutputOptions) {
  const [blockMatches, setBlockMatches] = useState<BlockMatch[]>([]);

  useEffect(() => {
    if (!llmOutput) {
      setBlockMatches([]);
      return;
    }

    const matches: BlockMatch[] = [];
    let remainingText = llmOutput;

    while (remainingText.length > 0) {
      let matched = false;

      // Try each block matcher in order
      for (const block of blocks) {
        if (block.match(remainingText)) {
          matches.push({
            type: block.type,
            output: remainingText,
            component: block.component
          });
          remainingText = '';
          matched = true;
          break;
        }
      }

      // If no block matched, use fallback
      if (!matched) {
        matches.push({
          type: fallbackBlock.type,
          output: remainingText,
          component: fallbackBlock.component
        });
        remainingText = '';
      }
    }

    setBlockMatches(matches);
  }, [llmOutput, blocks, fallbackBlock, isStreamFinished]);

  return { blockMatches };
}