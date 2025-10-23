// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { toast } from "sonner";
import { create } from "zustand";

import { DISTRIBUTION_CENTER_SCENARIO } from "../mock/modeling-mock-data";
import type { ExecutionResult, ModelDetails, ModelingScenario } from "../mock/types";

const STEPS = ["1.1", "1.2", "2.1", "2.2", "2.3", "3.1", "3.2"] as const;
export type Step = (typeof STEPS)[number];

interface UserSelections {
  assumptions: Array<{ id: string; text: string }>;
  selectedStrategyId: string | null;
  modelParameters: Record<string, number>;
  selectedSummaryId: string | null;
}

interface ModelingState {
  isModelingMode: boolean;
  currentStep: Step;
  scenarioData: ModelingScenario | null;
  userSelections: UserSelections;
  activeModel: ModelDetails | null;
  activeResults: ExecutionResult | null;
  isSimulating: boolean;
  initialize: (useMock: boolean) => void;
  nextStep: () => void;
  setStep: (step: Step) => void;
  updateAssumptions: (assumptions: Array<{ id: string; text: string }>) => void;
  selectStrategy: (strategyId: string) => void;
  updateParametersAndRerun: (newParameters: Record<string, number>) => void;
  generateReport: () => void;
  selectSummary: (summaryId: string) => void;
  reset: () => void;
  _updateActiveModelAndResults: (simulateDelay?: boolean) => void;
}

const initialState: Omit<
  ModelingState,
  | "initialize"
  | "nextStep"
  | "setStep"
  | "updateAssumptions"
  | "selectStrategy"
  | "updateParametersAndRerun"
  | "generateReport"
  | "selectSummary"
  | "reset"
  | "_updateActiveModelAndResults"
> = {
  isModelingMode: false,
  currentStep: "1.1",
  scenarioData: null,
  userSelections: {
    assumptions: [],
    selectedStrategyId: null,
    modelParameters: {},
    selectedSummaryId: null,
  },
  activeModel: null,
  activeResults: null,
  isSimulating: false,
};

export const useModelingStore = create<ModelingState>((set, get) => ({
  ...initialState,

  initialize: (useMock) => {
    if (useMock) {
      const scenario = DISTRIBUTION_CENTER_SCENARIO;
      set({
        isModelingMode: true,
        scenarioData: scenario,
        currentStep: "1.1",
        userSelections: {
          ...initialState.userSelections,
          assumptions: scenario.stage1.initialAssumptions,
        },
      });
    } else {
      set({ isModelingMode: false });
    }
  },

  nextStep: () => {
    set((state) => {
      const currentIndex = STEPS.indexOf(state.currentStep);
      if (currentIndex < STEPS.length - 1) {
        return { currentStep: STEPS[currentIndex + 1] };
      }
      return {};
    });
  },

  setStep: (step) => {
    set({ currentStep: step });
  },

  updateAssumptions: (assumptions) => {
    set((state) => ({
      userSelections: {
        ...state.userSelections,
        assumptions,
      },
    }));
    get().nextStep();
  },

  selectStrategy: (strategyId) => {
    set((state) => ({
      userSelections: {
        ...state.userSelections,
        selectedStrategyId: strategyId,
      },
    }));
    get()._updateActiveModelAndResults(false);
    get().nextStep();
  },

  updateParametersAndRerun: (newParameters) => {
    set((state) => ({
      userSelections: {
        ...state.userSelections,
        modelParameters: {
          ...state.userSelections.modelParameters,
          ...newParameters,
        },
      },
    }));
    get()._updateActiveModelAndResults(true);
  },

  generateReport: () => {
    toast.info("Generating report (Simulated)...");
    get().nextStep();
  },

  selectSummary: (summaryId) => {
    set((state) => ({
      userSelections: {
        ...state.userSelections,
        selectedSummaryId: summaryId,
      },
    }));
  },

  reset: () => {
    set(initialState);
  },

  _updateActiveModelAndResults: (simulateDelay = false) => {
    const state = get();
    const { scenarioData, userSelections } = state;
    const { selectedStrategyId, modelParameters } = userSelections;

    if (!scenarioData || !selectedStrategyId) {
      set({ activeModel: null, activeResults: null });
      return;
    }

    const activeModel = scenarioData.stage2.models[selectedStrategyId];
    if (!activeModel) {
      set({ activeModel: null, activeResults: null });
      return;
    }

    const currentParams = { ...modelParameters };
    let paramsChanged = false;
    activeModel.parameters.forEach((param) => {
      if (currentParams[param.id] === undefined) {
        currentParams[param.id] = param.defaultValue;
        paramsChanged = true;
      }
    });

    const findResult = () =>
      activeModel.results.find((result) =>
        Object.keys(result.parameterSet).every((key) => {
          const expected = result.parameterSet[key];
          const actual = currentParams[key];
          return expected != null && actual != null && Math.abs(expected - actual) < 0.001;
        }),
      ) ?? activeModel.results[0];

    if (simulateDelay) {
      set({ isSimulating: true });
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            const activeResults = findResult() ?? null;
            set({
              activeModel,
              activeResults,
              isSimulating: false,
              userSelections: paramsChanged
                ? { ...userSelections, modelParameters: currentParams }
                : userSelections,
            });
            resolve(true);
          }, 1500);
        }),
        {
          loading: "Running model simulation...",
          success: "Simulation complete. Results updated.",
          error: "Simulation failed (Mock).",
        },
      );
    } else {
      const activeResults = findResult() ?? null;
      set({
        activeModel,
        activeResults,
        userSelections: paramsChanged
          ? { ...userSelections, modelParameters: currentParams }
          : userSelections,
      });
    }
  },
}));

export const useCurrentStage = () =>
  useModelingStore((state) => state.currentStep.split(".")[0]);
