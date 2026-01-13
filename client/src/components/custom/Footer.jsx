import { Button } from "@/components/ui/button";
import {
  Grid3X3,
  Book,
  Shirt,
  Sofa,
  Package,
  Github,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="border-t-[0.1rem] bg-background pt-10 pb-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* About Column */}
          <div className="space-y-4">
            <div className="logo">
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
                  alt="ShareSphereLogo"
                  className="w-[3.5rem] h-[3.5rem] rounded-full"
                />
                <h3 className="font-bold text-xl text-primary">ShareSphere</h3>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              A community platform where students can share resources and reduce
              waste while building a more sustainable campus environment.
            </p>
            <div className="flex space-x-3 pt-2">
              <Link
                to="https://github.com/EDe-Graft/ShareSphere"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-violet-50 hover:text-violet-500 hover:border-violet-200 transition-colors duration-200 bg-transparent"
                >
                  <Github className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="mailto:sharesphereapp@gmail.com">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-violet-50 hover:text-violet-500 hover:border-violet-200 transition-colors duration-200 bg-transparent"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Categories Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2 border-muted">
              Categories
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/all-categories"
                  className="flex items-center gap-2 hover:text-violet-500 transition-colors duration-200 group"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/all-categories");
                  }}
                >
                  <div className="bg-muted p-1.5 rounded-md group-hover:bg-violet-100 transition-colors duration-200">
                    <Grid3X3 className="h-4 w-4 group-hover:text-violet-500 transition-colors duration-200" />
                  </div>
                  <span>All Categories</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/books"
                  className="flex items-center gap-2 hover:text-violet-500 transition-colors duration-200 group"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/books");
                  }}
                >
                  <div className="bg-muted p-1.5 rounded-md group-hover:bg-violet-100 transition-colors duration-200">
                    <Book className="h-4 w-4 group-hover:text-violet-500 transition-colors duration-200" />
                  </div>
                  <span>Books</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/furniture"
                  className="flex items-center gap-2 hover:text-violet-500 transition-colors duration-200 group"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/furniture");
                  }}
                >
                  <div className="bg-muted p-1.5 rounded-md group-hover:bg-violet-100 transition-colors duration-200">
                    <Sofa className="h-4 w-4 group-hover:text-violet-500 transition-colors duration-200" />
                  </div>
                  <span>Furniture</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/clothing"
                  className="flex items-center gap-2 hover:text-violet-500 transition-colors duration-200 group"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/clothing");
                  }}
                >
                  <div className="bg-muted p-1.5 rounded-md group-hover:bg-violet-100 transition-colors duration-200">
                    <Shirt className="h-4 w-4 group-hover:text-violet-500 transition-colors duration-200" />
                  </div>
                  <span>Clothing</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/miscellaneous"
                  className="flex items-center gap-2 hover:text-violet-500 transition-colors duration-200 group"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/miscellaneous");
                  }}
                >
                  <div className="bg-muted p-1.5 rounded-md group-hover:bg-violet-100 transition-colors duration-200">
                    <Package className="h-4 w-4 group-hover:text-violet-500 transition-colors duration-200" />
                  </div>
                  <span>Miscellaneous</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2 border-muted">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-violet-500 transition-colors duration-200 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/");
                  }}
                >
                  <span className="transition-transform duration-200 inline-block">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-violet-500 transition-colors duration-200 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/about");
                  }}
                >
                  <span className="transition-transform duration-200 inline-block">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-violet-500 transition-colors duration-200 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/contact");
                  }}
                >
                  <span className="transition-transform duration-200 inline-block">
                    Contact
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="hover:text-violet-500 transition-colors duration-200 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/terms-and-conditions");
                  }}
                >
                  <span className="transition-transform duration-200 inline-block">
                    Terms & Conditions
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-violet-500 transition-colors duration-200 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/privacy");
                  }}
                >
                  <span className="transition-transform duration-200 inline-block">
                    Privacy Policy
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Call to Action Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2 border-muted">
              Join Our Community
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Start sharing resources and help build a more sustainable campus
              today. Join thousands of students making a difference.
            </p>
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/");
              }}
            >
              Start Sharing Today
            </Button>
            <div className="flex items-center justify-center gap-2 mt-3 sm:flex-wrap sm:items-start sm:justify-start">
              <Badge
                variant="secondary"
                className="text-xs bg-violet-100 text-violet-700 hover:bg-violet-200"
              >
                Student-Led
              </Badge>
              <Badge
                variant="secondary"
                className="text-xs bg-green-100 text-green-700 hover:bg-green-200"
              >
                Sustainable
              </Badge>
              <Badge
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                Community
              </Badge>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-6 border-t border-muted text-center text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6">
            <p>ShareSphere &copy; {currentYear}. All Rights Reserved.</p>
            <div className="flex gap-4">
              <Link
                to="/terms-and-conditions"
                className="hover:text-violet-500 transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/terms-and-conditions");
                }}
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="hover:text-violet-500 transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/privacy-policy");
                }}
              >
                Privacy
              </Link>
              <Link
                to="/contact"
                className="hover:text-violet-500 transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/contact");
                }}
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
