import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3030/");
function App() {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);
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
      console.log(stream);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getMedia();
  }, []);
  return (
    <div className="App">
      <h1>My chat room</h1>
      <video ref={myStream} autoPlay playsInline width="400"></video>
      <button
        onClick={() => {
          setVideo(!video);
          myStream.current.srcObject.getVideoTracks().forEach(treak => {
            treak.enabled = !treak.enabled;
            console.log(treak);
          });
        }}
      >
        캠
      </button>
      <button
        onClick={() => {
          setAudio(!audio);
          myStream.current.srcObject.getAudioTracks().forEach(treak => {
            treak.enabled = !treak.enabled;
            console.log(treak);
          });
        }}
      >
        소리
      </button>
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
