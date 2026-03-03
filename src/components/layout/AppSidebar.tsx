import { Building2, FileText, Scale, Calculator, TrendingUp, ChevronDown, Settings, FileQuestion, LogOut, Info, ChevronsUpDown, Shield, Users, UserCheck, Lock, Kanban, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
import { useTranslation } from '@/i18n/useTranslation';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAdmin, signOut } = useAuth();
  const { companies, currentCompany, setCurrentCompany, hasPermission, companyPath } = useCompany();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const { t } = useTranslation();

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleCompanySwitch = (uc: typeof companies[number]) => {
    setCurrentCompany(uc);
    // If on a company-scoped page, navigate to same sub-page under new slug
    const currentSlug = currentCompany?.company?.slug;
    if (currentSlug && location.pathname.startsWith(`/${currentSlug}`)) {
      const subPath = location.pathname.slice(`/${currentSlug}`.length) || '';
      navigate(`/${uc.company.slug}${subPath}`);
    } else {
      navigate(`/${uc.company.slug}`);
    }
    closeMobileSidebar();
  };

  const menuItems = [
    { title: t('sidebar.company'), path: '/company', icon: Building2, permission: 'entreprise' as const },
    { title: t('sidebar.contracts'), path: '/contracts', icon: FileText, permission: 'contrats' as const },
    { title: t('sidebar.legal'), path: '/legal', icon: Scale, permission: 'legal' as const },
    { title: t('sidebar.accounting'), path: '/accounting', icon: Calculator, permission: 'accounting' as const },
    { title: t('sidebar.finance'), path: '/finance', icon: TrendingUp, permission: 'finance' as const },
  ];

  

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
              {collapsed ? (
                <Building2 className="h-5 w-5 shrink-0" />
              ) : (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {currentCompany?.company.name || t('common.select')}
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
                onClick={() => handleCompanySwitch(uc)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="truncate flex-1">{uc.company.name}</span>
                {uc.company.status !== 'active' && (
                  <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 shrink-0">
                    Inactive
                  </Badge>
                )}
                {currentCompany?.company_id === uc.company_id && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const fullPath = companyPath(item.path);
            const locked = !hasPermission(item.permission);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === fullPath}
                  tooltip={locked ? `${item.title} (${t('common.locked')})` : item.title}
                  className={cn(locked && "opacity-50")}
                >
                  <NavLink to={fullPath} onClick={closeMobileSidebar}>
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.title}</span>
                    {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Admin Navigation */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.admin')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/admin/companies'}
                    tooltip={t('sidebar.adminCompanies')}
                  >
                    <NavLink to="/admin/companies" onClick={closeMobileSidebar}>
                      <Building2 className="h-4 w-4" />
                      <span>{t('sidebar.adminCompanies')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/admin/users'}
                    tooltip={t('sidebar.adminUsers')}
                  >
                    <NavLink to="/admin/users" onClick={closeMobileSidebar}>
                      <Users className="h-4 w-4" />
                      <span>{t('sidebar.adminUsers')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/admin/officers'}
                    tooltip={t('sidebar.adminOfficers')}
                  >
                    <NavLink to="/admin/officers" onClick={closeMobileSidebar}>
                      <UserCheck className="h-4 w-4" />
                      <span>{t('sidebar.adminOfficers')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/admin/documents'}
                    tooltip={t('sidebar.adminDocuments')}
                  >
                    <NavLink to="/admin/documents" onClick={closeMobileSidebar}>
                      <FileText className="h-4 w-4" />
                      <span>{t('sidebar.adminDocuments')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/admin/requests'}
                    tooltip={t('sidebar.adminRequests')}
                  >
                    <NavLink to="/admin/requests" onClick={closeMobileSidebar}>
                      <Kanban className="h-4 w-4" />
                      <span>{t('sidebar.adminRequests')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/admin/legal-pages'}
                    tooltip={t('sidebar.adminLegalPages')}
                  >
                    <NavLink to="/admin/legal-pages" onClick={closeMobileSidebar}>
                      <Scale className="h-4 w-4" />
                      <span>{t('sidebar.adminLegalPages')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/admin/help'}
                    tooltip={t('sidebar.adminHelp')}
                  >
                    <NavLink to="/admin/help" onClick={closeMobileSidebar}>
                      <Info className="h-4 w-4" />
                      <span>{t('sidebar.adminHelp')}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
                      {profile?.name || t('common.user')}
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
            <DropdownMenuItem asChild className="cursor-pointer">
              <NavLink to="/settings" className="flex items-center gap-2" onClick={closeMobileSidebar}>
                <Settings className="h-4 w-4" />
                {t('sidebar.settings')}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <NavLink to="/legal-notice" className="flex items-center gap-2" onClick={closeMobileSidebar}>
                <Scale className="h-4 w-4" />
                {t('sidebar.legalNotice')}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <NavLink to="/privacy" className="flex items-center gap-2" onClick={closeMobileSidebar}>
                <FileQuestion className="h-4 w-4" />
                {t('sidebar.privacyPolicy')}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <NavLink to="/terms" className="flex items-center gap-2" onClick={closeMobileSidebar}>
                <FileText className="h-4 w-4" />
                {t('sidebar.terms')}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <NavLink to="/help" className="flex items-center gap-2" onClick={closeMobileSidebar}>
                <Info className="h-4 w-4" />
                {t('sidebar.help')}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
              {t('common.version')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={signOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
