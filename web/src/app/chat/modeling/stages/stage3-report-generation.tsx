"use client";

import { motion } from "framer-motion";
import { FileText, BrainCircuit, Sigma, Activity, CheckCircle, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import ReportEditor from "~/components/editor";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useModelingStore } from "~/core/store/modeling-store";
import { cn } from "~/lib/utils";

// Helper component for the assembly animation
const AssemblingAnimation = () => {
  const modules = [
    { name: "Analysis", icon: BrainCircuit, color: "text-sky-500" },
    { name: "Formulation", icon: Sigma, color: "text-rose-500" },
    { name: "Results", icon: Activity, color: "text-emerald-500" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-8 overflow-hidden">
      <div className="relative flex items-center justify-center">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.name}
            className="absolute"
            // Animate modules flying in towards the center
            initial={{ opacity: 0, scale: 0.5, rotate: (i - 1) * 60 - 90, x: (i - 1) * 150 }}
            animate={{ opacity: [0, 1, 0], scale: 1, x: 0, y: 0, rotate: 0 }}
            transition={{ duration: 1.5, delay: i * 0.3, ease: "easeInOut" }}
          >
            <div className={cn("flex flex-col items-center justify-center p-3 rounded-lg bg-muted border", mod.color)}>
              <mod.icon className="w-8 h-8" />
              <span className="text-xs font-medium mt-1">{mod.name}</span>
            </div>
          </motion.div>
        ))}
        {/* Final document icon appears after modules disappear */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.2, duration: 0.5 }}>
          <FileText className="w-24 h-24 text-brand" />
        </motion.div>
      </div>
      <motion.p className="text-lg font-medium text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 0.5 }}>
        Assembling report from all stages...
      </motion.p>
    </div>
  );
};

export function Stage3ReportGeneration() {
  const { scenarioData, userSelections, selectSummary, setStep, currentStep } = useModelingStore(
    useShallow((state) => ({
      scenarioData: state.scenarioData,
      userSelections: state.userSelections,
      selectSummary: state.selectSummary,
      setStep: state.setStep,
      currentStep: state.currentStep,
    })),
  );
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    // On step '3.1', run the animation.
    if (currentStep === "3.1") {
      const timer = setTimeout(() => {
        setIsGenerated(true);
        // After animation, we are conceptually at step 3.2 (review & summary)
        setStep("3.2");
      }, 3000); // 3-second animation duration

      return () => clearTimeout(timer);
    }

    if (currentStep === "3.2") {
      // If we land directly on 3.2 (e.g., page refresh), skip animation
      setIsGenerated(true);
    }
  }, [currentStep, setStep]);

  if (!scenarioData) return null;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <FileText className="w-6 h-6 text-brand" />
        3. Report Integration & Output
      </h2>

      {!isGenerated ? (
        <AssemblingAnimation />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Generated Report Draft</CardTitle>
              <CardDescription>
                <span className="text-brand font-semibold">HIL Interaction:</span> Review, edit, and finalize the integrated report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* The novel editor expects markdown as content */}
              <div className="border rounded-lg p-2 max-h-[70vh] overflow-y-auto">
                <ReportEditor content={scenarioData.stage3.reportMarkdown} />
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Award className="w-5 h-5 text-brand" />
              3.2 Summary Generation & Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarioData.stage3.summaries.map((summary) => (
                <Card
                  key={summary.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    userSelections.selectedSummaryId === summary.id
                      ? "border-brand ring-2 ring-brand ring-offset-2 ring-offset-background"
                      : "hover:border-brand/50",
                  )}
                  onClick={() => selectSummary(summary.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Summary Option {summary.id.replace("s", "")}</CardTitle>
                    {userSelections.selectedSummaryId === summary.id && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{summary.text}</CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Button size="lg" variant="default" disabled={!userSelections.selectedSummaryId}>
              {userSelections.selectedSummaryId ? "Finalize Report (Workflow Complete)" : "Select a Summary to Finalize"}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
