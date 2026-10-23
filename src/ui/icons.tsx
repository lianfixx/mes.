// Familia de iconos de Mes: cuadrícula de 24, trazo 1.75, extremos redondeados.
// Dibujo propio y editable; nunca sustituyen una etiqueta crítica.
import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

const strokes = {
  calendar:
    "M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5zM4 10h16M8.5 3v4M15.5 3v4",
  repeat:
    "M16.5 2.5 19.5 5.5 16.5 8.5M4.5 11V9.5a4 4 0 0 1 4-4h11M7.5 21.5l-3-3 3-3M19.5 13v1.5a4 4 0 0 1-4 4h-11",
  list: "M9 6.5h11M9 12h11M9 17.5h11M4.25 6.5h.5M4.25 12h.5M4.25 17.5h.5",
  plus: "M12 5v14M5 12h14",
  check: "M5 12.5l4.5 4.5L19 7.5",
  chevronLeft: "M14.5 6l-6 6 6 6",
  chevronRight: "M9.5 6l6 6-6 6",
  chevronDown: "M6 9.5l6 6 6-6",
  chevronUp: "M6 14.5l6-6 6 6",
  close: "M6 6l12 12M18 6L6 18",
  info: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 11v5.5M12 7.75v.01",
  alert: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 7.5V13M12 16.25v.01",
  search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 20 20",
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
  moon: "M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z",
  out: "M7 17 17 7M9 7h8v8",
  in: "M17 7 7 17M15 17H7V9",
  refund: "M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  installment:
    "M6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9A2.5 2.5 0 0 1 6.5 5zM4 9.5h16M7.5 15h3",
  pause: "M9 6v12M15 6v12",
  end: "M4.5 12h11M19 6v12",
  cancel: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM5.6 5.6l12.8 12.8",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  trend: "M4 16.5 9.5 11l3.5 3.5L20 7.5M14.5 7.5H20V13",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
};
export type IconName =
  keyof typeof strokes | "more" | "dot" | "pending" | "system";

export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 1.75,
}: {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    // Decorativo: el nombre accesible lo da el control o el texto contiguo.
    accessibilityElementsHidden: true,
    importantForAccessibility: "no-hide-descendants" as const,
    focusable: false,
    pointerEvents: "none" as const,
  };
  if (name === "more")
    return (
      <Svg {...common}>
        <Circle cx={5.5} cy={12} r={1.6} fill={color} />
        <Circle cx={12} cy={12} r={1.6} fill={color} />
        <Circle cx={18.5} cy={12} r={1.6} fill={color} />
      </Svg>
    );
  if (name === "dot")
    return (
      <Svg {...common}>
        <Circle cx={12} cy={12} r={5} fill={color} />
      </Svg>
    );
  if (name === "pending")
    return (
      <Svg {...common}>
        <Circle
          cx={12}
          cy={12}
          r={7}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="2.6 2.9"
          strokeLinecap="round"
        />
      </Svg>
    );
  if (name === "system")
    return (
      <Svg {...common}>
        <Circle
          cx={12}
          cy={12}
          r={8.5}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <Path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill={color} />
      </Svg>
    );
  return (
    <Svg {...common}>
      <Path
        d={strokes[name]}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
