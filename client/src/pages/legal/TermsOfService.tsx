import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/register">
          <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Register
          </Button>
        </Link>

        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 27, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Lumina ("the Platform"), you agree to be bound by these Terms of Service. 
              If you disagree with any part of the terms, you may not access the Platform. These terms apply 
              to all photographers, clients, and visitors who use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumina provides photographers with a platform to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Create and manage photo galleries for clients</li>
              <li>Upload and store high-resolution images via Cloudinary</li>
              <li>Generate and send invoices for photography services</li>
              <li>Share password-protected galleries with clients</li>
              <li>Manage client downloads and permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Account Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              As a photographer using Lumina, you are responsible for:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>The content of galleries you create and share</li>
              <li>Obtaining proper consent from clients before sharing their images</li>
              <li>Ensuring you have the rights to all images you upload</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Client Access and Downloads</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you share galleries with clients:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Clients are granted access only to galleries you explicitly share</li>
              <li>Download PINs protect client access to photos</li>
              <li>You may set download limits or expiration dates for galleries</li>
              <li>You are responsible for managing client access permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain all rights to the images you upload to Lumina. By uploading content, you grant us 
              a limited license to store, display, and process your images solely for the purpose of providing 
              our services. We do not claim ownership of your photographs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Data Storage and Cloudinary</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumina uses Cloudinary for image storage and delivery. Images you upload are subject to 
              Cloudinary's terms of service. We recommend reviewing Cloudinary's policies regarding content 
              storage and delivery. We are not responsible for Cloudinary's service interruptions or data 
              loss events.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Invoicing and Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumina provides tools to generate invoices, but all payment transactions occur outside the 
              platform. We do not process payments, and you are solely responsible for collecting payments 
              from clients. Invoices generated through Lumina are templates only and do not constitute 
              legally binding documents unless executed separately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may not use Lumina for:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Uploading illegal, infringing, or unauthorized content</li>
              <li>Distributing malware or harmful code</li>
              <li>Attempting to circumvent access controls or security measures</li>
              <li>Using the platform to harass or harm others</li>
              <li>Exceeding reasonable usage limits or API rate limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms, exceed 
              reasonable usage limits, or engage in prohibited activities. You may delete your account 
              at any time, which will remove your galleries and associated data from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumina is provided "as is" without warranties of any kind. We are not liable for data loss, 
              service interruptions, or damages arising from use of the platform. Our total liability shall 
              not exceed the amount you paid us, if any, in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. Continued use of Lumina after changes constitutes 
              acceptance of the modified terms. We will notify users of significant changes via email or 
              platform notifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, please contact us at:
              <br />
              Email: support@lumina.ng
              <br />
              Address: Lagos, Nigeria
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-sm text-muted-foreground">
              By using Lumina, you acknowledge that you have read and understood these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}