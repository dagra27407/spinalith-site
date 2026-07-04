// src/components/home/homeComponents/HomeConnectedMap.tsx

/**
 * File: src/components/home/homeComponents/HomeConnectedMap.tsx
 *
 * Purpose:
 * Purpose-built SVG connection-map illustration for the homepage
 * "Everything Connected" section.
 *
 * Responsibilities:
 * - Presents Spinalith as one connected story workspace.
 * - Shows key story layers connected around a central Story Core.
 * - Uses a single SVG viewBox so the entire illustration scales like one visual.
 * - Keeps labels, helper text, icons, and structure editable in code.
 *
 * Notes:
 * - This is coded marketing artwork, not interactive UI.
 * - The section should place and scale this component, but not style map internals.
 * - Styles for the SVG live in homeConnectedMap.css.
 */

import "./homeConnectedMap.css";

export function HomeConnectedMap() {
  return (
    <svg
      className="home-connected-map"
      viewBox="0 0 760 360"
      role="img"
      aria-labelledby="home-connected-map-title home-connected-map-desc"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="home-connected-map-title">
        Spinalith connected story map
      </title>

      <desc id="home-connected-map-desc">
        A visual map showing characters, locations, relationships, items,
        structure, and notes connected to a central story core.
      </desc>

      <defs>
        <radialGradient id="connectedMapAura" cx="50%" cy="50%" r="62%">
          <stop offset="0%" className="home-connected-map__aura-stop-strong" />
          <stop offset="52%" className="home-connected-map__aura-stop-soft" />
          <stop offset="100%" className="home-connected-map__aura-stop-clear" />
        </radialGradient>

        <radialGradient id="connectedMapHubFill" cx="50%" cy="18%" r="82%">
          <stop offset="0%" className="home-connected-map__hub-fill-top" />
          <stop offset="58%" className="home-connected-map__hub-fill-mid" />
          <stop offset="100%" className="home-connected-map__hub-fill-bottom" />
        </radialGradient>

        <linearGradient id="connectedMapNodeFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" className="home-connected-map__node-fill-top" />
          <stop offset="100%" className="home-connected-map__node-fill-bottom" />
        </linearGradient>

        <linearGradient
          id="connectedMapBlueNodeFill"
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop
            offset="0%"
            className="home-connected-map__blue-node-fill-top"
          />
          <stop
            offset="100%"
            className="home-connected-map__blue-node-fill-bottom"
          />
        </linearGradient>

        <filter
          id="connectedMapNodeShadow"
          x="-20%"
          y="-25%"
          width="140%"
          height="155%"
        >
          <feDropShadow dx="0" dy="15" stdDeviation="13" floodOpacity="0.32" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodOpacity="0.2" />
        </filter>

        <filter
          id="connectedMapHubShadow"
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
        >
          <feDropShadow dx="0" dy="17" stdDeviation="17" floodOpacity="0.4" />
          <feDropShadow dx="0" dy="0" stdDeviation="18" floodOpacity="0.34" />
        </filter>
      </defs>

      {/* Ambient art layer */}
      <ellipse
        className="home-connected-map__aura"
        cx="380"
        cy="181"
        rx="330"
        ry="122"
        fill="url(#connectedMapAura)"
      />

      <g className="home-connected-map__stars" aria-hidden="true">
        <circle cx="100" cy="78" r="1.05" />
        <circle cx="156" cy="47" r="0.9" />
        <circle cx="214" cy="117" r="0.95" />
        <circle cx="260" cy="317" r="1.05" />
        <circle cx="318" cy="58" r="0.95" />
        <circle cx="380" cy="31" r="1.1" />
        <circle cx="438" cy="58" r="1" />
        <circle cx="500" cy="318" r="0.95" />
        <circle cx="556" cy="116" r="0.9" />
        <circle cx="604" cy="48" r="1.05" />
        <circle cx="660" cy="78" r="1.05" />
        <circle cx="676" cy="286" r="0.95" />
        <circle cx="78" cy="282" r="0.9" />
      </g>

      {/* Connector lines */}
      <g className="home-connected-map__connections" aria-hidden="true">
        <path
          className="home-connected-map__line"
          d="M380 180 C346 131 318 86 268 77"
        />
        <path
          className="home-connected-map__line home-connected-map__line--blue"
          d="M380 180 C414 131 442 86 492 77"
        />

        <path
          className="home-connected-map__line"
          d="M380 180 C314 179 244 179 202 180"
        />
        <path
          className="home-connected-map__line home-connected-map__line--soft"
          d="M380 180 C446 179 516 179 558 180"
        />

        <path
          className="home-connected-map__line home-connected-map__line--blue"
          d="M380 180 C346 228 318 274 268 283"
        />
        <path
          className="home-connected-map__line"
          d="M380 180 C414 228 442 274 492 283"
        />

        <circle className="home-connected-map__spark" cx="315" cy="116" r="3.2" />
        <circle className="home-connected-map__spark" cx="445" cy="116" r="3.2" />
        <circle className="home-connected-map__spark" cx="274" cy="179" r="2.9" />
        <circle className="home-connected-map__spark" cx="486" cy="179" r="2.9" />
        <circle className="home-connected-map__spark" cx="315" cy="244" r="3.2" />
        <circle className="home-connected-map__spark" cx="445" cy="244" r="3.2" />
      </g>

      {/* Top left: Characters */}
      <g
        className="home-connected-map__node"
        filter="url(#connectedMapNodeShadow)"
        transform="translate(78 48)"
      >
        <rect
          className="home-connected-map__node-card"
          width="190"
          height="58"
          rx="21"
          fill="url(#connectedMapNodeFill)"
        />
        <rect
          className="home-connected-map__icon-box"
          x="15"
          y="11"
          width="36"
          height="36"
          rx="12"
        />
        <g className="home-connected-map__icon">
          <circle cx="32" cy="25" r="5.2" />
          <path d="M22 42 C23.6 35.5 40.4 35.5 42 42" />
          <path d="M44 20 C49 22.5 49 29.5 44 32" />
        </g>
        <text className="home-connected-map__node-title" x="66" y="25">
          Characters
        </text>
        <text className="home-connected-map__node-helper" x="66" y="42">
          Know your cast.
        </text>
      </g>

      {/* Top right: Locations */}
      <g
        className="home-connected-map__node home-connected-map__node--blue"
        filter="url(#connectedMapNodeShadow)"
        transform="translate(492 48)"
      >
        <rect
          className="home-connected-map__node-card"
          width="190"
          height="58"
          rx="21"
          fill="url(#connectedMapBlueNodeFill)"
        />
        <rect
          className="home-connected-map__icon-box"
          x="15"
          y="11"
          width="36"
          height="36"
          rx="12"
        />
        <g className="home-connected-map__icon">
          <path d="M33 43 C45 30 46 21 33 18 C20 21 21 30 33 43 Z" />
          <circle cx="33" cy="26" r="4.2" />
        </g>
        <text className="home-connected-map__node-title" x="66" y="25">
          Locations
        </text>
        <text className="home-connected-map__node-helper" x="66" y="42">
          Build your world.
        </text>
      </g>

      {/* Middle left: Relationships */}
      <g
        className="home-connected-map__node"
        filter="url(#connectedMapNodeShadow)"
        transform="translate(0 151)"
      >
        <rect
          className="home-connected-map__node-card"
          width="202"
          height="58"
          rx="21"
          fill="url(#connectedMapNodeFill)"
        />
        <rect
          className="home-connected-map__icon-box"
          x="15"
          y="11"
          width="36"
          height="36"
          rx="12"
        />
        <g className="home-connected-map__icon">
          <rect x="27" y="17" width="12" height="10" rx="2" />
          <path d="M33 27 L33 35" />
          <rect x="17" y="35" width="12" height="8" rx="2" />
          <rect x="37" y="35" width="12" height="8" rx="2" />
          <path d="M23 35 L43 35" />
        </g>
        <text className="home-connected-map__node-title" x="66" y="25">
          Relationships
        </text>
        <text className="home-connected-map__node-helper" x="66" y="42">
          Map connections.
        </text>
      </g>

      {/* Middle right: Items */}
      <g
        className="home-connected-map__node"
        filter="url(#connectedMapNodeShadow)"
        transform="translate(558 151)"
      >
        <rect
          className="home-connected-map__node-card"
          width="202"
          height="58"
          rx="21"
          fill="url(#connectedMapNodeFill)"
        />
        <rect
          className="home-connected-map__icon-box"
          x="15"
          y="11"
          width="36"
          height="36"
          rx="12"
        />
        <g className="home-connected-map__icon">
          <path d="M33 17 L45 24 L33 31 L21 24 Z" />
          <path d="M21 24 L21 37 L33 44 L33 31" />
          <path d="M45 24 L45 37 L33 44" />
        </g>
        <text className="home-connected-map__node-title" x="66" y="25">
          Items
        </text>
        <text className="home-connected-map__node-helper" x="66" y="42">
          Track key details.
        </text>
      </g>

      {/* Bottom left: Structure */}
      <g
        className="home-connected-map__node home-connected-map__node--blue"
        filter="url(#connectedMapNodeShadow)"
        transform="translate(78 254)"
      >
        <rect
          className="home-connected-map__node-card"
          width="190"
          height="58"
          rx="21"
          fill="url(#connectedMapBlueNodeFill)"
        />
        <rect
          className="home-connected-map__icon-box"
          x="15"
          y="11"
          width="36"
          height="36"
          rx="12"
        />
        <g className="home-connected-map__icon">
          <path d="M23 18 C30 15 35 18 35 18 L35 37 C30 34 25 36 23 38 Z" />
          <path d="M43 18 C36 15 35 18 35 18 L35 37 C40 34 45 36 47 38 L47 18 Z" />
        </g>
        <text className="home-connected-map__node-title" x="66" y="25">
          Structure
        </text>
        <text className="home-connected-map__node-helper" x="66" y="42">
          Plan the journey.
        </text>
      </g>

      {/* Bottom right: Notes */}
      <g
        className="home-connected-map__node"
        filter="url(#connectedMapNodeShadow)"
        transform="translate(492 254)"
      >
        <rect
          className="home-connected-map__node-card"
          width="190"
          height="58"
          rx="21"
          fill="url(#connectedMapNodeFill)"
        />
        <rect
          className="home-connected-map__icon-box"
          x="15"
          y="11"
          width="36"
          height="36"
          rx="12"
        />
        <g className="home-connected-map__icon">
          <path d="M24 18 L40 18 L46 24 L46 40 L24 40 Z" />
          <path d="M40 18 L40 25 L46 25" />
        </g>
        <text className="home-connected-map__node-title" x="66" y="25">
          Notes
        </text>
        <text className="home-connected-map__node-helper" x="66" y="42">
          Capture everything.
        </text>
      </g>

      {/* Hub */}
      <g
        className="home-connected-map__hub"
        filter="url(#connectedMapHubShadow)"
        transform="translate(324 124)"
      >
        <rect
          className="home-connected-map__hub-card"
          width="112"
          height="124"
          rx="23"
          fill="url(#connectedMapHubFill)"
        />

        <rect
          className="home-connected-map__hub-icon-box"
          x="36"
          y="18"
          width="40"
          height="40"
          rx="13"
        />

        <g className="home-connected-map__hub-icon">
          <path d="M56 24 L71 32.5 L56 41 L41 32.5 Z" />
          <path d="M41 32.5 L41 50 L56 58.5 L56 41" />
          <path d="M71 32.5 L71 50 L56 58.5" />
        </g>

        <text className="home-connected-map__hub-title" x="56" y="78">
          Story Core
        </text>

        <text className="home-connected-map__hub-helper" x="56" y="95">
          <tspan x="56">One connected</tspan>
          <tspan x="56" dy="13.5">workspace</tspan>
        </text>
      </g>
    </svg>
  );
}