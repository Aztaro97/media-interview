import { SidebarLink } from "@/components/SidebarItems";
import { Cog, File, HomeIcon, Tag } from "lucide-react";

export const defaultLinks: SidebarLink[] = [
  { href: "/dashboard", title: "Home", icon: HomeIcon },
  { href: "/file-management", title: "File Management", icon: File },
  { href: "/tags", title: "Tags", icon: Tag },
  { href: "/settings", title: "Settings", icon: Cog },
];

export const additionalLinks = [];