import { useEffect, useState } from "react";

const CAPTURE_OPTIONS = {
  audio: true,
  video: true,
};

export function useUserMedia() {
  const [mediaStream, setMediaStream] = useState<MediaStream | undefined>(undefined);

  useEffect(() => {
    // if (!mediaStream) {
      enableStream();
    // } else {
    //   return function cleanup() {
    //     mediaStream.getTracks().forEach((track) => {
    //       track.stop();
    //     });
    //   };
    // }
  }, []);

  async function enableStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(CAPTURE_OPTIONS);
      setMediaStream(stream);
    } catch (err) {
      // Removed for brevity
    }
  }

  return mediaStream;
}
