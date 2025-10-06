"use client";
import { activeSidebarItem } from "@/config/constants";
import { useAtom } from "jotai";

function useSidebar() {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSidebarItem);
  return { activeSidebar, setActiveSidebar };
}

export default useSidebar;
