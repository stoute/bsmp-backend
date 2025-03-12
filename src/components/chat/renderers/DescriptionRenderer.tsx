import { type LLMOutputComponent } from "@llm-ui/react";

export const DescriptionRenderer: LLMOutputComponent = ({ blockMatch }) => {
  // Only render if the message is an AIMessage with name="description"
  // if (message?.name !== "description") {
  //   return null;
  // }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
      <h3 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
        Description
      </h3>
      <div className="text-sm text-yellow-700 dark:text-yellow-300">
        {blockMatch.output}
      </div>
    </div>
  );
};
