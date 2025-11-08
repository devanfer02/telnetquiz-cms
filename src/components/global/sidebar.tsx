import { FileQuestionIcon, Layers, LayoutDashboard, LogOut, MessageSquareDot, Users } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Link } from "@tanstack/react-router";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard
  },
  {
    title: "Chapters",
    url: "/chapters",
    icon: Layers
  },
  {
    title: "Quiz",
    url: "/quiz",
    icon: MessageSquareDot,
  },
  {
    title: "Questions",
    url: "/questions",
    icon: FileQuestionIcon
  },
  {
    title: "Users",
    url: "/users",
    icon: Users
  }
]

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="bg-telnet-primary">
        <SidebarGroupLabel className="text-xl">
          TelNetQuiz CMS
        </SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent className="bg-telnet-primary text-white font-bold">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title} className="py-2">
                  <SidebarMenuButton asChild className="hover:text-telnet-dark-brown">
                    <Link to={item.url}>
                      <item.icon className="size-5!"/>
                      <span className="text-md">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent> 
      <SidebarFooter className="bg-telnet-primary">
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <div className="flex flex-row gap-x-5 mb-4 cursor-pointer">
              <LogOut className="size-5!"/>
              <span className="text-lg">Logout</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>   
  )
}