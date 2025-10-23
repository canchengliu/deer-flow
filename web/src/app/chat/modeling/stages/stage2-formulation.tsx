"use client";

import { ArrowRight, Edit, Sigma, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { Markdown } from "~/components/deer-flow/markdown";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useModelingStore } from "~/core/store/modeling-store";

export function Stage2Formulation() {
  const { activeModel, nextStep, scenarioData, selectedStrategyId } =
    useModelingStore(
      useShallow((state) => ({
        activeModel: state.activeModel,
        nextStep: state.nextStep,
        scenarioData: state.scenarioData,
        selectedStrategyId: state.userSelections.selectedStrategyId,
      })),
    );

  if (!activeModel || !scenarioData || !selectedStrategyId) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
        Model data not initialized. Please complete Stage 1.
      </div>
    );
  }

  const strategyName =
    scenarioData.stage1.strategies.find(
      (strategy) => strategy.id === selectedStrategyId,
    )?.name ?? "selected strategy";

  const handleReviewComplete = () => {
    nextStep();
  };

  const handleSimulatedEdit = () => {
    toast.info(
      "HIL Interaction (Simulated): Opening Latex editor. In the full version, you could modify the formulas directly here.",
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="flex items-center gap-3 text-2xl font-bold">
        <Sigma className="h-6 w-6 text-brand" />
        2.1 Mathematical Formulation
      </h2>

      <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-base text-foreground dark:border-blue-800 dark:bg-blue-900/30">
        <span>
          <span className="font-semibold">AI Guidance:</span> Based on the{" "}
          {strategyName}, I have formalized the mathematical model. Please
          review the notation and the objective function/constraints.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              Notation Table
            </CardTitle>
            <CardDescription>Definition of variables and parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Symbol</TableHead>
                    <TableHead>Definition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeModel.notationTable.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <Markdown>{item.symbol}</Markdown>
                      </TableCell>
                      <TableCell>{item.definition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Model Formulation</CardTitle>
              <CardDescription>
                The objective function and constraints.
              </CardDescription>
            </div>
            <Button onClick={handleSimulatedEdit} size="sm" variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Formulas
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <Markdown className="max-w-none rounded-md bg-muted/50 p-4">
              {activeModel.formulationLatex}
            </Markdown>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end border-t pt-6">
        <Button onClick={handleReviewComplete} size="lg">
          Review Complete and Proceed to Execution
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
