import { useState } from "react";
import { ChromaFlow, FilmGrain, FlutedGlass, Shader, Swirl } from "shaders/react";

export default function ShaderBackdrop({ onSettled }: { onSettled: () => void }) {
  const [ready, setReady] = useState(false);

  return (
    <Shader
      className="shader-live"
      data-ready={ready || undefined}
      disableTelemetry
      onReady={() => { setReady(true); onSettled(); }}
      onUnavailable={() => { setReady(false); onSettled(); }}
    >
      <Swirl colorA="#15130f" colorB="#8b8a80" detail={1.7} />
      <ChromaFlow baseColor="#191714" downColor="#514c40" leftColor="#dedbc8"
        rightColor="#343028" upColor="#8b8a80" momentum={13} radius={3.5} />
      <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12}
        highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
      <FilmGrain strength={0.05} />
    </Shader>
  );
}
