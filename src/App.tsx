import { RouterProvider } from "react-router";
import { router } from "./routes";
import { MenuBar } from "./components/menuBar";

function App() {
  const isAuthenticated = true;
  return (
    <div className="flex flex-col w-screen h-screen bg-slate-200">
      {isAuthenticated && <MenuBar />}

      <RouterProvider router={router} />
    </div>
  );
}

export default App;
