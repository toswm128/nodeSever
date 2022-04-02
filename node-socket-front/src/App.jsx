import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://10.80.163.234:3030/");
function App() {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [chatList, setChatList] = useState([]);
  const divRef = useRef();
  const myStream = useRef(null);
  useEffect(() => {
    socket.on("post", data => {
      console.log(...chatList);
      setChatList(list => [...list, data]);
    });
    return () => {
      socket.off("post");
    };
  }, []);

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      myStream.current.srcObject = stream;
    } catch (e) {
      console.log(e);
    }
  };

  getMedia();

  return (
    <div className="App">
      <h1>My chat room</h1>
      <video ref={myStream} autoPlay playsInline width="400"></video>
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
          <div ref={key ? divRef : null} key={key}>
            {name}: {text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
