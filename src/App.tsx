/**
 * "Volver a vos" — taller de Gabriela Medina, psicóloga
 *
 * 3 secciones full-screen + splash + navbar fija + footer chico.
 * Contenido de demo generado para revisar el diseño — reemplazar por
 * las respuestas reales del cuestionario cuando estén.
 *
 * Stack: React + Vite + TypeScript + Tailwind CSS. Sin librerías externas.
 */

import React, { useEffect, useRef, useState } from 'react';

/* ============================================================
   PALETA — usar con clases arbitrarias de Tailwind, ej: bg-[#FAF7F2]
   ============================================================ */
export const CREMA = '#FAF7F2'; // fondo global (reemplaza a white)
export const TINTA = '#2E2A26'; // texto principal (negro cálido)
export const SALVIA = '#5A7A63'; // ÚNICO acento de color (botón CTA)
export const ARENA = '#F3EFE7'; // relleno sólido suave
export const VERDINA = '#E4EAE2'; // relleno sólido verde suave

/* ============================================================
   IMÁGENES — reemplazar las URLs, mantener los nombres
   ============================================================ */
// Imagen generada — reemplazar por la foto real de la psicóloga o del espacio (pregunta 19)
const HERO_IMAGE = 'img/hero.jpg';

// Imagen generada — reemplazar por foto del espacio o de un taller anterior (pregunta 20)
const SECTION2_IMAGE = 'img/taller.jpg';

// Imágenes generadas — reemplazar por fotos de talleres/grupos anteriores (pregunta 20)
const SECTION3_IMG1 = 'img/grupo-1.jpg';
const SECTION3_IMG2 = 'img/grupo-2.jpg';

// Imagen generada — reemplazar por retrato de la psicóloga (pregunta 19)
const SECTION3_BG = 'img/retrato.jpg';

/* ============================================================
   DATOS
   ============================================================ */
// ÚNICO llamado a la acción de toda la página
const WHATSAPP_URL = 'https://wa.me/5491123456789'; // ⚠️ reemplazar por el número real
const CTA_LABEL = 'Quiero anotarme';

// Qué se lleva quien participa (pregunta 4 del cuestionario)
const featureBars = ['Herramientas para la ansiedad', 'Pausas que descansan de verdad', 'Límites sin culpa'];

// Datos duros del taller (preguntas 5-13)
const datosTaller = [
  { label: 'Cuándo', value: 'Sábado 22/8, 10 a 13 h', num: '01', active: true },
  { label: 'Duración', value: '3 horas, encuentro único', num: '02', active: false },
  { label: 'Dónde', value: 'Espacio Serena, Almagro', num: '03', active: false },
  { label: 'Precio', value: '$45.000 · 20% off hasta el 8/8', num: null, active: false },
];

const NAV_LINKS = [
  { label: 'El taller', href: '#el-taller' },
  { label: 'Para quién', href: '#para-quien' },
  { label: 'Qué te llevás', href: '#que-te-llevas' },
  { label: 'Inscripción', href: '#inscripcion' },
  { label: 'Sobre mí', href: '#sobre-mi' },
];

/* ============================================================
   MASKED CARDS — varias cards comparten una misma imagen de fondo
   ============================================================ */
type MaskPosition = { x: number; y: number; sw: number; sh: number };

/**
 * Offset acumulado con offsetLeft/offsetTop (ignoran transforms, a diferencia
 * de getBoundingClientRect — importante porque las cards entran animadas con
 * translateY y se miden antes de terminar la animación).
 */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/** Posición de cada card relativa a la sección (la "ventana" de cada card). */
function useMaskPositions(
  sectionRef: React.RefObject<HTMLElement>,
  cardsRef: React.MutableRefObject<(HTMLDivElement | null)[]>,
  count: number,
) {
  const [positions, setPositions] = useState<MaskPosition[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const compute = () => {
      const sw = section.clientWidth;
      const sh = section.clientHeight;
      const next: MaskPosition[] = [];
      for (let i = 0; i < count; i++) {
        const card = cardsRef.current[i];
        if (card) {
          const { x, y } = offsetWithin(card, section);
          next.push({ x, y, sw, sh });
        } else {
          next.push({ x: 0, y: 0, sw, sh });
        }
      }
      setPositions(next);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(section);
    for (const card of cardsRef.current) {
      if (card) ro.observe(card);
    }
    return () => ro.disconnect();
  }, [sectionRef, cardsRef, count]);

  return positions;
}

