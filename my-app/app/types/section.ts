import { ToolItem } from "./toolItem";

export interface Section {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  isExpanded: boolean;
  tools: ToolItem[];
}