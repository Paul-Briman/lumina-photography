import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/register">
          <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Register
          </Button>
        </Link>

        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 27, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumina ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
              use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mt-4 mb-2">2.1 Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you register for Lumina, we collect:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Email address</li>
              <li>Business name</li>
              <li>Password (stored securely using bcrypt encryption)</li>
              <li>Account creation date</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.2 Client Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you create galleries for clients, we collect:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Client name</li>
              <li>Gallery titles and descriptions</li>
              <li>Download PINs (stored securely)</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.3 Photographs</h3>
            <p className="text-muted-foreground leading-relaxed">
              Images you upload are stored with Cloudinary, a third-party service. We collect metadata including:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>File names and sizes</li>
              <li>Upload dates</li>
              <li>Gallery associations</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.4 Invoice Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you create invoices, we collect:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Client names and contact information</li>
              <li>Invoice numbers and amounts</li>
              <li>Payment status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Provide and maintain our services</li>
              <li>Authenticate your access to the platform</li>
              <li>Store and deliver photographs to your clients</li>
              <li>Generate invoices for your photography services</li>
              <li>Communicate with you about your account</li>
              <li>Improve and optimize our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Data Storage and Security</h2>
            
            <h3 className="text-xl font-medium mt-4 mb-2">4.1 Database</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your personal information is stored in a secure PostgreSQL database hosted by Supabase. 
              We use industry-standard encryption and security measures to protect your data.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">4.2 Image Storage</h3>
            <p className="text-muted-foreground leading-relaxed">
              Photographs are stored and delivered through Cloudinary. Images are encrypted in transit and at rest. 
              Cloudinary's security practices apply to stored images.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">4.3 Password Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              Passwords are hashed using bcrypt before storage. We never store plain-text passwords and cannot 
              recover passwords—only reset them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumina integrates with the following third-party services:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li><strong>Cloudinary:</strong> Stores and delivers photographs</li>
              <li><strong>Supabase:</strong> Provides database infrastructure</li>
              <li><strong>Render.com:</strong> Hosts the application</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Each service has its own privacy policy and data handling practices. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active. If you delete your account:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Personal information is permanently removed from our database</li>
              <li>Galleries and associated metadata are deleted</li>
              <li>Invoices are permanently removed</li>
              <li>Images stored in Cloudinary are deleted (may take up to 30 days for complete removal)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Client Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for obtaining consent from your clients before uploading their images or sharing 
              their information. We process client data on your behalf and do not use it for any purpose other than 
              providing our services to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              To exercise these rights, contact us at privacy@lumina.ng.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumina uses essential cookies to maintain your session and authentication. We do not use tracking 
              cookies or analytics that collect personal information without consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumina is not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you believe a child has provided us with data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries where our third-party service 
              providers operate. By using Lumina, you consent to such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes through 
              the platform or via email. Continued use of Lumina after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related inquiries:
              <br />
              Email: privacy@lumina.ng
              <br />
              Address: Lagos, Nigeria
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-sm text-muted-foreground">
              By registering for Lumina, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}