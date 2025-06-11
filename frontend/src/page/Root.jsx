import React from "react";
import { Outlet } from "react-router-dom";
import MainNavigator from "../components/MainNavigator";
import Footer from "../components/Footer";

const RootLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <MainNavigator />
      <main className="flex-grow-1" >
        <Outlet />
        {/*CONTENT*/}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
