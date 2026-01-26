import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

const WIDTH = 1200;
const HEIGHT = 630;

// Colores del gradiente
const GRADIENT_START = '#0D6E6E';
const GRADIENT_END = '#095555';

export const GET: APIRoute = async () => {
  // Cargar fuentes
  const fontsDir = path.join(process.cwd(), 'src/assets/fonts');
  const interRegular = fs.readFileSync(path.join(fontsDir, 'Inter-Regular.ttf'));
  const interSemiBold = fs.readFileSync(path.join(fontsDir, 'Inter-SemiBold.ttf'));
  const newsreaderSemiBold = fs.readFileSync(path.join(fontsDir, 'Newsreader-SemiBold.ttf'));

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%)`,
          padding: '60px',
        },
        children: [
          // Columna izquierda
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
                paddingRight: '40px',
              },
              children: [
                // Título
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Newsreader',
                      fontSize: '56px',
                      fontWeight: 600,
                      color: 'white',
                      lineHeight: 1.1,
                      marginBottom: '24px',
                    },
                    children: '¿Cuánto me quita el Estado?',
                  },
                },
                // Subtítulo
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Inter',
                      fontSize: '24px',
                      fontWeight: 400,
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1.4,
                      marginBottom: '32px',
                    },
                    children: 'Calcula el impacto fiscal de tu nómina y consumo en tiempo real',
                  },
                },
                // Badge URL
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      padding: '12px 20px',
                      borderRadius: '8px',
                    },
                    children: [
                      // Icono globo SVG
                      {
                        type: 'svg',
                        props: {
                          width: '20',
                          height: '20',
                          viewBox: '0 0 24 24',
                          fill: 'none',
                          stroke: 'rgba(255, 255, 255, 0.8)',
                          strokeWidth: '2',
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          children: [
                            { type: 'circle', props: { cx: '12', cy: '12', r: '10' } },
                            { type: 'line', props: { x1: '2', y1: '12', x2: '22', y2: '12' } },
                            { type: 'path', props: { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' } },
                          ],
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontFamily: 'Inter',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.9)',
                          },
                          children: 'cuantomequitaelestado.com',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          // Columna derecha
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '400px',
              },
              children: [
                // Círculo con porcentaje
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '220px',
                      height: '220px',
                      borderRadius: '50%',
                      border: '6px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '32px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'Inter',
                            fontSize: '64px',
                            fontWeight: 600,
                            color: 'white',
                            lineHeight: 1,
                          },
                          children: '42%',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'Inter',
                            fontSize: '16px',
                            fontWeight: 400,
                            color: 'rgba(255, 255, 255, 0.8)',
                            marginTop: '4px',
                          },
                          children: 'presión fiscal',
                        },
                      },
                    ],
                  },
                },
                // Stats row
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      gap: '40px',
                    },
                    children: [
                      // IRPF
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontFamily: 'Inter',
                                  fontSize: '14px',
                                  fontWeight: 400,
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '4px',
                                },
                                children: 'IRPF',
                              },
                            },
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontFamily: 'Inter',
                                  fontSize: '28px',
                                  fontWeight: 600,
                                  color: 'white',
                                },
                                children: '24%',
                              },
                            },
                          ],
                        },
                      },
                      // IVA
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontFamily: 'Inter',
                                  fontSize: '14px',
                                  fontWeight: 400,
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '4px',
                                },
                                children: 'IVA',
                              },
                            },
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontFamily: 'Inter',
                                  fontSize: '28px',
                                  fontWeight: 600,
                                  color: 'white',
                                },
                                children: '21%',
                              },
                            },
                          ],
                        },
                      },
                      // SS
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontFamily: 'Inter',
                                  fontSize: '14px',
                                  fontWeight: 400,
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  marginBottom: '4px',
                                },
                                children: 'SS',
                              },
                            },
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontFamily: 'Inter',
                                  fontSize: '28px',
                                  fontWeight: 600,
                                  color: 'white',
                                },
                                children: '6.5%',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: 'Inter',
          data: interRegular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: interSemiBold,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Newsreader',
          data: newsreaderSemiBold,
          weight: 600,
          style: 'normal',
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
