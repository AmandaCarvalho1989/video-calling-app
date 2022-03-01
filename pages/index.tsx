import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import {
  MdVideocam,
  MdVideocamOff,
  MdMic,
  MdMicOff,
  MdGroupAdd,
} from "react-icons/md";
import io from "socket.io-client";



const Home: NextPage = () => {
  // const socket = io("http://localhost:5000");

  const [name, setName] = useState("");
  const [stream, setStream] = useState<undefined | MediaStream>();
  const [isCamOpened, setIsCamOpened] = useState(false);
  const [isAudioOpened, setIsAudioOpened] = useState(false);
  const [myCallId, setMyCallId] = useState("");

  const myVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo && myVideo.current) {
          myVideo.current.srcObject = stream;
          setIsCamOpened(true);
          setIsAudioOpened(false);
        }
      });
  }, []);

  const copyMyCallId = async () => {

    // socket.on("me", (id) => {
    //   setMyCallId(id);
    //   navigator.clipboard.writeText(id);
    // });
  };

  const toggleAudio = () => {
    if (!myVideo.current) return;
    const isAudioEnabled = myVideo.current.muted;
    console.log("isAudioEnabled: ", isAudioEnabled);
    if (isAudioEnabled) {
      myVideo.current.muted = false;
      setIsAudioOpened(false);
    } else {
      myVideo.current.muted = true;
      setIsAudioOpened(true);
    }
  };

  const toggleCam = () => {
    if (!stream) return;
    const isCamEnabled = stream.getVideoTracks()[0].enabled;
    if (isCamEnabled) {
      stream.getVideoTracks()[0].enabled = false;
      setIsCamOpened(false);
    } else {
      stream.getVideoTracks()[0].enabled = true;
      setIsCamOpened(true);
    }
  };

  return (
    <div className="main">
      <section className="room-details">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input type="text" placeholder="ID to call" />
      </section>
      <section className="video-details">
        {stream && <video playsInline muted ref={myVideo} autoPlay />}
        <div className="video-actions">
          <button type="button" onClick={toggleAudio}>
            {isAudioOpened ? <MdMic size={20} /> : <MdMicOff size={20} />}
          </button>
          <button type="button" onClick={toggleCam}>
            {isCamOpened ? (
              <MdVideocam size={20} />
            ) : (
              <MdVideocamOff size={20} />
            )}
          </button>
          <button type="button" onClick={copyMyCallId}>
            <MdGroupAdd size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
