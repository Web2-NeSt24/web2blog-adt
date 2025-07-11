import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <main 
      className="container-fluid py-5"
      style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}
    >
      {/* Header Section */}
      <header className="text-center mb-5 mx-auto" style={{ maxWidth: '800px' }}>
        <h1 className="display-4 fw-bold mb-3" style={{ color: '#2c3e50' }}>Privacy Policy</h1>
        <p className="lead text-muted">
          This is a group project for the Web Engineering course at DHBW Mosbach. This privacy policy is completely made up and has no effect.
        </p>
        <p className="text-muted">
          <small>Last updated: {new Date().toLocaleDateString()}</small>
        </p>
      </header>

      {/* Privacy Policy Content */}
      <section className="mx-auto" style={{ maxWidth: '800px' }}>
        <article 
          className="card border-0 shadow-sm p-5"
          style={{ borderRadius: '15px' }}
        >
          <section className="mb-5">
            <h2 className="h4 mb-3" style={{ color: '#2c3e50' }}>1. Information We Collect</h2>
            <p className="text-muted mb-3">
              We collect information you provide directly to us, such as when you create an account, 
              post content, or contact us. This may include:
            </p>
            <ul className="text-muted">
              <li>Username and email address</li>
              <li>Profile information and biography</li>
              <li>Posts, comments, and other content you create</li>
              <li>Messages you send to us</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3" style={{ color: '#2c3e50' }}>2. How We Use Your Information</h2>
            <p className="text-muted mb-3">
              We use the information we collect to:
            </p>
            <ul className="text-muted">
              <li>Provide, maintain, and improve our blogging platform</li>
              <li>Enable you to create and share content</li>
              <li>Communicate with you about our services</li>
              <li>Respond to your comments and questions</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3" style={{ color: '#2c3e50' }}>3. Information Sharing</h2>
            <p className="text-muted mb-3">
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information only in the following circumstances:
            </p>
            <ul className="text-muted">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and the safety of our users</li>
              <li>In connection with a business transfer (merger, acquisition, etc.)</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3" style={{ color: '#2c3e50' }}>4. Data Security</h2>
            <p className="text-muted">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3" style={{ color: '#2c3e50' }}>5. Cookies and Tracking</h2>
            <p className="text-muted">
              We use cookies and similar technologies to enhance your experience on our platform. 
              These help us remember your preferences, authenticate your account, and analyze how 
              our platform is used. You can control cookie settings through your browser.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3" style={{ color: '#2c3e50' }}>6. Your Rights</h2>
            <p className="text-muted mb-3">
              You have certain rights regarding your personal information:
            </p>
            <ul className="text-muted">
              <li>Access and review your personal information</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Object to certain processing of your information</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3" style={{ color: '#2c3e50' }}>7. Children's Privacy</h2>
            <p className="text-muted">
              Our platform is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If we learn that we have collected 
              such information, we will delete it immediately.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3" style={{ color: '#2c3e50' }}>8. Changes to This Policy</h2>
            <p className="text-muted">
              We may update this privacy policy from time to time. We will notify you of any 
              material changes by posting the updated policy on this page and updating the 
              "Last updated" date above.
            </p>
          </section>

          <section>
            <h2 className="h4 mb-3" style={{ color: '#2c3e50' }}>9. Contact Us</h2>
            <p className="text-muted mb-3">
              If you have any questions about this privacy policy or our data practices, 
              please contact us:
            </p>
            <p className="text-muted">
              <strong>Email:</strong> <a href="mailto:team@web2blog.com" className="text-decoration-none">team@web2blog.com</a>
            </p>
          </section>
        </article>
      </section>

      {/* Back to Home Section */}
      <section className="text-center mt-5">
        <nav>
          <a href="/" className="btn btn-outline-primary">
            Back to Home
          </a>
        </nav>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
