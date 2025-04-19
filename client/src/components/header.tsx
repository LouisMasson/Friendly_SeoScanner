import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { LucideSearch, Menu, History, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <LucideSearch className="h-6 w-6 text-primary" />
            <span className="font-semibold">SEO Analyzer</span>
          </Link>
        </div>

        {isMobile ? (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <nav className="flex flex-col gap-4 mt-8">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium">{user?.name}</div>
                    </div>
                    <Link href="/metadata-generator" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        AI Metadata Generator
                      </Button>
                    </Link>
                    <Link href="/historique" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Historique
                      </Button>
                    </Link>
                    <div className="px-2">
                      <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Login</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Register</Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/metadata-generator">
                  <Button variant="outline" className="flex items-center gap-2 mr-2">
                    <FileText className="h-4 w-4" />
                    AI Metadata
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/historique">
                      <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Historique
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/metadata-generator">
                      <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Metadata Generator
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}