import { BookOpen, Briefcase, FileText, Home, LayoutDashboard, LucideIcon, Phone, Settings, ShieldCheck, User, UserMinus, Users, Wrench } from 'lucide-react';

export type NavGroup = 'Overview' | 'People' | 'Content' | 'System';

export interface NavItem {
    label: string;
    icon: LucideIcon;
    permission: string;
    routeName: string;
    active: string;
    ready: boolean;
    temporary?: boolean;
    /** Sidebar section the item is listed under (admin only). */
    group?: NavGroup;
    /** When set, the item only shows if `page.props.features[key]` is true. */
    featureFlag?: 'careers_enabled';
}

export const adminNav: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, permission: 'admin.access', routeName: 'admin.dashboard', active: 'admin.dashboard', ready: true, group: 'Overview' },
    { label: 'User Management', icon: Users, permission: 'users.view', routeName: 'admin.users.index', active: 'admin.users.*', ready: true, group: 'People' },
    { label: 'Removal Requests', icon: UserMinus, permission: 'users.deactivate', routeName: 'admin.removal-requests.index', active: 'admin.removal-requests.*', ready: true, group: 'People' },
    { label: 'Learning Materials', icon: BookOpen, permission: 'learning-materials.view', routeName: 'admin.learning-materials.index', active: 'admin.learning-material*', ready: true, group: 'Content' },
    { label: 'Price Lists', icon: FileText, permission: 'price-lists.view', routeName: 'admin.price-lists.index', active: 'admin.price-lists.*', ready: true, group: 'Content' },
    { label: 'Contact Us', icon: Phone, permission: 'contact-us.manage', routeName: 'admin.contact-us.edit', active: 'admin.contact-us.*', ready: true, group: 'Content' },
    { label: 'Settings', icon: Settings, permission: 'settings.manage', routeName: 'admin.settings.index', active: 'admin.settings.*', ready: true, group: 'System' },
    { label: 'Roles & Permissions', icon: ShieldCheck, permission: 'roles.manage', routeName: 'admin.roles-permissions.index', active: 'admin.roles-permissions.*', ready: true, group: 'System' },
    { label: 'Maintenance', icon: Wrench, permission: 'settings.manage', routeName: 'admin.maintenance.index', active: 'admin.maintenance.*', ready: true, group: 'System' },
];

export const diserNav: NavItem[] = [
    { label: 'Home', icon: Home, permission: 'portal.access', routeName: 'portal.home', active: 'portal.home', ready: true, temporary: true },
    { label: 'Learning', icon: BookOpen, permission: 'portal.learning', routeName: 'portal.learning.index', active: 'portal.learning.*', ready: true, temporary: true },
    { label: 'Price Lists', icon: FileText, permission: 'portal.price-lists', routeName: 'portal.price-lists.index', active: 'portal.price-lists.index', ready: true },
    { label: 'Contact', icon: Phone, permission: 'portal.contact-us', routeName: 'portal.contact.index', active: 'portal.contact.index', ready: true },
    { label: 'Careers', icon: Briefcase, permission: 'portal.access', routeName: 'portal.careers.index', active: 'portal.careers.*', ready: true, featureFlag: 'careers_enabled' },
    { label: 'Profile', icon: User, permission: 'portal.access', routeName: 'profile.edit', active: 'profile.*', ready: true },
];
