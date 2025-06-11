
import Hero from "./page/Hero";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./page/Root";
import ErrorPage from "./page/ErrorPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [{ path: "/", element: <Hero /> }],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
