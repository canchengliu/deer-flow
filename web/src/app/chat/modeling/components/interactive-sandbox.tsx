"use client";

import { Activity, Code as CodeIcon, Loader2, Play, SlidersHorizontal } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import type { ModelParameter } from "~/core/mock/types";
import { useModelingStore } from "~/core/store/modeling-store";
import { cn } from "~/lib/utils";

const VisualizationContainer = ({
  children,
  isSimulating,
}: {
  children: React.ReactNode;
  isSimulating: boolean;
}) => (
  <div
    className={cn(
      "transition-opacity duration-500",
      isSimulating && "pointer-events-none opacity-50",
    )}
  >
    {children}
  </div>
);

export function InteractiveSandbox() {
  const {
    activeModel,
    activeResults,
    userSelections,
    updateParametersAndRerun,
    isSimulating,
  } = useModelingStore(
    useShallow((state) => ({
      activeModel: state.activeModel,
      activeResults: state.activeResults,
      userSelections: state.userSelections,
      updateParametersAndRerun: state.updateParametersAndRerun,
      isSimulating: state.isSimulating,
    })),
  );
  const { resolvedTheme } = useTheme();

  const initialParams = useMemo(() => {
    if (!activeModel) return {};
    const defaults: Record<string, number> = {};
    activeModel.parameters.forEach((param) => {
      const value = userSelections.modelParameters[param.id];
      defaults[param.id] =
        typeof value === "number" ? value : param.defaultValue;
    });
    return defaults;
  }, [activeModel, userSelections.modelParameters]);

  const [localParams, setLocalParams] =
    useState<Record<string, number>>(initialParams);

  useEffect(() => {
    setLocalParams(initialParams);
  }, [initialParams]);

  const handleParamChange = (id: string, value: number) => {
    if (Number.isNaN(value)) return;
    setLocalParams((prev) => ({ ...prev, [id]: value }));
  };

  const handleRerun = () => {
    updateParametersAndRerun(localParams);
  };

  const canRerun = useMemo(() => {
    if (!activeModel) return false;
    if (!activeResults) return true;
    return activeModel.parameters.some((param) => {
      const pendingValue =
        localParams[param.id] ?? param.defaultValue ?? Number.NaN;
      const activeValue = activeResults.parameterSet[param.id];
      if (Number.isNaN(pendingValue)) return false;
      if (typeof activeValue !== "number") return true;
      return Math.abs(pendingValue - activeValue) > 0.001;
    });
  }, [activeModel, activeResults, localParams]);

  if (!activeModel || !activeResults) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span className="ml-3 text-sm text-muted-foreground">
          Loading model and initial results...
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Model Parameters
            </CardTitle>
            <CardDescription>
              Adjust inputs and rerun the simulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeModel.parameters.map((param) => (
              <ParameterControl
                key={param.id}
                param={param}
                value={localParams[param.id] ?? param.defaultValue}
                onChange={handleParamChange}
                disabled={isSimulating}
              />
            ))}
          </CardContent>
          <div className="p-4 pt-0">
            <Button
              className="w-full"
              disabled={isSimulating || !canRerun}
              onClick={handleRerun}
            >
              {isSimulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Rerun Simulation
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CodeIcon className="h-5 w-5" />
              Implementation Code (Python)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto rounded-md bg-muted text-sm">
              <SyntaxHighlighter
                language="python"
                style={resolvedTheme === "dark" ? dark : docco}
                customStyle={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                {activeModel.implementationCode.trim()}
              </SyntaxHighlighter>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <VisualizationContainer isSimulating={isSimulating}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Visualization &amp; Analysis
              </CardTitle>
              <CardDescription>Output based on the current parameters.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center justify-center rounded-lg bg-muted/50 p-4">
                <Markdown>{activeResults.visualizationSvg}</Markdown>
              </div>
              <Markdown className="prose-sm mb-4">
                {activeResults.analysisText}
              </Markdown>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Object.entries(activeResults.keyMetrics).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg border bg-accent p-3 shadow-sm"
                  >
                    <div className="text-xs font-medium text-muted-foreground">
                      {key}
                    </div>
                    <div className="text-xl font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </VisualizationContainer>
      </div>
    </div>
  );
}

function ParameterControl({
  param,
  value,
  onChange,
  disabled,
}: {
  param: ModelParameter;
  value: number;
  onChange: (id: string, value: number) => void;
  disabled: boolean;
}) {
  if (param.type === "slider" && param.range) {
    const [min, max] = param.range;
    const displayValue = Number.isFinite(value) ? value : param.defaultValue;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`param-${param.id}`}>{param.name}</Label>
          <span className="text-sm font-medium">
            {displayValue.toFixed(2)}
          </span>
        </div>
        <Slider
          id={`param-${param.id}`}
          min={min}
          max={max}
          step={param.step ?? 0.01}
          value={[displayValue]}
          onValueChange={(vals) => onChange(param.id, vals[0] ?? displayValue)}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`param-${param.id}`}>{param.name}</Label>
      <Input
        id={`param-${param.id}`}
        type="number"
        value={Number.isFinite(value) ? value : param.defaultValue}
        onChange={(event) =>
          onChange(param.id, parseFloat(event.target.value) || param.defaultValue)
        }
        disabled={disabled}
      />
    </div>
  );
}
