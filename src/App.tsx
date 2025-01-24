import { RouterProvider } from "react-router";
import { router } from "./routes";
import { MenuBar } from "./components/menuBar";

function App() {
  return (
    <div className="flex flex-col w-screen flex-1 h-screen bg-slate-200">
      <MenuBar />

      <RouterProvider router={router} />
    </div>
  );
}

export default App;
