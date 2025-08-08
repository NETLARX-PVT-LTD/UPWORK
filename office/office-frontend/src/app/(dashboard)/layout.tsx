'use client';

import { ReactNode, useState,useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FiMenu, FiX, FiHome, FiUsers, FiFile, FiList, FiBookmark, FiActivity, FiLogOut, FiHash, FiClock } from 'react-icons/fi';
import { parseISO, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

// Define the User type to inform TypeScript about the object structure
interface User {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean; // isGuest is optional
  createdAt?: string; // createdAt is optional, but needed for guest users
  role: 'admin' | 'user';
  department?: string;
}
// Updated sidebar links with icons
const sidebarLinks = {
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
    { name: 'Manage Users', href: '/admin/users', icon: FiUsers },
    { name: 'Reserved Numbers', href: '/admin/reserved-numbers', icon: FiHash },
    { name: 'Documents', href: '/admin/documents', icon: FiFile },
    { name: 'Audit Log', href: '/admin/audit', icon: FiActivity },
  ],
  user: [
    { name: 'Dashboard', href: '/user/dashboard', icon: FiHome },
    { name: 'Register Document', href: '/user/register', icon: FiFile },
    { name: 'My Documents', href: '/user/documents', icon: FiList },
    { name: 'Reserve Number', href: '/user/reserve', icon: FiBookmark },
  ],
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [user, setUser] = useState<User | null>(null); // State now correctly typed as User or null
  const [timeLeft, setTimeLeft] = useState(''); // State to hold countdown time
  const role = pathname.startsWith('/admin') ? 'admin' : 'user';

  // Get the current page title
  const getPageTitle = () => {
    // Find the matching link from sidebarLinks
    const currentLink = sidebarLinks[role].find(link => link.href === pathname);
    return currentLink?.name || 'Dashboard';
  };

  const handleSignOut = async () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      // Use the full backend URL from the environment variable
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout/cleanup`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error during guest data cleanup:', error);
    }
  }

  localStorage.removeItem('token');
  sessionStorage.clear();
  router.push('/auth/login');
};

  // --- NEW LOGIC FOR GUEST COUNTDOWN ---

  // Fetch user data on initial load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData.user);
          } else {
            console.error('Failed to fetch user data');
            handleSignOut(); // Sign out if token is invalid
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          handleSignOut();
        }
      } else {
        handleSignOut();
      }
    };
    fetchUser();
  }, []);

  // Countdown timer logic
   useEffect(() => {
    let timer: NodeJS.Timeout | null = null; // Explicitly type the timer variable
    if (user && user.isGuest) {
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      // Ensure user.createdAt exists before parsing
      const creationDate = user.createdAt ? parseISO(user.createdAt) : new Date();
      const expirationDate = new Date(creationDate.getTime() + thirtyDaysInMs);

      const updateCountdown = () => {
        const now = new Date();
        const timeRemaining = expirationDate.getTime() - now.getTime();

        if (timeRemaining <= 0) {
          setTimeLeft('Expired');
          if (timer) clearInterval(timer);
          handleSignOut();
        } else {
          const days = differenceInDays(expirationDate, now);
          const hours = differenceInHours(expirationDate, now) % 24;
          const minutes = differenceInMinutes(expirationDate, now) % 60;
          const seconds = differenceInSeconds(expirationDate, now) % 60;
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      };

      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    } else {
        // Clear the timer if the user is no longer a guest or logs out
        if (timer) clearInterval(timer);
    }
    return () => {
        if (timer) clearInterval(timer);
    };
  }, [user]);
  // --- END NEW LOGIC ---

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-30">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <FiMenu className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          OfficeReg
        </h1>
        <div className="w-10" />
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 md:hidden
          ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar - Updated with height fixes */}
      <aside className={`
        fixed md:sticky top-0 left-0 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out z-50 md:z-0
        flex flex-col h-[100dvh]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Close menu"
        >
          <FiX className="h-5 w-5 text-gray-600" />
        </button>

        {/* Sidebar Header */}
        <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            OfficeReg
          </h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{role} Portal</p>
        </div>

        {/* Navigation Links - Add flex-1 to push profile to bottom */}
        <div className="flex-1 flex flex-col">
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-1">
              {sidebarLinks[role].map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center px-4 py-3 text-sm rounded-lg transition-colors
                      group hover:bg-gray-50
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`
                      h-5 w-5 mr-3 transition-colors
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                    `} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4 mt-auto space-y-4">
             {/* --- NEW COUNTDOWN DISPLAY --- */}
          {user && user.isGuest && timeLeft && (
            <div className="flex items-center px-4 py-3 text-sm rounded-lg bg-blue-50 text-blue-700">
              <FiClock className="h-5 w-5 mr-3" />
              <div className="flex flex-col">
                <p className="font-medium">Guest Session Expires:</p>
                <p className="text-xs">{timeLeft}</p>
              </div>
            </div>
          )}
            <Link
              href={role === 'admin' ? '/admin/profile' : '/user/profile'}
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {role === 'admin' ? 'A' : 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {role === 'admin' ? 'Admin User' : 'Regular User'}
                </p>
                <p className="text-xs text-gray-500">View profile</p>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors
                text-red-600 hover:bg-red-50 group"
            >
              <FiLogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Added pt-16 for mobile header space */}
      <div className="flex-1 flex flex-col min-h-screen md:pt-0 pt-16">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex-1 px-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
