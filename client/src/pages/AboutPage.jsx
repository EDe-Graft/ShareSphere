import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Book,
  Shirt,
  Sofa,
  Package,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AvatarImage } from "@radix-ui/react-avatar";

const AboutPage = () => {
  return (
    <main className="min-h-[80vh] sm:w-[85vw] my-8 mx-auto px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            About Share Sphere
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A community platform where students can share resources, save money,
            reduce waste, and build connections.
          </p>
        </div>

        {/* Mission Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Our Mission</CardTitle>
            <CardDescription>
              Creating a sustainable sharing economy for students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Share Sphere was created with a simple idea: students have
              resources they don't always need, and often need resources they
              don't have. By connecting these needs, we can build a more
              sustainable and affordable campus life.
            </p>
            <p>
              Our platform enables students to share books, clothing, furniture,
              and other items they no longer need, reducing cost and waste and helping
              others save money.
            </p>
          </CardContent>
        </Card>

        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              What You Can Share
            </CardTitle>
            <CardDescription>
              Browse and share items across multiple categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Books</h3>
                  <p className="text-muted-foreground">
                    Share course materials and reading books
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Sofa className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Furniture</h3>
                  <p className="text-muted-foreground">
                    Share furniture for dorms and apartments
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shirt className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Clothing</h3>
                  <p className="text-muted-foreground">
                    Share clothes you no longer wear
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Miscellaneous</h3>
                  <p className="text-muted-foreground">
                    Share other useful items
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              Meet the Developers
            </CardTitle>
            <CardDescription>The team behind Share Sphere</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    // src={import.meta.env.VITE_DEGRAFT_PROFILE_IMAGE}
                  />
                  <AvatarFallback>ED</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">Edward De-Graft Quansah</h3>
                  <p className="text-muted-foreground">
                    Co-Founder & Developer
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Link to="https://github.com/EDe-Graft" target="_blank">
                      <Github className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Link
                      to="https://www.linkedin.com/in/de-graft/"
                      target="_blank"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Link to="mailto:edgquansah@gmail.com">
                      <Mail className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    // src={import.meta.env.VITE_NARAYAN_PROFILE_IMAGE}
                  />
                  <AvatarFallback>NK</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">Narayan Khanal</h3>
                  <p className="text-muted-foreground">
                    Co-Founder & Developer
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Link to="https://github.com/Nkhanal2002" target="_blank">
                      <Github className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Link
                      to="https://www.linkedin.com/in/narayankhanal/"
                      target="_blank"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Link
                      to="mailto:narayankhanal435@gmail.com"
                      target="_blank"
                    >
                      <Mail className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default AboutPage;
