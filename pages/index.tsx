import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import {
  MdVideocam,
  MdVideocamOff,
  MdMic,
  MdMicOff,
  MdGroupAdd,
} from "react-icons/md";
import socketIOClient from "socket.io-client";
import { useUserMedia } from "./hooks/useUserMedia";
import Peer, { Instance } from "simple-peer";

const ENDPOINT = "http://localhost:5001";

const Home: NextPage = () => {
  const socket = socketIOClient(ENDPOINT);

  const [name, setName] = useState("");
  const [isCamOpened, setIsCamOpened] = useState(true);
  const [isAudioOpened, setIsAudioOpened] = useState(true);
  const [myCallId, setMyCallId] = useState("");
  const [idToCall, setIdToCall] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState("");
  const [receivingCall, setReceivingCall] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Instance>();
  const mediaStream = useUserMedia();

  useEffect(() => {
    if (myVideo && myVideo.current) {
      //@ts-ignore
      myVideo.current.srcObject = mediaStream;
    }

    socket.on("me", (id) => {
      setMyCallId(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, [mediaStream]);

  const callUser = (id: string) => {
    console.log("id do user: ", id);
    console.log("id meu: ", myCallId);
    const socketIO = socketIOClient(ENDPOINT);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: mediaStream,
    });
    peer.on("signal", (data: any) => {
      socketIO.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: myCallId,
        name: name,
      });
    });
    peer.on("stream", (stream: any) => {
      if (userVideo) {
        console.log('vou botar meu video la')
        //@ts-ignore
        userVideo.current.srcObject = stream;
      }
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    console.log('ta inu')
    const socketIO = socketIOClient(ENDPOINT);
    
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: mediaStream,
    });
    peer.on("signal", (data) => {
      socketIO.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const copyMyCallId = () => navigator.clipboard.writeText(myCallId);

  const toggleAudio = () => {
    if (!myVideo.current) return;
    const isAudioEnabled = myVideo.current.muted;
    setIsAudioOpened(!isAudioEnabled);
    myVideo.current.muted = !isAudioEnabled;
  };

  const toggleCam = () => {
    if (!mediaStream) return;
    const isCamEnabled = mediaStream.getVideoTracks()[0].enabled;
    if (isCamEnabled) mediaStream.getVideoTracks()[0].enabled = false;
    else mediaStream.getVideoTracks()[0].enabled = true;
    setIsCamOpened(!isCamOpened);
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
        <input
          type="text"
          placeholder="ID to call"
          value={idToCall}
          onChange={(e) => setIdToCall(e.target.value)}
        />
        <button type="button" onClick={() => callUser(idToCall)}>
          Call
        </button>
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
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <button onClick={answerCall}>Answer</button>
            </div>
          ) : null}
        </div>
        <p className="my-call-id">{myCallId}</p>
      </section>
      <section className="video-details">
        {mediaStream && <video playsInline ref={myVideo} autoPlay />}
        {callAccepted && <video playsInline ref={userVideo} autoPlay />}
      </section>
    </div>
  );
};

export default Home;
