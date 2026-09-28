import { BookOpen, FileText, Home, LayoutDashboard, LucideIcon, Phone, Settings, User, UserMinus, Users } from 'lucide-react';

export interface NavItem {
    label: string;
    icon: LucideIcon;
    permission: string;
    routeName: string;
    /** Route pattern used to highlight the active item. */
    active: string;
    /** false = module not built yet, shown as "Soon". Flip to true per phase. */
    ready: boolean;
    /** true = still available during the 7-day temporary access (UX only; the server enforces it). */
    temporary?: boolean;
}

export const adminNav: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, permission: 'admin.access', routeName: 'admin.dashboard', active: 'admin.dashboard', ready: true },
    { label: 'User Management', icon: Users, permission: 'users.view', routeName: 'admin.users.index', active: 'admin.users.*', ready: true },
    { label: 'Removal Requests', icon: UserMinus, permission: 'users.deactivate', routeName: 'admin.removal-requests.index', active: 'admin.removal-requests.*', ready: true },
    { label: 'Learning Materials', icon: BookOpen, permission: 'learning-materials.view', routeName: 'admin.learning-materials.index', active: 'admin.learning-materials.*', ready: false },
    { label: 'Price Lists', icon: FileText, permission: 'price-lists.view', routeName: 'admin.price-lists.index', active: 'admin.price-lists.*', ready: false },
    { label: 'Contact Us', icon: Phone, permission: 'contact-us.manage', routeName: 'admin.contact-us.edit', active: 'admin.contact-us.*', ready: false },
    { label: 'Settings', icon: Settings, permission: 'settings.manage', routeName: 'admin.settings.index', active: 'admin.settings.*', ready: false },
];

export const diserNav: NavItem[] = [
    { label: 'Home', icon: Home, permission: 'portal.access', routeName: 'portal.home', active: 'portal.home', ready: true, temporary: true },
    { label: 'Learning', icon: BookOpen, permission: 'portal.learning', routeName: 'portal.learning.index', active: 'portal.learning.*', ready: false, temporary: true },
    { label: 'Price Lists', icon: FileText, permission: 'portal.price-lists', routeName: 'portal.price-lists.index', active: 'portal.price-lists.*', ready: false },
    { label: 'Contact', icon: Phone, permission: 'portal.contact-us', routeName: 'portal.contact.index', active: 'portal.contact.*', ready: false },
    { label: 'Profile', icon: User, permission: 'portal.access', routeName: 'portal.profile.edit', active: 'portal.profile.*', ready: false },
];