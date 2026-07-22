'use client';

import Image from 'next/image';
import Home3DBackground from '@/components/Home3DBackground';

const projects = [
  {
    title: 'Daedalus avionics system',
    summary:
      'Designed and built an embedded avionics system on an Arduino Nano, integrating a BMP388, BNO055 IMU, GPS module, and microSD storage for in-flight data acquisition. Soldered and tested the circuitry on a protoboard, then flew and recovered it with all sensors fully intact.',
    stack: ['Arduino IDE', 'Circuiting', 'Soldering'],
    link: '#',
    image: '/projects/daedalus-avionics.jpg',
  },
  {
    title: 'Project Phoenix — Rocket Propulsion Laboratory',
    summary:
      'Built the avionics integration for a 13-foot liquid methalox rocket, programming microcontrollers in Arduino to interface with GPS, altitude, and pressure sensors. Collaborated on instrumenting the propulsion test stand.',
    stack: ['Arduino', 'Avionics', 'Propulsion testing'],
    link: '#',
    image: '/projects/phoenix-rocket.jpg',
  },
  {
    title: 'Payload structure',
    summary:
      'Designed a structure in SolidWorks to hold two 130.5g payloads at fixed positions on a pivoting thrust beam. Ran force and torque analysis and lifted the payload into horizontal equilibrium.',
    stack: ['SolidWorks', '3D printing'],
    link: '#',
    image: '/projects/payload-structure.jpg',
  },
  {
    title: 'Autonomous line-following robot',
    summary:
      'Assembled a line-tracking robot around an ESP32 and a custom CAD chassis, implementing PID control and PWM motor regulation from photoresistor feedback to optimize autonomous steering.',
    stack: ['ESP32', 'PID control', 'Onshape'],
    link: '#',
    image: '/projects/line-following-robot.jpg',
  },
  {
    title: 'Soccer ball kick simulation',
    summary:
      'Built a MATLAB simulation modeling a free kick under gravitational and Magnus forces, generating 3D trajectory plots against the goal, keeper, and defenders — optimized to run in under five minutes.',
    stack: ['MATLAB'],
    link: 'https://github.com/yourusername/soccer-kick-simulation',
    image: '/projects/soccer-sim-1.jpg',
  },
];

export default function Home() {
  return (
    <>
      {/* Fixed, full-page 3D background — sits behind everything else */}
      <Home3DBackground />

      <main className="relative">
        {/* HERO — this section is where dragging rotates the camera, per home-drag-surface id */}
        <section
          id="home-drag-surface"
          className="pointer-events-auto flex h-screen flex-col justify-center px-8 sm:px-16"
        >
          <p className="mb-4 font-mono text-xs tracking-widest text-white/50">
            AEROSPACE ENGINEER
          </p>
          <h1
            className="text-5xl font-semibold tracking-tight sm:text-7xl"
            style={{
              WebkitTextStrokeWidth: '1.5px',
              WebkitTextStrokeColor: '#000000',
              paintOrder: 'stroke fill',
            }}
          >
            Dani (Emily) Ouk
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">Ad Astra Per Aspera</p>

          <div className="mt-8 flex gap-6 text-sm">
            <a
              href="#projects"
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="underline underline-offset-4"
            >
              View projects
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="text-white/60 underline underline-offset-4"
            >
              View résumé
            </a>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="bg-black/70 backdrop-blur-sm px-8 py-24 sm:px-16">
          <h2 className="mb-12 text-2xl font-semibold">Projects</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {projects.map((p) => (
              <a
                key={p.title}
                href={p.link}
                className="block rounded-lg border border-white/10 p-6 transition hover:border-white/30"
              >
                {p.image && (
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-md">
                    <Image src={p.image} alt={p.title} fill className="object-cover" />
                  </div>
                )}
                <h3 className="text-lg font-medium">{p.title}</h3>
                <p className="mt-2 text-sm text-white/60">{p.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded border border-white/10 px-2 py-1 font-mono text-xs text-white/50"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="border-t border-white/10 bg-black/70 backdrop-blur-sm px-8 py-24 sm:px-16"
        >
          <h2 className="mb-6 text-2xl font-semibold">About</h2>
          <div className="max-w-2xl space-y-4 text-white/70">
            <p>
              I&apos;m an aerospace engineering student at UC San Diego, and an EMPOWER
              Scholar.
            </p>
            <p>
              I work across avionics, propulsion, and structures — currently as a
              Propulsion &amp; Avionics Engineer with UCSD&apos;s Rocket Propulsion
              Laboratory, where I&apos;ve helped integrate flight avionics for a
              13-foot liquid methalox rocket and modeled trajectories to improve
              stability margins by 80% on a previous rocket project.
            </p>
            <p>
              Outside the lab, I&apos;ve served as project manager for a NASA proposal team that
              earned a perfect evaluation score, and I currently chair development
              for Women of Aeronautics and Astronautics at UCSD.
            </p>
          </div>
        </section>

        {/* CONTACT */}
        <section
          id="contact"
          className="border-t border-white/10 bg-black/70 backdrop-blur-sm px-8 py-24 sm:px-16"
        >
          <h2 className="mb-6 text-2xl font-semibold">Contact</h2>
          <div className="flex gap-6 text-white/70">
            <a href="mailto:douk@ucsd.edu" className="underline underline-offset-4">
              Email
            </a>
            <a href="https://github.com/yourname" className="underline underline-offset-4">
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/dani-ouk/"
              className="underline underline-offset-4"
            >
              LinkedIn
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
