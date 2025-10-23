"use client";

import { ArrowRight, Cpu } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import { useModelingStore } from "~/core/store/modeling-store";

import { InteractiveSandbox } from "../components/interactive-sandbox";

export function Stage2Execution() {
  const { generateReport, isSimulating, currentStep } = useModelingStore(
    useShallow((state) => ({
      generateReport: state.generateReport,
      isSimulating: state.isSimulating,
      currentStep: state.currentStep,
    })),
  );

  const handleProceed = () => {
    if (currentStep === "2.2") {
      useModelingStore.getState().nextStep();
      return;
    }
    generateReport();
  };

  return (
    <div className="space-y-8">
      <h2 className="flex items-center gap-3 text-2xl font-bold">
        <Cpu className="h-6 w-6 text-brand" />
        2.2 &amp; 2.3 Model Execution and Analysis
      </h2>

      <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-base text-foreground dark:border-blue-800 dark:bg-blue-900/30">
        <span>
          <span className="font-semibold">HIL Interaction:</span> The model has
          been executed with default parameters. Explore the results below. You
          can adjust parameters and rerun the simulation to conduct sensitivity
          analysis.
        </span>
      </div>

      <InteractiveSandbox />

      <div className="mt-6 flex justify-end border-t pt-6">
        <Button disabled={isSimulating} onClick={handleProceed} size="lg">
          {currentStep === "2.2"
            ? "Confirm Initial Results"
            : "Proceed to Report Generation"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
