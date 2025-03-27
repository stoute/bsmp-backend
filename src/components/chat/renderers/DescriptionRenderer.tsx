import { type LLMOutputComponent } from "@llm-ui/react";
import { type PromptTemplate } from "@types";

interface BlockMatch {
  output: string;
}

interface Props {
  blockMatch: BlockMatch;
  template?: PromptTemplate;
}

export const DescriptionRenderer: LLMOutputComponent<Props> = ({
  blockMatch,
  template,
}) => {
  return (
    // <div className="animate-fade-in rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
    <div className="custom-render DescriptionRenderer animate-fade-in">
      <div className="mb-3 flex items-center gap-3 pb-0">
        <img
          src="/images/logo-light.svg"
          className="block h-6 w-auto dark:hidden"
          alt="Logo Light"
        />
        <img
          src="/images/logo-dark.svg"
          className="hidden h-6 w-auto dark:block"
          alt="Logo Dark"
        />
        <h4 className="font-bold text-zinc-800 dark:text-zinc-200">
          {template?.name}
        </h4>
      </div>
      <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
        {blockMatch.output}
      </div>
    </div>
  );
};
