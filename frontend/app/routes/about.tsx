import React from "react";

interface Developer {
  id: number;
  name: string;
  role: string;
  expertise: string[];
  bio: string;
  image?: string;
  github?: string;
  linkedin?: string;
  email?: string;
}

const developers: Developer[] = [
  {
    id: 1,
    name: "Tamino Haag",
    role: "Full Stack Developer",
    expertise: ["React", "TypeScript", "Node.js", "Django"],
    bio: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
    github: "https://github.com/Tam-DHBW",
    linkedin: "",
    email: "tam.haag.24@lehre.mosbach.dhbw.de"
  },
  {
    id: 2,
    name: "David Lehmann",
    role: "Frontend Specialist",
    expertise: ["React", "CSS", "Bootstrap", "Figma"],
    bio: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
    github: "https://github.com/dav-lehmann-24",
    linkedin: "",
    email: "dav.lehmann.24@lehre.mosbach.dhbw.de"
  },
  {
    id: 3,
    name: "Rainer Stahl",
    role: "Backend Engineer",
    expertise: ["Python", "Django", "PostgreSQL", "API Design"],
    bio: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
    github: "https://github.com/RayOfSteel-DHBW",
    linkedin: "",
    email: "inf24020@lehre.dhbw-stuttgart.de"
  },
  {
    id: 4,
    name: "Ali Omran",
    role: "DevOps & Quality Assurance",
    expertise: ["Testing", "CI/CD", "Docker", "AWS"],
    bio: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
    github: "https://github.com/kretekarfolyam",
    linkedin: "",
    email: "ali.omran.24@lehre.mosbach.dhbw.de"
  }
];

const AboutUs: React.FC = () => {
  return (
    <main 
      className="container-fluid py-5"
      style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}
    >
      {/* Header Section */}
      <header className="text-center mb-5 mx-auto" style={{ maxWidth: '800px' }}>
        <h1 className="display-4 fw-bold mb-3" style={{ color: '#2c3e50' }}>About our Team</h1>
        <p className="lead text-muted">
          We are a passionate team of developers dedicated to creating exceptional web experiences. 
          Our diverse skills and shared commitment to quality drive us to build innovative solutions 
          that make a difference.
        </p>
      </header>

      {/* Team Grid */}
      <section 
        className="d-grid gap-4 mx-auto mb-5"
        style={{ 
          maxWidth: '1200px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
        }}
      >
        {developers.map((developer) => (
          <article 
            key={developer.id}
            className="card h-100 shadow-sm border-0 p-4" 
            style={{ 
              borderRadius: '15px',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }}
          >
            {/* Profile Avatar */}
            <figure
              className="flex-shrink-0 me-3 m-0"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '3px solid #e9ecef',
                backgroundColor: '#6c757d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {developer.name.split(' ').map(n => n[0]).join('')}
            </figure>
            
            {/* Developer Info */}
            <section className="flex-grow-1">
              <h5 className="mb-1 fw-bold">{developer.name}</h5>
              <span 
                className="badge bg-primary mb-2"
                style={{ fontSize: '0.75rem' }}
              >
                {developer.role}
              </span>
              
              {/* Expertise Tags */}
              <ul className="list-unstyled mb-3 d-flex flex-wrap gap-1">
                {developer.expertise.map((skill, index) => (
                  <li key={index}>
                    <span 
                      className="badge bg-secondary"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {skill}
                    </span>
                  </li>
                ))}
              </ul>
              
              {/* Bio */}
              <p className="text-muted small mb-3">
                {developer.bio}
              </p>
              
              {/* Contact Links */}
              <nav className="d-flex gap-2">
                {developer.github && (
                  <a 
                    href={developer.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-dark btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    GitHub
                  </a>
                )}
                {developer.linkedin && (
                  <a 
                    href={developer.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    LinkedIn
                  </a>
                )}
                {developer.email && (
                  <a 
                    href={`mailto:${developer.email}`}
                    className="btn btn-outline-success btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Email
                  </a>
                )}
              </nav>
            </section>
          </article>
        ))}
      </section>

      {/* Company Info Section */}
      <section 
        className="card text-center border-0 shadow-sm mx-auto p-5"
        style={{ 
          maxWidth: '1200px',
          borderRadius: '15px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginBottom: '2rem'
        }}
      >
        <h3 className="mb-3">Our Mission</h3>
        <p className="mb-4 lead">
          To create powerful, user-friendly web applications that bring people together 
          and enable meaningful conversations through our innovative blog platform.
        </p>
        <dl className="row text-center m-0">
          <dt className="col-md-4 mb-3">
            <span className="fw-bold fs-4">500+</span>
            <br />
            <small>Happy Users</small>
          </dt>
          <dt className="col-md-4 mb-3">
            <span className="fw-bold fs-4">1000+</span>
            <br />
            <small>Posts Created</small>
          </dt>
          <dt className="col-md-4 mb-3">
            <span className="fw-bold fs-4">24/7</span>
            <br />
            <small>Support Available</small>
          </dt>
        </dl>
      </section>

      {/* Contact Section */}
      <section 
        className="card border-0 shadow-sm text-center mx-auto p-4"
        style={{ maxWidth: '800px', borderRadius: '15px' }}
      >
        <h4 className="mb-3">Get In Touch</h4>
        <p className="text-muted mb-3">
          Have questions or feedback? We'd love to hear from you!
        </p>
        <nav className="d-flex justify-content-center gap-3">
          <a href="mailto:team@web2blog.com" className="btn btn-primary">
            Contact Us
          </a>
        </nav>
      </section>
    </main>
  );
};

export default AboutUs;
