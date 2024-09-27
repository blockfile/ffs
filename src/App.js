import "./App.css";
import { useRoutes } from "react-router-dom";
import Home from "./components/pages/home";
import Profile from "./components/pages/profile";

function App() {
    let element = useRoutes([
        {
            path: "/",
            element: <Home />,
        },
        {
            path: "/profile/:walletAddress", // Add dynamic profile route
            element: <Profile />,
        },
    ]);
    return (
        <div
            className="App"
            style={{
                fontFamily: "Changa, sans-serif",
                backgroundColor: "#18191A",
            }}>
            {element}
        </div>
    );
}

export default App;
