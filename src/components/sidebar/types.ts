import { ServerMetadata } from "../../../config/types";

export interface SidebarItem {
  key: string;
  label: string;
  icon?: string;
  color?: "success" | "warning" | "primary" | "secondary";
  href?: string;
  description?: string;
  serverId?: string;
  metadata?: ServerMetadata;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}
