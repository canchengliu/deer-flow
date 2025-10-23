"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useModelingStore } from "~/core/store/modeling-store";

import { Stage1Analysis } from "./stages/stage1-analysis";
import { Stage1StrategySelection } from "./stages/stage1-strategy-selection";
import { Stage2Execution } from "./stages/stage2-execution";
import { Stage2Formulation } from "./stages/stage2-formulation";
import { Stage3ReportGeneration } from "./stages/stage3-report-generation";
import { WorkflowStepper } from "./workflow-stepper";

export function ModelingWorkflowRenderer() {
  const currentStep = useModelingStore((state) => state.currentStep);
  const scenarioData = useModelingStore((state) => state.scenarioData);

  if (!scenarioData) {
    // Initialization happens in page.tsx, this is a fallback loading state
    return (
      <div className="flex items-center justify-center h-full pt-12">
        Initializing Workflow...
      </div>
    );
  }

  // Renders the component corresponding to the current step
  const renderStep = () => {
    switch (currentStep) {
      case "1.1":
        return <Stage1Analysis />;
      case "1.2":
        return <Stage1StrategySelection />;
      case "2.1":
        return <Stage2Formulation />;
      case "2.2":
      case "2.3":
        // Steps 2.2 and 2.3 are combined in the Execution view (Interactive Sandbox)
        return <Stage2Execution />;
      // Stage 3 Implementation
      case "3.1":
      case "3.2":
        // Steps 3.1 and 3.2 are handled by the single report generation component
        return <Stage3ReportGeneration />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    // Ensure padding accounts for the fixed header (pt-12) and centers content
    <div className="flex h-full w-full flex-col items-center bg-app pt-12">
      {/* Added overflow-y-auto to allow the main content area to scroll */}
      <div className="w-full max-w-[1400px] px-4 md:px-8 py-8 overflow-y-auto h-full">
        <WorkflowStepper />

        {/* Main Content Card - Added mb-8 for spacing at the bottom when scrolling */}
        <Card className="mt-12 mb-8">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">{scenarioData.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Animate transitions between steps */}
            <AnimatePresence mode="wait">
              <motion.div
                // Use major stage for key to prevent re-animation between minor steps
                key={currentStep.split(".")[0]}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// This component is no longer needed as all stages are now implemented
// const PlaceholderStage = ({ title }: { title: string }) => (
//   <div className="p-6 text-center text-muted-foreground border border-dashed rounded-lg">
//     {title} (To be implemented)
//   </div>
// );
