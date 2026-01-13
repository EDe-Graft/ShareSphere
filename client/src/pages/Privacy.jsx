const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-card border rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-base">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-6 text-base leading-relaxed">
            <div>
              <h3 className="text-xl font-semibold mb-3">1. Introduction</h3>
              <p className="mb-3">
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                2. Information We Collect
              </h3>
              <p className="mb-3">
                2.1. <strong>Personal Information</strong>: We may collect
                personally identifiable information, such as your name, email
                address, telephone number, and university affiliation when you
                register for an account or use certain features of the Service.
              </p>
              <p className="mb-3">
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                3. How We Use Your Information
              </h3>
              <p className="mb-3">
                We may use the information we collect from you for various
                purposes, including to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                4. Disclosure of Your Information
              </h3>
              <p className="mb-3">
                We may disclose personal information that we collect or you
                provide:
              </p>
              <ul className="list-disc pl-6 space-y-2">
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">5. Data Security</h3>
              <p>
                We have implemented measures designed to secure your personal
                information from accidental loss and from unauthorized access,
                use, alteration, and disclosure. However, the transmission of
                information via the internet is not completely secure. We cannot
                guarantee the security of your personal information transmitted
                to our Service.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">6. Your Choices</h3>
              <p className="mb-3">
                6.1. <strong>Account Information</strong>: You may update,
                correct, or delete your account information at any time by
                logging into your account settings. If you wish to delete your
                account, please contact us.
              </p>
              <p className="mb-3">
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                7. Changes to Our Privacy Policy
              </h3>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last Updated" date at the top of
                this Privacy Policy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">8. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at{" "}
                <a
                  href="mailto:sharesphereapp@gmail.com"
                  className="text-violet-600 hover:underline"
                >
                  sharesphereapp@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
