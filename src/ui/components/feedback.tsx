import React from "react";
import { Pressable, View } from "react-native";
import { Icon, IconName } from "../icons";
import { radius, size, space } from "../tokens";
import { Button } from "./controls";
import { useUI } from "./theme";
import { Txt } from "./Txt";

export type StatusKind =
  | "today"
  | "soon"
  | "toConfirm"
  | "paid"
  | "paused"
  | "ended"
  | "cancelled"
  | "estimated"
  | "note";
const statusIcon: Partial<Record<StatusKind, IconName>> = {
  today: "dot",
  toConfirm: "pending",
  paid: "check",
  paused: "pause",
  ended: "end",
  cancelled: "cancel",
};

/** Estado legible sin color: icono con forma propia + palabra. */
export function StatusTag({
  kind,
  label,
}: {
  kind: StatusKind;
  label: string;
}) {
  const { t } = useUI();
  const icon = statusIcon[kind];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: space.xxs,
        minHeight: 24,
        paddingHorizontal: space.xs,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: kind === "today" ? t.ink : t.control,
      }}
    >
      {icon && <Icon name={icon} size={12} color={t.ink} strokeWidth={2.2} />}
      <Txt variant="meta" weight={kind === "today" ? "600" : "500"}>
        {label}
      </Txt>
    </View>
  );
}

/** Explicación o confirmación en línea, agrupada por un fondo sutil. */
export function Notice({
  icon = "info",
  title,
  children,
  actions,
}: {
  icon?: IconName;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { t } = useUI();
  return (
    <View
      style={{
        flexDirection: "row",
        gap: space.sm,
        padding: space.md,
        borderRadius: radius.md,
        backgroundColor: t.surface,
      }}
    >
      <View style={{ marginTop: 1 }}>
        <Icon name={icon} size={size.icon} color={t.ink} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: space.xs }}>
        {title ? (
          <Txt variant="secondary" weight="600">
            {title}
          </Txt>
        ) : null}
        {typeof children === "string" ? (
          <Txt variant="secondary">{children}</Txt>
        ) : (
          children
        )}
        {actions ? (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: space.xs,
              marginTop: space.xxs,
            }}
          >
            {actions}
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** Error sin campo propio (por ejemplo, una regla de calendario). Se anuncia
 * como alerta y conserva lo escrito en el formulario. */
export function ErrorSummary({ message }: { message: string }) {
  const { t } = useUI();
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={{
        flexDirection: "row",
        gap: space.sm,
        padding: space.md,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: t.ink,
      }}
    >
      <Icon name="alert" size={size.icon} color={t.ink} />
      <Txt variant="secondary" weight="500" style={{ flex: 1 }}>
        {message}
      </Txt>
    </View>
  );
}

export function EmptyState({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        paddingVertical: space.xl,
        gap: space.xs,
        alignItems: "flex-start",
      }}
    >
      <Txt variant="body" weight="600">
        {title}
      </Txt>
      {body ? (
        <Txt variant="secondary" tone="muted" style={{ maxWidth: 420 }}>
          {body}
        </Txt>
      ) : null}
      {action && onAction ? (
        <View style={{ marginTop: space.xs }}>
          <Button
            compact
            variant="secondary"
            label={action}
            onPress={onAction}
          />
        </View>
      ) : null}
    </View>
  );
}

/** Región viva permanente: react-native-web no implementa
 * announceForAccessibility, así que los avisos se anuncian desde aquí. El
 * contenedor existe siempre para que el lector detecte el cambio. */
export function Toast({
  message,
  actionLabel,
  onAction,
  bottom,
  left,
  right,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  bottom: number;
  left: number;
  right: number;
}) {
  const { t } = useUI();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom,
        left,
        right,
        alignItems: "center",
        zIndex: 30,
      }}
    >
      <View aria-live="polite">
        {message ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: space.sm,
              maxWidth: 560,
              minHeight: size.touch,
              paddingLeft: space.md,
              paddingRight: actionLabel ? space.xxs : space.md,
              paddingVertical: space.xxs,
              borderRadius: radius.md,
              backgroundColor: t.strong,
              shadowColor: t.shadow,
              shadowOpacity: 0.16,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Txt variant="secondary" tone="inverse" style={{ flexShrink: 1 }}>
              {message}
            </Txt>
            {actionLabel && onAction ? (
              <ToastAction label={actionLabel} onPress={onAction} />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ToastAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { t } = useUI();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: size.touch,
        minWidth: size.touch,
        paddingHorizontal: space.sm,
        justifyContent: "center",
        borderRadius: radius.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Txt
        variant="secondary"
        weight="700"
        tone="inverse"
        style={{ textDecorationLine: "underline", color: t.onStrong }}
      >
        {label}
      </Txt>
    </Pressable>
  );
}
