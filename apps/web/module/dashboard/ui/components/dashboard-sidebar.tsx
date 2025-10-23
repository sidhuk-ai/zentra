"use client";

import { ThemeToggle } from "@/components/theme-provider";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  ChevronsUpDown,
  CreditCardIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LibraryBig,
  MicIcon,
  PaletteIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const DashsboardSidebar = () => {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const isActive = (url: string): boolean => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(url);
  };
  const userCustomerSupportItems = [
    {
      title: "Conversations",
      url: "/conversations",
      icon: InboxIcon,
    },
    {
      title: "Knowledge Base",
      url: "/files",
      icon: LibraryBig,
    },
  ];
  const userConfigurationItems = [
    {
      title: "Widget Customization",
      url: "/customization",
      icon: PaletteIcon,
    },
    {
      title: "Integrations",
      url: "/integrations",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Voice Assistants",
      url: "/plugins/vapi",
      icon: MicIcon,
    },
  ];
  const userAccountItems = [
    {
      title: "Plans & Billings",
      url: "/billing",
      icon: CreditCardIcon,
    },
  ];
  return (
    <Sidebar className="group" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size={"lg"}>
              <OrganizationSwitcher
                hidePersonal
                skipInvitationScreen
                appearance={{
                  elements: {
                    rootBox: "w-full! h-8!",
                    avatarBox: "size-5! rounded-sm!",
                    organizationSwitcherTrigger:
                      "w-full! justify-start! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-accent-foreground/90! bg-accent-foreground!",
                    organizationPreview:
                      "group-data-[collapsible=icon]:justify-center! gap-2!",
                    organizationPreviewTextContainer:
                      "group-data-[collapsible=icon]:hidden! text-xs! font-medium! text-sidebar!",
                    organizationSwitcherTriggerIcon:
                      "group-data-[collapsible=icon]:hidden! ml-auto! text-sidebar-foreground!",
                  },
                }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Customer Support */}
        <SidebarGroup>
          <SidebarGroupLabel>Customer Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userCustomerSupportItems.map((items) => (
                <SidebarMenuItem key={items.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={items.title}
                    isActive={isActive(items.url)}
                  >
                    <Link href={items.url}>
                      <items.icon className="size-4" />
                      <span>{items.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Configurations */}
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userConfigurationItems.map((items) => (
                <SidebarMenuItem key={items.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={items.title}
                    isActive={isActive(items.url)}
                  >
                    <Link href={items.url}>
                      <items.icon className="size-4" />
                      <span>{items.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userAccountItems.map((items) => (
                <SidebarMenuItem key={items.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={items.title}
                    isActive={isActive(items.url)}
                  >
                    <Link href={items.url}>
                      <items.icon className="size-4" />
                      <span>{items.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <PaletteIcon className="text-muted-foreground" />
                  <p className="text-sm truncate group-data-[collapsible=icon]:hidden text-muted-foreground">
                    Theme
                  </p>
                  <ChevronsUpDown className="text-muted-foreground ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-border"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <ThemeToggle />
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserButton
              showName
              appearance={{
                elements: {
                  rootBox: "w-full! h-8!",
                  userButtonTrigger:
                    "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
                  userButtonBox:
                    "w-full! flex-row-reverse! justify-end! gap-2! group-data-[collapsible=icon]:justify-center! text-sidebar-accent-foreground!",
                  userButtonOuterIdentifier:
                    "pl-0! group-data-[collapsible=icon]:hidden!",
                  avatarBox: "size-5!",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
