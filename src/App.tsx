import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Preload,
  ScrollControls,
  Scroll,
  useScroll,
  Image as ImageImpl,
  type ImageProps,
} from "@react-three/drei";

import img1 from "./img1.png";
import trip2 from "./trip2.jpg";
import img7 from "./img7.png";
import video1 from "./Mango_GenAI_01.mp4";
import video2 from "./Mango_GenAI_02.mp4";
import video3 from "./Mango_GenAI_03.mp4";
import video4 from "./Mango_GenAI_04.mp4";

// Distributes over ImageProps' texture/url union so each branch keeps its
// own shape instead of collapsing into one incompatible object type.
type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

type ImageComponentProps = DistributiveOmit<ImageProps, "ref"> & {
  c?: THREE.Color;
};

function Image({ c = new THREE.Color(), ...props }: ImageComponentProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);
  useFrame(() => {
    // drei's Image material exposes `color` at runtime; the ref type only
    // knows about the generic THREE.Material.
    (ref.current.material as unknown as { color: THREE.Color }).color.lerp(
      c.set(hovered ? "white" : "#ccc"),
      hovered ? 0.4 : 0.05,
    );
  });
  return (
    <ImageImpl
      ref={ref}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}
    />
  );
}

type VideoProps = Omit<
  Extract<ImageProps, { texture: THREE.Texture }>,
  "texture" | "ref"
> & {
  src: string;
  scrollRange: [number, number];
};

function Video({ scrollRange, src, ...props }: VideoProps) {
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const video = useMemo(() => {
    const element = document.createElement("video");
    element.muted = true;
    element.loop = true;
    element.playsInline = true;
    element.preload = "auto";
    return element;
  }, []);
  const texture = useMemo(() => new THREE.VideoTexture(video), [video]);
  const scroll = useScroll();

  useEffect(() => {
    const handleMetadataLoaded = () => {
      // drei's <Image> reads texture.image.width/height to compute the
      // aspect ratio. For a <video> element those HTML attributes default
      // to 0 (unlike videoWidth/videoHeight), so without this the shader's
      // imageBounds collapses to [0, 0] and distorts the frame.
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      setMetadataLoaded(true);
    };
    video.addEventListener("loadedmetadata", handleMetadataLoaded);
    video.src = src;
    video.load();
    return () => {
      video.removeEventListener("loadedmetadata", handleMetadataLoaded);
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
    };
  }, [src, texture, video]);

  useFrame(() => {
    const isVisible = scroll.visible(scrollRange[0], scrollRange[1]);
    if (isVisible && video.paused) {
      void video.play();
    } else if (!isVisible && !video.paused) {
      video.pause();
    }
  });

  if (!metadataLoaded) return null;

  return <ImageImpl texture={texture} {...props} />;
}

function Images() {
  const { width, height } = useThree((state) => state.viewport);
  const data = useScroll();
  const group = useRef<THREE.Group>(null!);
  useFrame(() => {
    // drei's Image material exposes `zoom`/`grayscale` at runtime; the
    // group's children are only known as generic THREE.Object3D.
    const children = group.current.children as unknown as {
      material: { zoom: number; grayscale: number };
    }[];
    children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    children[1].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    children[2].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 3;
    children[3].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    children[4].material.zoom = 1 + data.range(1.25 / 3, 1 / 3) / 1;
    children[5].material.zoom = 1 + data.range(1.8 / 3, 1 / 3) / 3;
    children[5].material.grayscale = 1 - data.range(1.6 / 3, 1 / 3);
    children[6].material.zoom = 1 + (1 - data.range(2 / 3, 1 / 3)) / 3;
  });
  return (
    <group ref={group}>
      {/* drei's Image only reads scale[0]/scale[1]; the trailing 1 in each
          of these is inert but kept to match the upstream source's literal
          value. */}
      <Image
        position={[-2, 0, 0]}
        scale={[4, height, 1] as unknown as [number, number]}
        url={img1}
      />
      <Video
        position={[1, 0, 1]}
        scale={[1.6875, 3] as unknown as [number, number]}
        src={video1}
        scrollRange={[0, 1 / 3]}
      />
      <Image
        position={[-2.3, -height, 2]}
        scale={[1, 3, 1] as unknown as [number, number]}
        url={trip2}
      />
      <Video
        position={[-0.6, -height, 3]}
        scale={[1.125, 2] as unknown as [number, number]}
        src={video2}
        scrollRange={[1 / 3, 1 / 3]}
      />
      <Video
        position={[0.5, -height, 3.5]}
        scale={[0.8438, 1.5] as unknown as [number, number]}
        src={video3}
        scrollRange={[1 / 3, 1 / 3]}
      />
      <Video
        position={[0, -height * 1.5, 2.5]}
        scale={[1.6875, 3] as unknown as [number, number]}
        src={video4}
        scrollRange={[0.5, 1 / 3]}
      />
      <Image
        position={[0, -height * 2 - height / 4, 0]}
        scale={[width, height / 2, 1] as unknown as [number, number]}
        url={img7}
      />
    </group>
  );
}

export default function App() {
  return (
    <Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ScrollControls damping={4} pages={3}>
          <Scroll>
            <Images />
          </Scroll>
          <Scroll html>
            <h1 style={{ position: "absolute", top: "60vh", left: "0.5em" }}>
              to
            </h1>
            <h1 style={{ position: "absolute", top: "120vh", left: "60vw" }}>
              be
            </h1>
            <h1
              style={{
                position: "absolute",
                top: "198.5vh",
                left: "0.5vw",
                fontSize: "32vw",
                whiteSpace: "nowrap",
              }}
            >
              stylish
            </h1>
          </Scroll>
        </ScrollControls>
        <Preload />
      </Suspense>
    </Canvas>
  );
}
