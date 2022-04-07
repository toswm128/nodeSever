import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3030");
const peer = new RTCPeerConnection();
function App() {
  const [text, setText] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);
  const [chatList, setChatList] = useState([]);
  const divRef = useRef();
  const streams = useRef();
  const [members, setMembers] = useState([0]);
  const myStream = useRef([]);
  const [onStream, setOnStream] = useState(false);

  useEffect(() => {
    socket.on("post", data => {
      console.log(...chatList);
      setChatList(list => [...list, data]);
    });
    socket.on("comeRoom", data => {
      console.log(data, "방에 들어왔습니다");
      connectPeer();
    });
    socket.on("postOffer", async data => {
      peer.setRemoteDescription(data).then(() => {
        console.log("remote 성공");
      });
      const answer = await peer.createAnswer();
      console.log("offer받음");
      peer.setLocalDescription(answer);
      console.log("answer 보냄");
      console.log("offer", data, "answer", answer);
      socket.emit("getAnswer", answer);
    });
    socket.on("postAnswer", data => {
      console.log("answer 받음");
      console.log(data);
      peer.setRemoteDescription(data).then(dd => {
        console.log("remote 성공");
      });
    });
    peer.addEventListener("icecandidate", data => {
      socket.emit("getIce", data.candidate);
      console.log("ice 보냄");
    });

    socket.on("postIce", ice => {
      console.log("ice 받음");
      peer.addIceCandidate(ice);
    });

    peer.ontrack = data => {
      console.log("got data");
      console.log(data);
      streams.current.srcObject = data.streams[0];
    };
    // peer.addEventListener("track", data => {
    //   console.log("got data");
    //   console.log(data);
    //   streams.current.srcObject = data.streams[0];
    //   // let cnt = 1;
    //   // data.streams.forEach(stream => {
    //   //   streams.current[cnt].srcObject = stream;
    //   //   cnt = cnt + 1;
    //   // });
    //   // streams.current[1].srcObject = data.streams;
    //   // console.log(streams.current[1].srcObject);
    //   // setMembers(prev => [...prev, prev.length]);
    // });

    peer.addEventListener("connectionstatechange", data => {
      // console.log(data);
    });

    return () => {
      socket.off("post");
      socket.off("comeRoom");
      socket.off("postOffer");
      socket.off("postAnswer");
      socket.off("postIce");
      peer.removeEventListener("icecandidate", () => console.log("return"));
    };
  }, []);

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      myStream.current.srcObject = stream;
      stream.getTracks().forEach(treak => {
        peer.addTrack(treak, stream);
      });
      console.log(streams);
      socket.emit("goRoom", room);
    } catch (e) {
      console.log(e);
    }
  };

  const connectPeer = async () => {
    const offer = await peer.createOffer();
    peer.setLocalDescription(offer);
    console.log(offer);
    socket.emit("getOffer", offer);
    console.log("offer보냄");
  };

  return (
    <div className="App">
      <h1>My chat room</h1>
      {!onStream ? (
        <form
          onSubmit={async e => {
            e.preventDefault();
            setOnStream(true);
            await getMedia();
          }}
        >
          <input
            type="text"
            value={room}
            placeholder="방이름을 입력해주세요"
            onChange={e => {
              setRoom(e.target.value);
            }}
          />
        </form>
      ) : (
        <>
          <video
            ref={elem => (myStream.current = elem)}
            onClick={e => console.log(e.target.srcObject)}
            autoPlay
            playsInline
            width="400"
          ></video>
          <video
            ref={elem => (streams.current = elem)}
            onClick={e => console.log(e.target.srcObject)}
            autoPlay
            playsInline
            width="400"
          ></video>
          <button
            onClick={() => {
              setVideo(!video);
              myStream.current.srcObject.getVideoTracks().forEach(treak => {
                treak.enabled = !treak.enabled;
              });
            }}
          >
            {video ? "캠 끄기" : "캠 켜기"}
          </button>
          <button
            onClick={() => {
              setAudio(!audio);
              myStream.current.srcObject.getAudioTracks().forEach(treak => {
                treak.enabled = !treak.enabled;
              });
            }}
          >
            {audio ? "음소거" : "마이크 켜기"}
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
              setChatList(list => [
                ...list,
                { name: name ? name : "ㅇㅇ", text },
              ]);
              socket.emit("enter", { text, name, room });
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
        </>
      )}
    </div>
  );
}

export default App;
