import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { Dimensions } from "react-native";

export default function TabBarBackground({ height = 70 }) {
  const { width } = Dimensions.get("window");
  const cutoutRadius = 85;   // wider dip
  const cutoutDepth = 55;    // deeper cut
  const cornerRadius = 18;   // smoother corners
  const centerX = width / 2;

  return (
    <Svg
      width={width}
      height={height + 25}
      style={{ position: "absolute", bottom: 0 }}
    >
      <Defs>
        {/* Modern gradient */}
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#6a11cb" />  {/* Purple */}
          <Stop offset="1" stopColor="#2575fc" />  {/* Blue */}
        </LinearGradient>

        {/* Subtle top shine */}
        <LinearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="rgba(255,255,255,0.7)" />
          <Stop offset="1" stopColor="rgba(255,255,255,0)" />
        </LinearGradient>

        {/* Glow at cutout area */}
        <RadialGradient
          id="glow"
          cx={centerX}
          cy={cutoutDepth}
          r={cutoutRadius}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="rgba(255,255,255,0.4)" />
          <Stop offset="1" stopColor="rgba(255,255,255,0)" />
        </RadialGradient>
      </Defs>

      {/* Background with gradient */}
      <Path
        d={`
          M${cornerRadius} 0
          H${centerX - cutoutRadius}
          C${centerX - cutoutRadius / 2} 0, ${centerX - cutoutRadius / 2} ${cutoutDepth}, ${centerX} ${cutoutDepth}
          C${centerX + cutoutRadius / 2} ${cutoutDepth}, ${centerX + cutoutRadius / 2} 0, ${centerX + cutoutRadius} 0
          H${width - cornerRadius}
          Q${width} 0, ${width} ${cornerRadius}
          V${height}
          Q${width} ${height + cornerRadius}, ${width - cornerRadius} ${height + cornerRadius}
          H${cornerRadius}
          Q0 ${height + cornerRadius}, 0 ${height}
          V${cornerRadius}
          Q0 0, ${cornerRadius} 0
          Z
        `}
        fill="url(#grad)"
      />

      {/* Soft shine on top border */}
      <Path
        d={`M0 0 H${width}`}
        stroke="url(#shine)"
        strokeWidth={2}
      />

      {/* Glow in cutout */}
      <Path
        d={`
          M${centerX - cutoutRadius} 0
          C${centerX - cutoutRadius / 2} 0, ${centerX - cutoutRadius / 2} ${cutoutDepth}, ${centerX} ${cutoutDepth}
          C${centerX + cutoutRadius / 2} ${cutoutDepth}, ${centerX + cutoutRadius / 2} 0, ${centerX + cutoutRadius} 0
        `}
        fill="url(#glow)"
      />
    </Svg>
  );
}
