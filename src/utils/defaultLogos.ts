/**
 * Official Vector / SVG Logos for Universitas Negeri Malang (UM),
 * Fakultas Sastra (FS), and Departemen Sastra Indonesia (DSI).
 * 
 * Embedded directly as Data URIs so they load instantaneously everywhere,
 * never require external network calls, never fail CORS in html2canvas/PDF,
 * and guarantee crystal-sharp rendering on all devices.
 */

// 1. LOGO UNIVERSITAS NEGERI MALANG (UM) - Official Circular Academic Seal
const SVG_LOGO_UM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="umGoldGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFDF00"/>
      <stop offset="70%" stop-color="#E5A823"/>
      <stop offset="100%" stop-color="#C58B12"/>
    </radialGradient>
    <radialGradient id="umBlueGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1A4A9F"/>
      <stop offset="100%" stop-color="#0B2B66"/>
    </radialGradient>
    <linearGradient id="umMaroonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B2635"/>
      <stop offset="100%" stop-color="#4A0E18"/>
    </linearGradient>
    <path id="textArcTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none"/>
    <path id="textArcBottom" d="M 170,100 A 70,70 0 0,1 30,100" fill="none"/>
  </defs>

  <!-- Outer Ring (Gold) -->
  <circle cx="100" cy="100" r="96" fill="url(#umGoldGrad)" stroke="#B37400" stroke-width="2"/>
  <circle cx="100" cy="100" r="91" fill="#FFFFFF" stroke="#C58B12" stroke-width="1.5"/>

  <!-- University Blue Ribbon Ring -->
  <circle cx="100" cy="100" r="86" fill="url(#umBlueGrad)" stroke="#C58B12" stroke-width="2"/>
  
  <!-- Outer Circular Text -->
  <text font-family="'Times New Roman', serif, 'Cinzel'" font-size="12.5" font-weight="bold" fill="#FFFFFF" letter-spacing="1.2">
    <textPath href="#textArcTop" startOffset="50%" text-anchor="middle">
      UNIVERSITAS NEGERI MALANG
    </textPath>
  </text>
  <text font-family="'Times New Roman', serif, 'Cinzel'" font-size="10.5" font-weight="bold" fill="#FFDF00" letter-spacing="1.5">
    <textPath href="#textArcBottom" startOffset="50%" text-anchor="middle">
      • THE LEARNING UNIVERSITY •
    </textPath>
  </text>

  <!-- Inner Center Shield / Core -->
  <circle cx="100" cy="100" r="54" fill="#FFFFFF" stroke="url(#umGoldGrad)" stroke-width="3"/>
  <circle cx="100" cy="100" r="50" fill="#FFFDF8"/>

  <!-- Central Emblem: Kalpataru Leaves / Wings of Knowledge -->
  <g transform="translate(100, 96)">
    <!-- Central Torch / Eternal Flame -->
    <path d="M -5,5 C -8,-15 0,-30 0,-36 C 0,-30 8,-15 5,5 Z" fill="#E53935"/>
    <path d="M -2,0 C -4,-10 0,-20 0,-24 C 0,-20 4,-10 2,0 Z" fill="#FFEB3B"/>

    <!-- Left Wings / Stylized Petals -->
    <path d="M -6,-5 C -24,-18 -36,-5 -34,16 C -28,8 -16,4 -6,6 Z" fill="url(#umBlueGrad)"/>
    <path d="M -7,-12 C -20,-24 -30,-16 -28,0 C -22,-6 -14,-7 -7,-4 Z" fill="url(#umGoldGrad)"/>
    <path d="M -5,-18 C -14,-32 -22,-26 -20,-12 C -16,-18 -10,-17 -5,-13 Z" fill="#0B2B66"/>

    <!-- Right Wings / Stylized Petals -->
    <path d="M 6,-5 C 24,-18 36,-5 34,16 C 28,8 16,4 6,6 Z" fill="url(#umBlueGrad)"/>
    <path d="M 7,-12 C 20,-24 30,-16 28,0 C 22,-6 14,-7 7,-4 Z" fill="url(#umGoldGrad)"/>
    <path d="M 5,-18 C 14,-32 22,-26 20,-12 C 16,-18 10,-17 5,-13 Z" fill="#0B2B66"/>

    <!-- Open Book of Science & Knowledge (Base) -->
    <path d="M 0,16 C -12,11 -24,12 -30,19 C -30,13 -16,6 0,11 C 16,6 30,13 30,19 C 24,12 12,11 0,16 Z" fill="url(#umGoldGrad)" stroke="#B37400" stroke-width="0.8"/>
    <path d="M 0,20 C -12,15 -22,16 -28,23 C -28,17 -15,10 0,15 C 15,10 28,17 28,23 C 22,16 12,15 0,20 Z" fill="#0B2B66"/>
    
    <!-- Central Lotus Base -->
    <ellipse cx="0" cy="24" rx="14" ry="4" fill="url(#umGoldGrad)"/>
    <circle cx="0" cy="18" r="3.5" fill="#C58B12"/>
  </g>
