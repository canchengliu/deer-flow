"use client";

import { Check } from "lucide-react";

import { useCurrentStage } from "~/core/store/modeling-store";
import { cn } from "~/lib/utils";

const STAGES = [
  { id: "1", name: "Analysis & Strategy" },
  { id: "2", name: "Execution & Analysis" },
  { id: "3", name: "Report Generation" },
] as const;

export function WorkflowStepper() {
  const currentStageId = useCurrentStage();
  const currentStageIndex = STAGES.findIndex((stage) => stage.id === currentStageId);

  return (
    <nav aria-label="Progress" className="mx-auto w-full max-w-3xl">
      <ol role="list" className="relative flex items-center justify-between pb-8">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const showConnector = index < STAGES.length - 1;

          return (
            <li key={stage.id} className={cn("flex items-center", showConnector && "flex-1")}>
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-500",
                  isCompleted && "bg-brand text-white",
                  isCurrent && "border-2 border-brand bg-background text-brand",
                  !isCompleted && !isCurrent && "border-2 border-gray-300 bg-background text-gray-500 dark:border-gray-600 dark:text-gray-400",
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" aria-hidden="true" /> : <span className="text-sm font-medium">{stage.id}</span>}
                <span className="absolute left-1/2 top-10 w-max -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
                  {stage.name}
                </span>
              </div>
              {showConnector && (
                <div className="flex h-0.5 flex-1 items-center" aria-hidden="true">
                  <div
                    className={cn(
                      "h-full w-full transition-colors duration-500",
                      index < currentStageIndex ? "bg-brand" : "bg-gray-200 dark:bg-gray-700",
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
