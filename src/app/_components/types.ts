import { type RefObject } from "react";

export type FileType = "html";

export interface CommonProps {
  documentContainerRef: RefObject<HTMLDivElement | null>;
  codeContainerRef: RefObject<HTMLDivElement | null>;
  handleCopyText: (text: string | null | undefined, type: string) => void;
  handleGenerateDocument: (
    requirement: string,
    feedback?: string,
  ) => Promise<void>;
  handleGenerateCode: (type: string) => void;
  issueDescription: string | null;
  setIssueDescription: (description: string) => void;
  handleFixCode: (description: string) => Promise<void>;
}
