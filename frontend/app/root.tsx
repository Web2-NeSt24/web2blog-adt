import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainNavigator from "./components/MainNavigator";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <MainNavigator />
        <main className="flex-grow-1" >
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oopsie Daisy!";
  let details = "Looks like you've wandered off the map. This page is as lost as your left sock after laundry. But hey, at least you found this cool error message!";
  let errorCode = "404";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    errorCode = error.status.toString();
    message = error.status === 404 ? "Oopsie Daisy!" : "Something went wrong!";
    details =
      error.status === 404
        ? "Looks like you've wandered off the map. This page is as lost as your left sock after laundry. But hey, at least you found this cool error message!"
        : error.statusText || "An unexpected error occurred.";
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    errorCode = "Error";
    message = "Development Error";
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light text-center">
      <div className="container">
        <h1 className="display-1 text-danger">{errorCode}</h1>
        <h2 className="mb-3">{message}</h2>
        <p className="text-muted mb-4">
          {details.split('. ').map((sentence, index) => (
            <span key={index}>
              {sentence}
              {index < details.split('. ').length - 1 && <><br /></>}
            </span>
          ))}
        </p>
        <a href="/" className="btn btn-primary">
          Take me home, country roads!
        </a>
        {stack && (
          <details className="mt-4 text-start">
            <summary className="btn btn-outline-secondary btn-sm">Show Stack Trace</summary>
            <pre className="bg-dark text-light p-3 mt-2 rounded">
              <code>{stack}</code>
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
