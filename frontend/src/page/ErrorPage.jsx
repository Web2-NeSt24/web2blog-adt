import React from "react";
import { Container, Button } from "react-bootstrap";
import MainNavigator from "../components/MainNavigator";
import Footer from "../components/Footer";

function ErrorPage() {
  return (
    <>
      <MainNavigator />
      <div className="d-flex vh-100 justify-content-center align-items-center bg-light text-center">
        <Container>
          <h1 className="display-1 text-danger">404</h1>
          <h2 className="mb-3">Oopsie Daisy!</h2>
          <p className="text-muted mb-4">
            Looks like you’ve wandered off the map. <br />
            This page is as lost as your left sock after laundry.<br />
            But hey, at least you found this cool error message!
          </p>
          <Button variant="primary" href="/">
            Take me home, country roads!
          </Button>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default ErrorPage;
