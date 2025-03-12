import { type LLMOutputComponent } from "@llm-ui/react";
import { type IPromptTemplate } from "@types";

interface BlockMatch {
  output: string;
}

interface Props {
  blockMatch: BlockMatch;
  template?: IPromptTemplate;
}

export const DescriptionRenderer: LLMOutputComponent<Props> = ({
  blockMatch,
  template,
}) => {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
      <div className="flex items-center gap-2">
        <img
          src={"images/logo-light.svg"}
          className="block h-8 w-auto dark:hidden"
          alt="Logo Light"
        />
        <img
          src={"images/logo-dark.svg"}
          className="hidden h-8 w-auto dark:block"
          alt="Logo Dark"
        />
        <h3 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
          {template?.name}
        </h3>
      </div>
      <div className="text-sm text-yellow-700 dark:text-yellow-300">
        {blockMatch.output}
      </div>
    </div>
  );
};
