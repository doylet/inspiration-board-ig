export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <p className="text-sm text-gray-500 mb-4">
              <strong>Last Updated:</strong> November 30, 2025
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              When you connect your Instagram Professional account to Inspiration Board, we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Instagram account information (username, account ID)</li>
              <li>Access tokens to retrieve your media content</li>
              <li>Media data (photos, videos, captions) that you choose to interact with</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Display your Instagram media content in your personal dashboard</li>
              <li>Enable downloading of your content for personal use</li>
              <li>Receive webhook notifications for comments, mentions, and media updates</li>
              <li>Maintain and improve our service functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Storage and Security</h2>
            <p className="mb-3">
              Your data is stored securely using industry-standard encryption. We implement appropriate 
              technical and organizational measures to protect your information against unauthorized access, 
              alteration, disclosure, or destruction.
            </p>
            <p>
              Session data is stored temporarily and access tokens are encrypted in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
            <p className="mb-3">
              We do not sell, trade, or share your personal information with third parties except:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>With Instagram/Meta to authenticate and retrieve your content via their official API</li>
              <li>When required by law or to protect our legal rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access the data we store about you</li>
              <li>Request deletion of your data</li>
              <li>Revoke access to your Instagram account at any time</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, disconnect your Instagram account from the dashboard or contact us directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Instagram Data Deletion</h2>
            <p className="mb-3">
              When you disconnect your Instagram account or delete your account:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We immediately revoke all access tokens</li>
              <li>Your session data is deleted</li>
              <li>Cached media content is removed within 24 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies and Tracking</h2>
            <p>
              We use essential cookies for authentication and session management. These are necessary 
              for the service to function and cannot be disabled without losing functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Third-Party Services</h2>
            <p className="mb-3">
              This application uses:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Instagram Graph API</strong> - to access your Instagram content</li>
              <li><strong>Google Cloud Platform</strong> - for hosting and infrastructure</li>
            </ul>
            <p className="mt-3">
              These services have their own privacy policies that govern their collection and use of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our service is not directed to children under 13. We do not knowingly collect personal 
              information from children under 13. If you believe we have collected such information, 
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by updating the &quot;Last Updated&quot; date at the top of this policy. Continued use of 
              the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us 
              through your Instagram account settings or via the dashboard.
            </p>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              This privacy policy complies with Instagram Platform Terms and Meta&apos;s Data Deletion 
              requirements for apps that use the Instagram Graph API.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
