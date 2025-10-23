// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { GithubOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useEffect } from "react";

import { Button } from "~/components/ui/button";
import { useModelingStore } from "~/core/store/modeling-store";

import { Logo } from "../../components/deer-flow/logo";
import { ThemeToggle } from "../../components/deer-flow/theme-toggle";
import { Tooltip } from "../../components/deer-flow/tooltip";
import { SettingsDialog } from "../settings/dialogs/settings-dialog";

const Main = dynamic(() => import("./main"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center pt-12">
      Loading DeerFlow...
    </div>
  ),
});

function ChatPageContent() {
  const t = useTranslations("chat.page");
  const searchParams = useSearchParams();
  const initializeModeling = useModelingStore((state) => state.initialize);
  const isModelingMode = useModelingStore((state) => state.isModelingMode);

  useEffect(() => {
    const mode = searchParams.get("mode");
    const isModeling = mode === "modeling";
    initializeModeling(isModeling);

    return () => {
      if (!isModeling) {
        useModelingStore.getState().reset();
      }
    };
  }, [searchParams, initializeModeling]);

  return (
    <div className="flex h-screen w-screen justify-center overscroll-none">
      <header className="fixed top-0 left-0 flex h-12 w-full items-center justify-between border-b bg-app px-4 z-20">
        {!isModelingMode && <Logo />}
        <div className="flex items-center">
          {!isModelingMode && (
            <Tooltip title={t("starOnGitHub")}>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://github.com/bytedance/deer-flow" target="_blank">
                  <GithubOutlined />
                </Link>
              </Button>
            </Tooltip>
          )}
          <ThemeToggle />
          <Suspense>
            <SettingsDialog />
          </Suspense>
        </div>
      </header>
      <Main />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
