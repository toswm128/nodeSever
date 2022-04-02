import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://10.80.163.234:3030/");
function App() {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [chatList, setChatList] = useState([]);
  useEffect(() => {
    socket.on("post", data => {
      console.log(...chatList);
      setChatList(list => [...list, data]);
    });
    return () => {
      socket.off("post");
    };
  }, []);

  return (
    <div className="App">
      <h1>My chat room</h1>
      <input
        type="text"
        placeholder="이름을 입력해 주세요"
        value={name}
        onChange={e => {
          setName(e.target.value);
        }}
      />
      <form
        onSubmit={e => {
          e.preventDefault();
          setText("");
          setChatList(list => [...list, { name: name ? name : "ㅇㅇ", text }]);
          socket.emit("enter", { text, name });
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
        {chatList.map(({ name, text }, key) => (
          <div key={key}>
            {name}: {text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
