import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Menu,
  Moon,
  Sun,
  Home,
  Info,
  Mail,
  BookOpen,
  Shirt,
  Sofa,
  Package,
  Grid3X3,
  User2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/context/theme-provider";
import { useAuth } from "@/components/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mainNavItems = [
  { name: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
  { name: "About", path: "/about", icon: <Info className="h-4 w-4 mr-2" /> },
  {
    name: "Contact",
    path: "/contact",
    icon: <Mail className="h-4 w-4 mr-2" />,
  },
];

const resourceCategories = [
  {
    name: "All Categories",
    path: "/all-categories",
    icon: <Grid3X3 className="h-4 w-4" />,
  },
  { name: "Books", path: "/books", icon: <BookOpen className="h-4 w-4" /> },
  {
    name: "Furniture",
    path: "/furniture",
    icon: <Sofa className="h-4 w-4" />,
  },
  {
    name: "Clothing",
    path: "/clothing",
    icon: <Shirt className="h-4 w-4" />,
  },
  {
    name: "Miscellaneous",
    path: "/miscellaneous",
    icon: <Package className="h-4 w-4" />,
  },
];

const Navbar = () => {
  const { authSuccess, user, logout } = useAuth();

  const { setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const previousPath = useRef(location.pathname);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      setIsMenuOpen(false);
      previousPath.current = location.pathname;
      // Scroll to top when location changes
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Function to handle link clicks
  const handleNavigation = (path) => {
    // Close the menu
    setIsMenuOpen(false);

    // Navigate to the path
    navigate(path);

    // Scroll to top
    window.scrollTo(0, 0);
  };
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between mx-auto p-2">
        {/* Mobile Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Access main navigation and resource categories
              </SheetDescription>
              <Link
                to="/"
                className="flex items-center group"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/");
                }}
              >
                <img
                  src="/ShareSphereLogo.png"
                  alt="ShareSpehereLogo"
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <h3 className="font-bold text-primary ">ShareSphere</h3>
              </Link>
            </SheetHeader>

            <div className="grid gap-6 py-6">
              <div className="flex flex-col space-y-3">
                <h3 className="font-medium">Navigation</h3>
                {mainNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "flex items-center text-sm transition-colors hover:text-primary text-left",
                      isActive(item.path) && "text-primary font-medium"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ))}
              </div>

              <div className="flex flex-col space-y-3">
                <h3 className="font-medium">Resources</h3>
                {resourceCategories.map((category) => (
                  <button
                    key={category.path}
                    onClick={() => handleNavigation(category.path)}
                    className={cn(
                      "flex items-center text-sm transition-colors hover:text-primary text-left",
                      isActive(category.path) && "text-primary font-medium"
                    )}
                  >
                    <div className="mr-2">{category.icon}</div>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img
            src="/ShareSphereLogo.png"
            alt="ShareSpehereLogo"
            className="w-[3.5rem] h-[3.5rem] rounded-full"
          />
          <h3 className="font-bold text-xl text-primary ">ShareSphere</h3>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/");
                    }}
                    className={cn(
                      "px-3 py-2 text-[0.95rem] font-medium transition-colors hover:text-primary relative",
                      isActive("/")
                        ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary text-primary"
                        : "text-foreground"
                    )}
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/about"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/about");
                    }}
                    className={cn(
                      "px-3 py-2 text-[0.95rem] font-medium transition-colors hover:text-primary relative",
                      isActive("/about")
                        ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary text-primary"
                        : "text-foreground"
                    )}
                  >
                    About Us
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/contact");
                    }}
                    className={cn(
                      "px-3 py-2 text-[0.95rem] font-medium transition-colors hover:text-primary relative",
                      isActive("/contact")
                        ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary text-primary"
                        : "text-foreground"
                    )}
                  >
                    Contact
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-[0.95rem]">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {resourceCategories.map((category) => (
                      <li key={category.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={authSuccess ? category.path : "/sign-in"}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavigation(category.path);
                            }}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              {category.icon}
                              {category.name}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Browse and share {category.name.toLowerCase()}{" "}
                              with other students
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* User Avatar and Theme Toggle  */}
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setTheme(
                document.documentElement.classList.contains("dark")
                  ? "light"
                  : "dark"
              )
            }
            aria-label="Toggle theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer bg-white dark:bg-[hsl(224,71.4%,4.1%)]">
                {user && (
                  <>
                    <AvatarImage src={user.photo ? user.photo : null} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.displayName ? (
                        user.displayName[0].toUpperCase()
                      ) : user.name ? (
                        user.name[0].toUpperCase()
                      ) : user.username ? (
                        user.username[0].toUpperCase()
                      ) : (
                        <User2 className="h-5 w-5 text-foreground" />
                      )}
                    </AvatarFallback>
                  </>
                )}
                {/* If user is not logged in, show a default avatar */}
                {!user && (
                  <>
                    <AvatarImage src="/default-avatar.png" />
                    <AvatarFallback className="bg-muted">
                      <User2 className="h-5 w-5 text-foreground" />
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!user ? (
                <DropdownMenuItem onClick={() => navigate("/sign-in")}>
                  Sign In
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate(`/profile/${user?.userId}`)}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/favorites")}>
                    Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/posts")}>
                    Posts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/reviews")}>
                    Reviews
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={async () => {
                      console.log("Logging out...");
                      const logoutSuccess = await logout();
                      if (logoutSuccess) {
                        navigate("/");
                      }
                    }}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
