import React, { useEffect } from "react";
import io from "socket.io-client";

function App() {
  const socket = io("http://localhost:3030");
  useEffect(() => {
    socket.emit("enter", { payload: "hello" }, () => console.log("done"));
  }, []);

  return (
    <div className="App">
      <div>hi</div>
    </div>
  );
}

export default App;