</svg>`;

// 2. LOGO FAKULTAS SASTRA (FS UM) - Academic Faculty Crest
const SVG_LOGO_FS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="fsMaroon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B2635"/>
      <stop offset="60%" stop-color="#6B1724"/>
      <stop offset="100%" stop-color="#4A0E18"/>
    </linearGradient>
    <linearGradient id="fsGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE18B"/>
      <stop offset="50%" stop-color="#C5A059"/>
      <stop offset="100%" stop-color="#9C7728"/>
    </linearGradient>
    <filter id="fsShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Laurel Wreath of Academic Excellence -->
  <g stroke="url(#fsGold)" stroke-width="2.5" fill="none" opacity="0.95">
    <!-- Left Wreath -->
    <path d="M 36,120 C 22,95 24,55 52,30"/>
    <path d="M 32,108 C 24,104 22,96 28,94" fill="url(#fsGold)"/>
    <path d="M 28,88 C 20,84 19,76 25,74" fill="url(#fsGold)"/>
    <path d="M 27,68 C 21,62 22,54 29,53" fill="url(#fsGold)"/>
    <path d="M 33,48 C 30,40 34,34 42,35" fill="url(#fsGold)"/>
    <!-- Right Wreath -->
    <path d="M 164,120 C 178,95 176,55 148,30"/>
    <path d="M 168,108 C 176,104 178,96 172,94" fill="url(#fsGold)"/>
    <path d="M 172,88 C 180,84 181,76 175,74" fill="url(#fsGold)"/>
    <path d="M 173,68 C 179,62 178,54 171,53" fill="url(#fsGold)"/>
    <path d="M 167,48 C 170,40 166,34 158,35" fill="url(#fsGold)"/>
  </g>

  <!-- Central Academic Crest / Shield -->
  <g filter="url(#fsShadow)">
    <path d="M 100,22 L 152,38 C 152,86 142,130 100,166 C 58,130 48,86 48,38 Z" 
          fill="url(#fsMaroon)" stroke="url(#fsGold)" stroke-width="4"/>
    <path d="M 100,28 L 146,42 C 146,84 136,124 100,158 C 64,124 54,84 54,42 Z" 
          fill="none" stroke="#FFFFFF" stroke-width="1" opacity="0.6"/>
  </g>

  <!-- Header Banner Ribbon in Shield: FAKULTAS SASTRA -->
  <rect x="58" y="50" width="84" height="15" rx="3" fill="url(#fsGold)" stroke="#9C7728" stroke-width="0.8"/>
  <text x="100" y="61" text-anchor="middle" font-family="'Cinzel', 'Times New Roman', serif" font-size="8" font-weight="900" fill="#4A0E18" letter-spacing="1">
    FAKULTAS SASTRA
  </text>

  <!-- Center Motif: Pen of Literature & Open Manuscript -->
  <g transform="translate(100, 102)">
    <!-- Golden Open Book -->
    <path d="M 0,22 C -15,16 -30,17 -38,26 C -38,18 -20,10 0,16 C 20,10 38,18 38,26 C 30,17 15,16 0,22 Z" 
          fill="url(#fsGold)" stroke="#7D5C17" stroke-width="1"/>
    <path d="M 0,26 C -14,20 -28,21 -36,29 C -36,22 -19,15 0,20 C 19,15 36,22 36,29 C 28,21 14,20 0,26 Z" 
          fill="#FFFDF8"/>

    <!-- Classical Quill / Pen of Language & Literature -->
    <g transform="rotate(35) translate(-4, -28)">
      <path d="M 4,0 C 8,-20 18,-38 22,-44 C 18,-38 12,-30 8,-22 C 4,-26 2,-28 -2,-22 C -2,-14 2,-4 4,0 Z" fill="url(#fsGold)"/>
      <line x1="4" y1="-44" x2="4" y2="4" stroke="#4A0E18" stroke-width="1.2"/>
      <!-- Nib -->
      <polygon points="2,0 6,0 4,6" fill="#FCE18B"/>
    </g>

    <!-- Indonesian Literature Motif: Wayang Gunungan Silhouette in Center -->
    <path d="M 0,-26 C -8,-16 -12,-6 -14,10 C -9,9 -4,8 0,10 C 4,8 9,9 14,10 C 12,-6 8,-16 0,-26 Z" 
          fill="url(#fsGold)" opacity="0.35"/>
    <circle cx="0" cy="-6" r="5" fill="url(#fsGold)"/>
    <circle cx="0" cy="-6" r="3" fill="#6B1724"/>
  </g>

  <!-- Lower Institutional Badge Text -->
  <rect x="62" y="142" width="76" height="13" rx="2" fill="#0B2B66" stroke="url(#fsGold)" stroke-width="1"/>
  <text x="100" y="151.5" text-anchor="middle" font-family="'Cinzel', 'Times New Roman', serif" font-size="7" font-weight="bold" fill="#FFFFFF" letter-spacing="0.8">
    UNIVERSITAS NEGERI MALANG
  </text>
</svg>`;

