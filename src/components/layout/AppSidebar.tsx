import { Building2, FileText, Scale, Calculator, TrendingUp, ChevronDown, Settings, FileQuestion, LogOut, Info, ChevronsUpDown } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Entreprise', url: '/entreprise', icon: Building2, permission: 'entreprise' as const },
  { title: 'Mes contrats et factures', url: '/contrats', icon: FileText, permission: 'contrats' as const },
  { title: 'Juridique', url: '/juridique', icon: Scale, permission: 'juridique' as const },
  { title: 'Comptabilité', url: '/comptabilite', icon: Calculator, permission: 'comptabilite' as const },
  { title: 'Finance', url: '/finance', icon: TrendingUp, permission: 'finance' as const },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { companies, currentCompany, setCurrentCompany, hasPermission } = useCompany();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const visibleMenuItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* Company Selector Header */}
      <SidebarHeader className="border-b px-2 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 w-full rounded-md p-2 hover:bg-sidebar-accent transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            )}>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                {currentCompany?.company.name.charAt(0).toUpperCase() || '?'}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">
                      {currentCompany?.company.name || 'Sélectionner'}
                    </p>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {companies.map((uc) => (
              <DropdownMenuItem
                key={uc.company_id}
                onClick={() => setCurrentCompany(uc)}
                className={cn(
                  "flex items-center gap-2",
                  currentCompany?.company_id === uc.company_id && "bg-accent"
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-semibold">
                  {uc.company.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{uc.company.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Account Footer */}
      <SidebarFooter className="border-t px-2 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 w-full rounded-md p-2 hover:bg-sidebar-accent transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            )}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium shrink-0">
                {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || '?'}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile?.name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <NavLink to="/parametres" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres du compte
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/mentions-legales" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Mentions légales
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/confidentialite" className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4" />
                Politique de confidentialité
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/cgu" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CGU
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/aide" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Aide
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
              Version 1.0.0
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={signOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
