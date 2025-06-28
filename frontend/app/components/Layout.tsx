import { Container } from 'react-bootstrap';
import MainNavigator from './MainNavigator';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  fluid?: boolean;
}

export default function Layout({ children, fluid = false }: LayoutProps) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <MainNavigator />
      <main className="flex-grow-1 py-4">
        <Container fluid={fluid}>
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
}