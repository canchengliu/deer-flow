// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export interface ModelParameter {
  id: string;
  name: string;
  type: "slider" | "input";
  defaultValue: number;
  range?: [number, number];
  step?: number;
  description?: string;
}

export interface ExecutionResult {
  // Parameters used to produce this result snapshot.
  parameterSet: Record<string, number>;
  // Pre-rendered SVG snippet, wrapped in fenced code, for lightweight visualization.
  visualizationSvg: string;
  // Brief AI-style analysis for the current run.
  analysisText: string;
  // Key-value metrics surfaced to the UI.
  keyMetrics: Record<string, string | number>;
}

export interface ModelDetails {
  // Stage 2.1: mathematical formulation.
  notationTable: Array<{ symbol: string; definition: string }>;
  formulationLatex: string;
  // Stage 2.2: implementation scaffold and tunable parameters.
  implementationCode: string;
  parameters: ModelParameter[];
  // Stage 2.3: deterministic results for predefined parameter sets.
  results: ExecutionResult[];
}

export interface ModelingStrategy {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  flowchartSvg: string;
}

export interface ModelingScenario {
  id: string;
  title: string;
  problemStatement: string;
  stage1: {
    extractedElements: {
      goal: string;
      constraints: string[];
      variables: string[];
    };
    initialAssumptions: Array<{ id: string; text: string }>;
    strategies: ModelingStrategy[];
  };
  stage2: {
    models: Record<string, ModelDetails>;
  };
  stage3: {
    reportMarkdown: string;
    summaries: Array<{ id: string; text: string }>;
  };
}
