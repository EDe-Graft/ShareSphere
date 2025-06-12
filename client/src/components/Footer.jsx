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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Footer = () => {
  const navigate = useNavigate();
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
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
                  alt="ShareSpehereLogo"
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
                to="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-violet-50 hover:text-violet-500 hover:border-violet-200 transition-colors duration-200"
                >
                  <Github className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="mailto:contact@sharesphere.com">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-violet-50 hover:text-violet-500 hover:border-violet-200 transition-colors duration-200"
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
              {/* New Legal Links */}
              <li>
                <button
                  className="hover:text-violet-500 transition-colors duration-200 flex items-center"
                  onClick={() => setTermsDialogOpen(true)}
                >
                  <span className=" transition-transform duration-200 inline-block">
                    Terms & Conditions
                  </span>
                </button>
              </li>
              <li>
                <button
                  className="hover:text-violet-500 transition-colors duration-200 flex items-center"
                  onClick={() => setPrivacyDialogOpen(true)}
                >
                  <span className=" transition-transform duration-200 inline-block">
                    Privacy Policy
                  </span>
                </button>
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
              <button
                onClick={() => setTermsDialogOpen(true)}
                className="hover:text-violet-500 transition-colors duration-200"
              >
                Terms
              </button>
              <button
                onClick={() => setPrivacyDialogOpen(true)}
                className="hover:text-violet-500 transition-colors duration-200"
              >
                Privacy
              </button>
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

      {/* Terms and Conditions Dialog */}
      <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Terms and Conditions
            </DialogTitle>
            <DialogDescription>
              Last updated: {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm">
              <h3 className="text-lg font-semibold">1. Introduction</h3>
              <p>
                Welcome to ShareSphere ("we," "our," or "us"). These Terms and
                Conditions govern your use of the ShareSphere website and
                platform (collectively, the "Service"). By accessing or using
                our Service, you agree to be bound by these Terms. If you
                disagree with any part of the terms, you do not have permission
                to access the Service.
              </p>

              <h3 className="text-lg font-semibold">2. Definitions</h3>
              <p>
                <strong>"User"</strong> refers to any individual who accesses or
                uses ShareSphere.
                <br />
                <strong>"Donor"</strong> refers to any User who offers items for
                donation through the Service.
                <br />
                <strong>"Recipient"</strong> refers to any User who requests or
                receives donated items through the Service.
                <br />
                <strong>"Content"</strong> refers to text, images, photos,
                audio, video, and all other forms of data or communication
                uploaded to or transmitted through the Service.
              </p>

              <h3 className="text-lg font-semibold">3. User Accounts</h3>
              <p>
                3.1. To access certain features of the Service, you must
                register for an account. When you register, you agree to provide
                accurate, current, and complete information about yourself.
              </p>
              <p>
                3.2. You are responsible for safeguarding your password and for
                all activities that occur under your account. You agree to
                notify us immediately of any unauthorized use of your account.
              </p>
              <p>
                3.3. We reserve the right to disable any user account if, in our
                opinion, you have violated any provision of these Terms.
              </p>

              <h3 className="text-lg font-semibold">4. User Conduct</h3>
              <p>4.1. You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Post or transmit any Content that is unlawful, harmful,
                  threatening, abusive, harassing, defamatory, vulgar, obscene,
                  or otherwise objectionable.
                </li>
                <li>
                  Impersonate any person or entity, or falsely state or
                  otherwise misrepresent your affiliation with a person or
                  entity.
                </li>
                <li>
                  Upload or transmit any Content that infringes any patent,
                  trademark, trade secret, copyright, or other proprietary
                  rights of any party.
                </li>
                <li>
                  Use the Service for any illegal purpose or in violation of any
                  local, state, national, or international law.
                </li>
                <li>
                  Attempt to gain unauthorized access to other computer systems
                  or networks connected to the Service.
                </li>
                <li>
                  Interfere with another user's use and enjoyment of the
                  Service.
                </li>
              </ul>
              <p>
                4.2. We reserve the right, but are not obligated, to remove any
                Content that violates these Terms or that we find objectionable
                for any reason.
              </p>

              <h3 className="text-lg font-semibold">
                5. Donations and Exchanges
              </h3>
              <p>
                5.1. ShareSphere is a platform that facilitates the donation and
                exchange of items between Users. We do not take ownership of any
                items listed on the Service.
              </p>
              <p>
                5.2. Donors are responsible for ensuring that all items they
                offer are in the condition described and are legal to donate.
              </p>
              <p>
                5.3. Recipients are responsible for inspecting items before
                accepting them and determining whether they are suitable for
                their needs.
              </p>
              <p>
                5.4. We are not responsible for the quality, safety, legality,
                or availability of items offered through the Service, nor for
                any disputes that may arise between Users.
              </p>

              <h3 className="text-lg font-semibold">
                6. Intellectual Property
              </h3>
              <p>
                6.1. The Service and its original content, features, and
                functionality are owned by ShareSphere and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property or proprietary rights laws.
              </p>
              <p>
                6.2. By submitting Content to the Service, you grant us a
                worldwide, non-exclusive, royalty-free license to use,
                reproduce, modify, adapt, publish, translate, and distribute
                your Content in any existing or future media formats.
              </p>

              <h3 className="text-lg font-semibold">
                7. Limitation of Liability
              </h3>
              <p>
                7.1. In no event shall ShareSphere, its officers, directors,
                employees, or agents be liable for any indirect, incidental,
                special, consequential, or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other
                intangible losses, resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Your access to or use of or inability to access or use the
                  Service.
                </li>
                <li>
                  Any conduct or Content of any third party on the Service.
                </li>
                <li>Any Content obtained from the Service.</li>
                <li>
                  Unauthorized access, use, or alteration of your transmissions
                  or Content.
                </li>
              </ul>

              <h3 className="text-lg font-semibold">8. Disclaimer</h3>
              <p>
                8.1. Your use of the Service is at your sole risk. The Service
                is provided on an "AS IS" and "AS AVAILABLE" basis. The Service
                is provided without warranties of any kind, whether express or
                implied.
              </p>
              <p>
                8.2. We do not warrant that the Service will be uninterrupted,
                timely, secure, or error-free, or that any defects will be
                corrected.
              </p>

              <h3 className="text-lg font-semibold">9. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of [Your Jurisdiction], without regard to its
                conflict of law provisions.
              </p>

              <h3 className="text-lg font-semibold">10. Changes to Terms</h3>
              <p>
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will provide at least 30
                days' notice prior to any new terms taking effect. What
                constitutes a material change will be determined at our sole
                discretion.
              </p>

              <h3 className="text-lg font-semibold">11. Contact Us</h3>
              <p>
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:sharesphereapp@gmail.com"
                  className="text-violet-600 hover:underline"
                >
                  sharesphereapp@gmail.com
                </a>
              </p>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setTermsDialogOpen(false)}>
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Privacy Policy
            </DialogTitle>
            <DialogDescription>
              Last updated: {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm">
              <h3 className="text-lg font-semibold">1. Introduction</h3>
              <p>
                ShareSphere ("we," "our," or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                website and platform (collectively, the "Service").
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using
                our Service, you acknowledge that you have read, understood, and
                agree to be bound by all the terms of this Privacy Policy.
              </p>

              <h3 className="text-lg font-semibold">
                2. Information We Collect
              </h3>
              <p>
                2.1. <strong>Personal Information</strong>: We may collect
                personally identifiable information, such as your name, email
                address, telephone number, and university affiliation when you
                register for an account or use certain features of the Service.
              </p>
              <p>
                2.2. <strong>Non-Personal Information</strong>: We may collect
                non-personal information about users whenever they interact with
                our Service. This may include browser name, type of computer,
                technical information about users' means of connection to our
                Service, and other similar information.
              </p>
              <p>
                2.3. <strong>User Content</strong>: We collect the content,
                communications, and other information you provide when you use
                our Service, including when you sign up for an account, create
                or share content, and message or communicate with others.
              </p>

              <h3 className="text-lg font-semibold">
                3. How We Use Your Information
              </h3>
              <p>
                We may use the information we collect from you for various
                purposes, including to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve our Service.</li>
                <li>Process transactions and send related information.</li>
                <li>
                  Send administrative information, such as updates, security
                  alerts, and support messages.
                </li>
                <li>Respond to your comments, questions, and requests.</li>
                <li>
                  Communicate with you about products, services, offers, and
                  events, and provide other news or information about us and our
                  partners.
                </li>
                <li>
                  Monitor and analyze trends, usage, and activities in
                  connection with our Service.
                </li>
                <li>
                  Detect, investigate, and prevent fraudulent transactions and
                  other illegal activities and protect the rights and property
                  of ShareSphere and others.
                </li>
                <li>
                  Personalize and improve the Service and provide content or
                  features that match user profiles or interests.
                </li>
              </ul>

              <h3 className="text-lg font-semibold">
                4. Disclosure of Your Information
              </h3>
              <p>
                We may disclose personal information that we collect or you
                provide:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  To other users of the Service as necessary to facilitate
                  donations and exchanges.
                </li>
                <li>
                  To contractors, service providers, and other third parties we
                  use to support our business.
                </li>
                <li>
                  To comply with any court order, law, or legal process,
                  including to respond to any government or regulatory request.
                </li>
                <li>
                  To enforce our rights arising from any contracts entered into
                  between you and us.
                </li>
                <li>
                  If we believe disclosure is necessary or appropriate to
                  protect the rights, property, or safety of ShareSphere, our
                  users, or others.
                </li>
              </ul>

              <h3 className="text-lg font-semibold">5. Data Security</h3>
              <p>
                We have implemented measures designed to secure your personal
                information from accidental loss and from unauthorized access,
                use, alteration, and disclosure. However, the transmission of
                information via the internet is not completely secure. We cannot
                guarantee the security of your personal information transmitted
                to our Service.
              </p>

              <h3 className="text-lg font-semibold">6. Your Choices</h3>
              <p>
                6.1. <strong>Account Information</strong>: You may update,
                correct, or delete your account information at any time by
                logging into your account settings. If you wish to delete your
                account, please contact us.
              </p>
              <p>
                6.2. <strong>Communications Preferences</strong>: You may opt
                out of receiving promotional emails from us by following the
                instructions in those emails. If you opt out, we may still send
                you non-promotional emails, such as those about your account or
                our ongoing business relations.
              </p>
              <p>
                6.3. <strong>Cookies</strong>: Most web browsers are set to
                accept cookies by default. If you prefer, you can usually choose
                to set your browser to remove or reject browser cookies.
              </p>

              <h3 className="text-lg font-semibold">
                7. Changes to Our Privacy Policy
              </h3>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last Updated" date at the top of
                this Privacy Policy.
              </p>

              <h3 className="text-lg font-semibold">8. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:sharesphereapp@gmail.com"
                  className="text-violet-600 hover:underline"
                >
                  sharesphereapp@gmail.com
                </a>
              </p>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setPrivacyDialogOpen(false)}>
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;
