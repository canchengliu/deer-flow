"use client";

import { AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Markdown } from "~/components/deer-flow/markdown";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import type { ModelingStrategy } from "~/core/mock/types";
import { useModelingStore } from "~/core/store/modeling-store";
import { cn } from "~/lib/utils";

export function Stage1StrategySelection() {
  const { scenarioData, selectStrategy, selectedStrategyId } = useModelingStore(
    useShallow((state) => ({
      scenarioData: state.scenarioData,
      selectStrategy: state.selectStrategy,
      selectedStrategyId: state.userSelections.selectedStrategyId,
    })),
  );

  const strategies = scenarioData?.stage1.strategies ?? [];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">1.2 Modeling Approach Generation &amp; Selection</h2>

      <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30">
        <Lightbulb className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-base text-foreground">
          <span className="font-semibold">AI Guidance:</span> Based on the analysis, please review the proposed modeling strategies, compare their strengths and weaknesses, and choose the one you wish to pursue.
        </p>
      </div>

      <div className={cn("grid gap-8", strategies.length >= 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            isSelected={strategy.id === selectedStrategyId}
            onSelect={selectStrategy}
          />
        ))}
      </div>
    </div>
  );
}

function StrategyCard({
  strategy,
  isSelected,
  onSelect,
}: {
  strategy: ModelingStrategy;
  isSelected: boolean;
  onSelect: (strategyId: string) => void;
}) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col transition-all duration-300 hover:border-brand hover:shadow-lg",
        isSelected && "border-brand shadow-lg",
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl">{strategy.name}</CardTitle>
        <CardDescription>{strategy.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-6">
        <div>
          <h4 className="mb-3 font-semibold">Proposed Workflow (Flowchart)</h4>
          <div className="flex items-center justify-center rounded-lg border bg-muted/50 p-4">
            <Markdown>{strategy.flowchartSvg}</Markdown>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-green-700 dark:text-green-500">
              <CheckCircle className="h-4 w-4" />
              Strengths
            </h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {strategy.pros.map((pro, index) => (
                <li key={index}>{pro}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              Weaknesses
            </h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {strategy.cons.map((con, index) => (
                <li key={index}>{con}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button className="w-full" size="lg" onClick={() => onSelect(strategy.id)} variant={isSelected ? "default" : "secondary"}>
          {isSelected ? "Selected" : "Select This Strategy"}
        </Button>
      </CardFooter>
    </Card>
  );
}
