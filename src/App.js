import React from "react";
import PlayerInput from "./components/PlayerInput";

const App = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-custom-bg bg-cover bg-center">
      <div className="flex flex-col items-center text-center">
        <PlayerInput/>
      </div>
    </div>
  );
}

export default App;