// 3. LOGO DEPARTEMEN SASTRA INDONESIA (DSI UM)
const SVG_LOGO_DSI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="dsiGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#A52A3C"/>
      <stop offset="80%" stop-color="#6B1724"/>
      <stop offset="100%" stop-color="#3B0B13"/>
    </radialGradient>
    <linearGradient id="dsiGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0A0"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#9A7B1C"/>
    </linearGradient>
  </defs>

  <!-- Octagonal / Classic Medallion Frame -->
  <polygon points="100,10 165,35 190,100 165,165 100,190 35,165 10,100 35,35" 
           fill="url(#dsiGrad)" stroke="url(#dsiGold)" stroke-width="4"/>
  <circle cx="100" cy="100" r="76" fill="none" stroke="url(#dsiGold)" stroke-width="1.5" stroke-dasharray="4 2"/>

  <!-- Inner Center Ring -->
  <circle cx="100" cy="100" r="62" fill="#FFFDF8" stroke="#6B1724" stroke-width="2"/>

  <!-- Central Indonesian Archipelago & Kalam / Pena -->
  <g transform="translate(100, 95)">
    <!-- Book -->
    <path d="M 0,18 C -14,12 -28,14 -34,22 C -34,15 -18,8 0,13 C 18,8 34,15 34,22 C 28,14 14,12 0,18 Z" 
          fill="#6B1724"/>
    <path d="M 0,22 C -12,17 -24,18 -30,25 C -30,19 -16,13 0,18 C 16,13 30,19 30,25 C 24,18 12,17 0,22 Z" 
          fill="url(#dsiGold)"/>

    <!-- Upright Fountain Pen of Indonesian Language & Literature -->
    <path d="M -4,-28 L 4,-28 L 5,4 L 0,16 L -5,4 Z" fill="url(#dsiGold)" stroke="#6B1724" stroke-width="1"/>
    <circle cx="0" cy="-6" r="2.5" fill="#6B1724"/>
    <line x1="0" y1="-6" x2="0" y2="14" stroke="#6B1724" stroke-width="1"/>

    <!-- Stylized Garuda Wings of Indonesian Pride -->
    <path d="M -5,-14 C -18,-24 -30,-14 -26,2 C -20,-4 -12,-3 -5,0 Z" fill="#6B1724"/>
    <path d="M 5,-14 C 18,-24 30,-14 26,2 C 20,-4 12,-3 5,0 Z" fill="#6B1724"/>
  </g>

  <!-- Typography: DEPARTEMEN SASTRA INDONESIA -->
  <text x="100" y="146" text-anchor="middle" font-family="'Times New Roman', serif, 'Cinzel'" font-size="8.5" font-weight="bold" fill="#6B1724" letter-spacing="0.5">
    SASTRA INDONESIA
  </text>
  <text x="100" y="156" text-anchor="middle" font-family="'Times New Roman', serif" font-size="7" font-weight="600" fill="#9A7B1C">
    FAKULTAS SASTRA UM
  </text>
</svg>`;

export function svgToDataUri(svgString: string): string {
  const cleanSvg = svgString.replace(/\n\s*/g, ' ').trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
}

export const DEFAULT_UM_SVG = svgToDataUri(SVG_LOGO_UM);
export const DEFAULT_FS_SVG = svgToDataUri(SVG_LOGO_FS);
export const DEFAULT_DSI_SVG = svgToDataUri(SVG_LOGO_DSI);

export const DEFAULT_UM_LOGO = '/assets/logo-um.png';
export const DEFAULT_FS_LOGO = '/assets/logo-fs-um.svg';
export const DEFAULT_DSI_LOGO = DEFAULT_DSI_SVG;
