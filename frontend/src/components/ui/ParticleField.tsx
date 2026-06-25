import React, { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

export const ParticleField = React.memo(() => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="agri-particles"
      init={particlesInit}
      className="absolute inset-0 pointer-events-none z-0"
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 40,
        particles: {
          color: { value: "#C9A84C" },
          links: {
            color: "#C9A84C",
            distance: 120,
            enable: true,
            opacity: 0.08,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.4,
            direction: "none",
            random: true,
            outModes: { default: "bounce" },
          },
          number: { density: { enable: true, area: 900 }, value: 40 },
          opacity: { value: 0.18 },
          size: { value: { min: 1, max: 2.5 } },
        },
        detectRetina: true,
      }}
    />
  );
});
