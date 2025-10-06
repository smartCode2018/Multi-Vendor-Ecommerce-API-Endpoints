"use client";
import useSeller from "@/hooks/useSeller";
import useSidebar from "@/hooks/useSidebar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";
import Logo from "@/assets/svg/logo";
import SidebarItem from "./sidebar.item";
import Home from "@/assets/svg/home";
import SidebarMenu from "./sidebar.menu";
import {
  BellRing,
  CalendarDays,
  CalendarPlus,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
} from "lucide-react";
import Payment from "@/assets/svg/payment";

function SidebarWrapper() {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#ff4000" : "#969696";

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: 0,
        overflow: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link
            href={"/"}
            className="flex justify-center items-center text-center gap-2"
          >
            <Logo />
            <Box>
              <h3 className="text-xl font-bold text-[#ecedee]">
                {seller?.shop.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ececdeec] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<Home fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                icon={
                  <ListOrdered
                    size={20}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
                isActive={activeSidebar === "/dashboard/orders"}
                href="/dashboard/orders"
              />
              <SidebarItem
                title="Payments"
                icon={<Payment fill={getIconColor("/dashboard/payments")} />}
                isActive={activeSidebar === "/dashboard/payments"}
                href="/dashboard/payments"
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Product"
                icon={
                  <SquarePlus
                    size={20}
                    color={getIconColor("/dashboard/create-product")}
                  />
                }
                isActive={activeSidebar === "/dashboard/create-product"}
                href="/dashboard/create-product"
              />
              <SidebarItem
                title="All Products"
                icon={
                  <PackageSearch
                    size={20}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
                isActive={activeSidebar === "/dashboard/all-products"}
                href="/dashboard/all-products"
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                title="Events"
                icon={
                  <CalendarPlus
                    size={20}
                    color={getIconColor("/dashboard/create-events")}
                  />
                }
                isActive={activeSidebar === "/dashboard/create-events"}
                href="/dashboard/create-events"
              />
              <SidebarItem
                title="All Events"
                icon={
                  <CalendarDays
                    size={20}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
                isActive={activeSidebar === "/dashboard/all-events"}
                href="/dashboard/all-events"
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                icon={
                  <Mail size={20} color={getIconColor("/dashboard/inbox")} />
                }
                isActive={activeSidebar === "/dashboard/inbox"}
                href="/dashboard/inbox"
              />
              <SidebarItem
                title="Settings"
                icon={
                  <Settings
                    size={20}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
                isActive={activeSidebar === "/dashboard/settings"}
                href="/dashboard/settings"
              />
              <SidebarItem
                title="Notifications"
                icon={
                  <BellRing
                    size={20}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
                isActive={activeSidebar === "/dashboard/notifications"}
                href="/dashboard/notifications"
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                icon={
                  <TicketPercent
                    size={20}
                    color={getIconColor("/dashboard/discount-codes")}
                  />
                }
                isActive={activeSidebar === "/dashboard/discount-codes"}
                href="/dashboard/discount-codes"
              />
              <SidebarItem
                title="Logout"
                icon={<LogOut size={20} color={getIconColor("/")} />}
                href="/"
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
}

export default SidebarWrapper;
