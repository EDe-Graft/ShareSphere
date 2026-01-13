const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-card border rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Terms and Conditions
            </h1>
            <p className="text-muted-foreground text-base">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-6 text-base leading-relaxed">
            <div>
              <h3 className="text-xl font-semibold mb-3">1. Introduction</h3>
              <p>
                Welcome to ShareSphere ("we," "our," or "us"). These Terms and
                Conditions govern your use of the ShareSphere website and
                platform (collectively, the "Service"). By accessing or using
                our Service, you agree to be bound by these Terms. If you
                disagree with any part of the terms, you do not have permission
                to access the Service.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">2. Definitions</h3>
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3. User Accounts</h3>
              <p className="mb-3">
                3.1. To access certain features of the Service, you must
                register for an account. When you register, you agree to provide
                accurate, current, and complete information about yourself.
              </p>
              <p className="mb-3">
                3.2. You are responsible for safeguarding your password and for
                all activities that occur under your account. You agree to
                notify us immediately of any unauthorized use of your account.
              </p>
              <p>
                3.3. We reserve the right to disable any user account if, in our
                opinion, you have violated any provision of these Terms.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">4. User Conduct</h3>
              <p className="mb-3">4.1. You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-3">
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                5. Donations and Exchanges
              </h3>
              <p className="mb-3">
                5.1. ShareSphere is a platform that facilitates the donation and
                exchange of items between Users. We do not take ownership of any
                items listed on the Service.
              </p>
              <p className="mb-3">
                5.2. Donors are responsible for ensuring that all items they
                offer are in the condition described and are legal to donate.
              </p>
              <p className="mb-3">
                5.3. Recipients are responsible for inspecting items before
                accepting them and determining whether they are suitable for
                their needs.
              </p>
              <p>
                5.4. We are not responsible for the quality, safety, legality,
                or availability of items offered through the Service, nor for
                any disputes that may arise between Users.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                6. Intellectual Property
              </h3>
              <p className="mb-3">
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                7. Limitation of Liability
              </h3>
              <p className="mb-3">
                7.1. In no event shall ShareSphere, its officers, directors,
                employees, or agents be liable for any indirect, incidental,
                special, consequential, or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other
                intangible losses, resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">8. Disclaimer</h3>
              <p className="mb-3">
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
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">9. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of New Jersey, United States, without regard to
                its conflict of law provisions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                10. Changes to Terms
              </h3>
              <p>
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will provide at least 30
                days' notice prior to any new terms taking effect. What
                constitutes a material change will be determined at our sole
                discretion.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">11. Contact Us</h3>
              <p>
                If you have any questions about these Terms, please contact us
                at{" "}
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

export default TermsAndConditions;
