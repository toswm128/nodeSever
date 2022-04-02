import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://10.80.163.234:3030/");
function App() {
  const [text, setText] = useState("");
  const [chatList, setChatList] = useState([]);
  useEffect(() => {
    socket.on("post", msg => {
      console.log(...chatList);
      setChatList(list => [...list, msg]);
    });
    return () => {
      socket.off("post");
    };
  }, []);

  return (
    <div className="App">
      <h1>My chat room</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          setText("");
          setChatList(list => [...list, text]);
          socket.emit("enter", text);
        }}
      >
        <input
          placeholder="내용을 입력해 주세요"
          value={text}
          onChange={e => {
            setText(e.target.value);
          }}
        />
      </form>
      <div>
        {chatList.map((chat, key) => (
          <div key={key}>{chat}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