/** Ancho que tendría la imagen escalada para cubrir el alto de la sección. */
function useImageWidth(src: string, sectionRef: React.RefObject<HTMLElement>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let ratio = 0;
    const compute = () => {
      const sh = sectionRef.current ? sectionRef.current.clientHeight : 0;
      if (ratio > 0 && sh > 0) setWidth(ratio * sh);
    };
    const img = new Image();
    img.onload = () => {
      ratio = img.naturalWidth / img.naturalHeight;
      compute();
    };
    img.src = src;
    const ro = new ResizeObserver(compute);
    if (sectionRef.current) ro.observe(sectionRef.current);
    return () => {
      img.onload = null;
      ro.disconnect();
    };
  }, [src, sectionRef]);

  return width;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

type MaskedCardProps = {
  bgImage: string;
  position?: MaskPosition;
  imageWidth: number;
  focalX: number;
  parallax?: number;
  className?: string;
  children?: React.ReactNode;
  cardRef?: (el: HTMLDivElement | null) => void;
  style?: React.CSSProperties;
  id?: string;
};

function MaskedCard(props: MaskedCardProps) {
  const { bgImage, position, imageWidth, focalX, parallax, className, children, cardRef, style, id } = props;
  const pos = position ?? { x: 0, y: 0, sw: 0, sh: 0 };

  // Si la imagen escalada al alto no llega a cubrir el ancho de la sección
  // (pantallas muy anchas), se escala por ancho para que nunca quede un hueco.
  const coversWidth = imageWidth >= pos.sw;
  const overflow = coversWidth ? imageWidth - pos.sw : 0;
  const focalOffset = overflow * focalX;

  return (
    <div
      id={id}
      ref={cardRef}
      className={className}
      style={{
        ...style,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: coversWidth ? `auto ${pos.sh}px` : `${pos.sw}px auto`,
        backgroundPosition: `-${pos.x + focalOffset + (parallax ?? 0)}px -${pos.y}px`,
        backgroundRepeat: 'no-repeat',
        transition: (style && style.transition ? style.transition + ', ' : '') + 'background-position 1.2s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   ANIMACIÓN — entrada escalonada al entrar en viewport
   ============================================================ */
function useStaggeredReveal(count: number, threshold = 0.15) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const getAnimStyle = (index: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition:
      `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms, ` +
      `transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms`,
  });

  return { containerRef, getAnimStyle };
}

/* ============================================================
   SPLASH
   ============================================================ */
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= 100) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 20);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (count < 100) return;
    const t1 = setTimeout(() => setExiting(true), 200);
    const t2 = setTimeout(onComplete, 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [count, onComplete]);

  return (
    <div
      data-screen-label="Splash"
      className={`fixed inset-0 z-[100] bg-[#FAF7F2] flex items-end justify-start transition-opacity duration-700 ${exiting ? 'opacity-0' : 'opacity-100'}`}
    >
      <span className="text-7xl md:text-9xl font-bold tabular-nums p-6 md:p-10 leading-none text-[#2E2A26]">{count}</span>
    </div>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */
function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-2 md:py-3 bg-[#FAF7F2]/80 backdrop-blur-md">
        <a href="#el-taller" onClick={close} className="flex flex-col">
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none text-[#2E2A26]">GABRIELA</span>
          <span className="-mt-1.5 md:-mt-2 text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none text-[#2E2A26]">MEDINA</span>
          <span className="text-[8px] md:text-[9px] font-medium leading-none mt-1.5 md:mt-2 text-[#2E2A26]">psicóloga · mat. 52.318</span>
        </a>

        {/* Nav desktop */}
        <div className="hidden md:flex items-center gap-5">
          <span className="text-sm font-semibold text-[#2E2A26]">Sáb 22/8 · 10 h</span>
          <a
            href={WHATSAPP_URL}
            className="px-6 py-3 bg-[#5A7A63] rounded-full text-sm font-semibold text-white hover:bg-[#2E2A26] transition-colors duration-200"
          >
            {CTA_LABEL}
          </a>
        </div>

        {/* Hamburguesa mobile */}
        <button
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="md:hidden relative w-10 h-10 flex items-center justify-center"
        >
          <span
            className={`absolute h-0.5 w-6 bg-[#2E2A26] rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-[#2E2A26] rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-[#2E2A26] rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}
          />
        </button>
      </header>

      {/* Menú mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-[#FAF7F2] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <nav className="flex flex-col justify-center h-full px-8 gap-1">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                className={`text-4xl font-bold text-[#2E2A26] hover:text-[#5A7A63] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                style={{ transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }}
              >
                {link.label}
              </a>
            ))}

            <div
              className={`mt-8 pt-8 border-t border-[#E4EAE2] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: open ? '450ms' : '0ms' }}
            >
              <p className="text-sm font-semibold text-[#2E2A26] mb-4">Respondo consultas de lunes a viernes, de 9 a 18 h</p>
              <a
                href={WHATSAPP_URL}
                className="w-full block text-center px-6 py-4 bg-[#5A7A63] rounded-full text-white text-sm font-semibold hover:bg-[#2E2A26] transition-colors duration-200"
              >
                {CTA_LABEL}
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   SECCIÓN 1 — HERO (el taller de un vistazo)
   ============================================================ */
function Section1() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const positions = useMaskPositions(sectionRef, cardsRef, 4);
  const imageWidth = useImageWidth(HERO_IMAGE, sectionRef);
  const isMobile = useIsMobile();
  const focalX = isMobile ? 0.7 : 0.8;
  const { containerRef, getAnimStyle } = useStaggeredReveal(4);

  // Parallax sutil que sigue al mouse (solo desktop)
  const [mouseX, setMouseX] = useState(0.5);
  const parallax = isMobile ? 0 : (mouseX - 0.5) * 36;

  return (
    <section
      id="el-taller"
      data-screen-label="01 · Hero — el taller"
      ref={(el) => {
        sectionRef.current = el;
        containerRef.current = el;
      }}
      onMouseMove={(e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMouseX((e.clientX - r.left) / Math.max(1, r.width));
      }}
      className="relative h-screen w-full overflow-hidden flex flex-col pt-24 md:pt-24 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      {/* 3 beneficios — qué te llevás (pregunta 4) */}
      {featureBars.map((feature, i) => (
        <MaskedCard
          key={feature}
          id={i === 0 ? 'que-te-llevas' : undefined}
          bgImage={HERO_IMAGE}
          position={positions[i]}
          imageWidth={imageWidth}
          focalX={focalX}
          parallax={parallax}
          cardRef={(el) => {
            cardsRef.current[i] = el;
          }}
          className="w-full h-14 md:h-20 shrink-0 rounded-xl md:rounded-2xl overflow-hidden relative group"
          style={getAnimStyle(i)}
        >
          <span className="relative z-10 flex items-center justify-center h-full text-[#2E2A26] text-lg md:text-3xl font-bold text-center transition-transform duration-500 ease-out group-hover:scale-[1.04]">
            {feature}
          </span>
        </MaskedCard>
      ))}

      {/* Card principal */}
      <MaskedCard
        bgImage={HERO_IMAGE}
        position={positions[3]}
        imageWidth={imageWidth}
        focalX={focalX}
        parallax={parallax}
        cardRef={(el) => {
          cardsRef.current[3] = el;
        }}
        className="w-full flex-1 min-h-0 rounded-xl md:rounded-2xl overflow-hidden relative"
        style={getAnimStyle(3)}
      >
        <p className="absolute top-4 left-4 md:top-7 md:left-7 text-[#2E2A26] text-xs md:text-sm font-semibold leading-4 md:leading-5 max-w-[200px] md:max-w-[300px] z-10">
          Un taller grupal para aprender
          <br />
          a parar, escucharte y cuidarte.
        </p>

        <div className="absolute bottom-5 left-3 md:bottom-8 md:left-4 z-10">
          <span className="block text-[#2E2A26] text-xs md:text-sm font-semibold mb-1 md:mb-2">
            Presencial · Sábado 22 de agosto, 10 a 13 h
          </span>
          <h1 className="text-[#2E2A26] text-[clamp(3rem,11vw,11rem)] font-bold leading-[0.79] tracking-tight">
            Volver
            <br />
            a vos
          </h1>
        </div>

        <a
          href={WHATSAPP_URL}
          className="absolute bottom-6 right-4 md:bottom-10 md:right-8 px-5 py-3 md:px-8 md:py-5 bg-[#5A7A63] rounded-full text-white text-base md:text-xl font-bold z-10 hover:scale-105 transition-transform"
        >
          {CTA_LABEL}
        </a>
      </MaskedCard>
    </section>
  );
}

/* ============================================================
   SECCIÓN 2 — DE QUÉ SE TRATA / PARA QUIÉN
   ============================================================ */
function Section2() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const positions = useMaskPositions(sectionRef, cardsRef, 4);
  const imageWidth = useImageWidth(SECTION2_IMAGE, sectionRef);
  const isMobile = useIsMobile();
  const focalX = isMobile ? 0.65 : 0.8;
  const { containerRef, getAnimStyle } = useStaggeredReveal(4);

  // Parallax sutil que sigue al mouse (solo desktop)
  const [mouseX, setMouseX] = useState(0.5);
  const parallax = isMobile ? 0 : (mouseX - 0.5) * 30;

  return (
    <section
      id="para-quien"
      data-screen-label="02 · De qué se trata / Para quién"
      ref={(el) => {
        sectionRef.current = el;
        containerRef.current = el;
      }}
      onMouseMove={(e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMouseX((e.clientX - r.left) / Math.max(1, r.width));
      }}
      className="relative min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_auto_auto_auto] md:grid-rows-[1fr_1fr_0.8fr] gap-1.5 md:gap-2">
        {/* Card 0 — ¿De qué se trata? */}
        <MaskedCard
          bgImage={SECTION2_IMAGE}
          position={positions[0]}
          imageWidth={imageWidth}
          focalX={focalX}
          parallax={parallax}
          cardRef={(el) => {
            cardsRef.current[0] = el;
          }}
          className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
          style={getAnimStyle(0)}
        >
          <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white md:text-[#2E2A26] text-2xl md:text-3xl font-bold z-10">
            ¿De qué se trata?
          </h2>
          <p className="absolute bottom-4 left-5 md:bottom-6 md:left-7 text-white md:text-[#2E2A26] text-xs md:text-sm font-semibold z-10">
            Un espacio guiado por Gabriela Medina
          </p>
        </MaskedCard>

        {/* Card 1 — descripción (ocupa 2 filas en desktop) */}
        <MaskedCard
          bgImage={SECTION2_IMAGE}
          position={positions[1]}
          imageWidth={imageWidth}
          focalX={focalX}
          parallax={parallax}
          cardRef={(el) => {
            cardsRef.current[1] = el;
          }}
          className="md:row-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
          style={getAnimStyle(1)}
        >
          <p className="absolute bottom-16 left-5 md:bottom-20 md:left-7 text-white text-xs md:text-sm font-semibold leading-4 md:leading-5 z-10">
            Tres horas para bajar un cambio, en grupo chico.
            <br />
            Vamos a mirar qué te está pidiendo el cuerpo,
            <br />
            practicar herramientas simples de regulación
            <br />
            y armar tu propio plan de pausa para la semana.
          </p>
          <a
            href={WHATSAPP_URL}
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-[#2E2A26] text-base md:text-xl font-bold z-10 hover:scale-105 transition-transform"
          >
            {CTA_LABEL}
          </a>
        </MaskedCard>

        {/* Card 2 — ¿Para quién es? */}
        <MaskedCard
          bgImage={SECTION2_IMAGE}
          position={positions[2]}
          imageWidth={imageWidth}
          focalX={focalX}
          parallax={parallax}
          cardRef={(el) => {
            cardsRef.current[2] = el;
          }}
          className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
          style={getAnimStyle(2)}
        >
          <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white md:text-[#2E2A26] text-[clamp(2.2rem,7vw,5rem)] font-bold leading-[0.9] z-10">
            ¿Para quién
            <br />
            es?
          </h2>
          <p className="absolute bottom-4 left-5 md:bottom-6 md:left-7 text-white md:text-[#2E2A26] text-xs md:text-sm font-semibold z-10 max-w-[85%]">
            Para vos, que venís a mil, te cuesta decir que no y sentís que el cuerpo te pide una pausa.
          </p>
        </MaskedCard>

        {/* Card 3 — datos duros del taller (preguntas 5-13) */}
        <MaskedCard
          bgImage={SECTION2_IMAGE}
          position={positions[3]}
          imageWidth={imageWidth}
          focalX={focalX}
          parallax={parallax}
          cardRef={(el) => {
            cardsRef.current[3] = el;
          }}
          className="col-span-1 md:col-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
          style={getAnimStyle(3)}
        >
          <div className="absolute inset-0 z-10 flex flex-wrap md:flex-nowrap gap-1.5 md:gap-2 p-2 md:p-3">
            {datosTaller.map((dato) => (
              <div
                key={dato.label}
                className={`flex-1 min-w-[calc(50%-4px)] md:min-w-0 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between transition-colors duration-300 ${dato.active ? 'bg-white/90 backdrop-blur-md hover:bg-white' : 'bg-white/20 backdrop-blur-xl hover:bg-white/30'}`}
              >
                <div>
                  <p
                    className={`text-[10px] md:text-xs font-semibold uppercase tracking-wide ${dato.active ? 'text-[#5A7A63]' : 'text-white/80'}`}
                  >
                    {dato.label}
                  </p>
                  <h3
                    className={`mt-1 md:mt-2 text-lg md:text-3xl font-bold leading-[1.05] whitespace-pre-line ${dato.active ? 'text-[#2E2A26]' : 'text-white'}`}
                  >
                    {dato.value}
                  </h3>
                </div>
                {dato.num && (
                  <div
                    className={`self-end w-8 h-8 md:w-12 md:h-12 rounded-full border flex items-center justify-center text-xs md:text-sm font-semibold ${dato.active ? 'border-[#2E2A26] text-[#2E2A26]' : 'border-white text-white'}`}
                  >
                    {dato.num}
                  </div>
                )}
              </div>
            ))}
          </div>
        </MaskedCard>
      </div>
    </section>
  );
}

/* ============================================================
   SECCIÓN 3 — INSCRIPCIÓN + SOBRE ELLA
   ============================================================ */
function Section3() {
  const { containerRef, getAnimStyle } = useStaggeredReveal(4);

  return (
    <section
      id="inscripcion"
      data-screen-label="03 · Inscripción / Sobre mí"
      ref={containerRef}
      className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-1.5 md:gap-2">
          {/* Título */}
          <div
            className="rounded-xl md:rounded-2xl bg-[#F3EFE7] p-5 md:p-7 flex flex-col justify-between flex-[1.2] min-h-[180px] md:min-h-0"
            style={getAnimStyle(0)}
          >
            <h2 className="text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.95] text-[#2E2A26]">
              Cómo
              <br />
              anotarse
            </h2>
            <p className="text-xs md:text-sm font-semibold text-[#2E2A26]">
              Inscripción abierta hasta el 18/8 · 12 lugares
            </p>
          </div>

          {/* Dos fotos (pregunta 20) */}
          <div className="flex gap-1.5 md:gap-2 flex-1 min-h-[140px] md:min-h-0" style={getAnimStyle(1)}>
            <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden group">
              <img src={SECTION3_IMG1} alt="Taller anterior — trabajo en grupo" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
            <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden group">
              <img src={SECTION3_IMG2} alt="El espacio donde se hace el taller" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
          </div>

          {/* Pasos */}
          <div
            className="rounded-xl md:rounded-2xl bg-[#E4EAE2] p-5 md:p-7 flex items-end justify-between flex-[0.8] min-h-[160px] md:min-h-0"
            style={getAnimStyle(2)}
          >
            <div>
              <p className="text-xs md:text-sm font-semibold text-[#2E2A26] mb-2 md:mb-3">En 3 pasos</p>
              <h3 className="text-xl md:text-3xl font-bold text-[#2E2A26] leading-6 md:leading-8">
                1. Escribime
                <br />
                2. Reservás con seña
                <br />
                3. Te llega la confirmación
              </h3>
            </div>
            <a
              href={WHATSAPP_URL}
              className="px-5 py-3 md:px-8 md:py-5 bg-[#5A7A63] rounded-full text-white text-base md:text-xl font-bold hover:scale-105 transition-transform"
            >
              {CTA_LABEL}
            </a>
          </div>
        </div>

        {/* Columna derecha — retrato + overlays */}
        <div id="sobre-mi" className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[350px] md:min-h-0" style={getAnimStyle(3)}>
          <img src={SECTION3_BG} alt="Gabriela Medina, psicóloga" className="w-full h-full object-cover animate-[drift_18s_ease-in-out_infinite_alternate]" />

          <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 flex gap-1.5 md:gap-2">
            {/* Quién da el taller */}
            <div className="flex-1 bg-white rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52">
              <div>
                <p className="text-[10px] md:text-xs font-semibold text-[#5A7A63] uppercase tracking-wide">Sobre mí</p>
                <h4 className="mt-1 md:mt-2 text-lg md:text-2xl font-bold text-[#2E2A26] leading-5 md:leading-7">
                  Gabriela Medina
                  <br />
                  Lic. en Psicología (UBA)
                  <br />
                  mat. 52.318
                </h4>
              </div>
              <p className="text-[10px] md:text-xs font-medium text-[#2E2A26]">
                Armé este taller porque en el consultorio veo, todos los días, lo que cuesta parar.
              </p>
            </div>

            {/* Testimonio */}
            <div className="flex-1 bg-white/20 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52">
              <h4 className="text-lg md:text-2xl font-bold text-white leading-5 md:leading-7">
                "Me fui liviana,
                <br />
                con herramientas simples
                <br />
                y ganas de cuidarme."
              </h4>
              <p className="text-[10px] md:text-xs font-semibold text-white">— Carla, participante 2025</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer data-screen-label="Footer" className="w-full px-3 md:px-5 pb-3 md:pb-4">
      <div className="rounded-xl md:rounded-2xl bg-[#F3EFE7] px-5 py-4 md:px-7 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <p className="text-xs md:text-sm font-semibold text-[#2E2A26]">Gabriela Medina · Lic. en Psicología · mat. 52.318</p>
        <div className="flex flex-wrap items-center gap-4">
          <a href={WHATSAPP_URL} className="text-xs md:text-sm font-semibold text-[#5A7A63] hover:text-[#2E2A26] transition-colors duration-200">
            WhatsApp
          </a>
          <a href="https://instagram.com/gabrielamedina.psi" className="text-xs md:text-sm font-semibold text-[#5A7A63] hover:text-[#2E2A26] transition-colors duration-200">
            @gabrielamedina.psi
          </a>
          <a href="mailto:hola@gabrielamedina.ar" className="text-xs md:text-sm font-semibold text-[#5A7A63] hover:text-[#2E2A26] transition-colors duration-200">
            hola@gabrielamedina.ar
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   APP
   ============================================================ */
type AppProps = {
  /** Permite desactivar el splash (útil para revisar la página). */
  conSplash?: boolean;
};

function App({ conSplash = true }: AppProps) {
  const [showSplash, setShowSplash] = useState(conSplash);

  useEffect(() => {
    setShowSplash(conSplash);
  }, [conSplash]);

  // Bloquear el scroll mientras está el splash
  useEffect(() => {
    if (!showSplash) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSplash]);

  return (
    <div className="bg-[#FAF7F2]">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Navbar />
      <Section1 />
      <Section2 />
      <Section3 />
      <Footer />
    </div>
  );
}

export { App };
export default App;
