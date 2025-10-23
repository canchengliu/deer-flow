"use client";

import { ArrowRight, Lightbulb, ListChecks, Target, Variable } from "lucide-react";
import { type ElementType, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Markdown } from "~/components/deer-flow/markdown";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { useModelingStore } from "~/core/store/modeling-store";

export function Stage1Analysis() {
  const { scenarioData, userSelections, updateAssumptions } = useModelingStore(
    useShallow((state) => ({
      scenarioData: state.scenarioData,
      userSelections: state.userSelections,
      updateAssumptions: state.updateAssumptions,
    })),
  );
  const [editableAssumptions, setEditableAssumptions] = useState(userSelections.assumptions);

  useEffect(() => {
    setEditableAssumptions(userSelections.assumptions);
  }, [userSelections.assumptions]);

  if (!scenarioData) {
    return null;
  }

  const handleAssumptionChange = (id: string, text: string) => {
    setEditableAssumptions((prev) => prev.map((assumption) => (assumption.id === id ? { ...assumption, text } : assumption)));
  };

  const handleConfirm = () => {
    updateAssumptions(editableAssumptions);
  };

  const {
    problemStatement,
    stage1: { extractedElements },
  } = scenarioData;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">1.1 Problem Understanding & Information Extraction</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Original Problem Statement</CardTitle>
          </CardHeader>
          <CardContent className="prose max-h-96 overflow-y-auto text-sm dark:prose-invert">
            <Markdown>{problemStatement}</Markdown>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>AI Extracted Elements</CardTitle>
            <CardDescription>Review the key components identified by the AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ElementSection icon={Target} title="Goal" content={extractedElements.goal} />
            <ElementSection icon={ListChecks} title="Constraints" content={extractedElements.constraints} />
            <ElementSection icon={Variable} title="Variables" content={extractedElements.variables} />
          </CardContent>
        </Card>

        <Card className="h-fit lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Global Assumptions
            </CardTitle>
            <CardDescription>
              <span className="font-semibold text-brand">HIL Interaction:</span> Review and edit the assumptions. Your input directly affects the model.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editableAssumptions.map((assumption, index) => (
              <div key={assumption.id}>
                <label className="text-xs font-medium text-muted-foreground">Assumption {index + 1}</label>
                <Textarea
                  id={`assumption-${assumption.id}`}
                  value={assumption.text}
                  onChange={(event) => handleAssumptionChange(assumption.id, event.target.value)}
                  className="mt-1 min-h-[60px] text-sm"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end border-t pt-6">
        <Button onClick={handleConfirm} size="lg">
          Confirm Analysis and Proceed to Strategy
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function ElementSection({ icon: Icon, title, content }: { icon: ElementType; title: string; content: string | string[] }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
        <Icon className="h-5 w-5 text-brand" />
        {title}
      </h4>
      <div className="ml-7 text-sm text-muted-foreground">
        {Array.isArray(content) ? (
          <ul className="list-inside list-disc space-y-1">
            {content.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
}
