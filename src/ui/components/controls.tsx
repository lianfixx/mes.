import React, { forwardRef } from "react";
import { Pressable, View } from "react-native";
import { Icon, IconName } from "../icons";
import { radius, size, space } from "../tokens";
import { useUI } from "./theme";
import { Txt } from "./Txt";

/** primary: relleno · secondary: contorno · quiet: enlace subrayado ·
 * plain: texto sin contorno para selectores de contexto y revelados. */
type Variant = "primary" | "secondary" | "quiet" | "plain";

/** Botón con objetivo táctil mínimo de 48. «quiet» es para acciones de texto
 * (ver más, cambiar) sin contorno; el foco visible lo da el anillo global. */
export const Button = forwardRef<
  View,
  {
    label: string;
    onPress: () => void;
    variant?: Variant;
    icon?: IconName;
    iconRight?: IconName;
    disabled?: boolean;
    compact?: boolean;
    fullWidth?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    expanded?: boolean;
    testID?: string;
    align?: "center" | "flex-start";
  }
>(function Button(
  {
    label,
    onPress,
    variant = "primary",
    icon,
    iconRight,
    disabled = false,
    compact = false,
    fullWidth = false,
    accessibilityLabel,
    accessibilityHint,
    expanded,
    testID,
    align = "center",
  },
  ref,
) {
  const { t } = useUI();
  const fg = variant === "primary" ? t.onStrong : t.ink;
  return (
    <Pressable
      ref={ref}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      aria-disabled={disabled}
      aria-expanded={expanded}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: size.touch,
        minWidth: size.touch,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: align,
        gap: space.xs,
        alignSelf: fullWidth ? "stretch" : "flex-start",
        maxWidth: "100%",
        flexShrink: 1,
        paddingHorizontal:
          variant === "quiet" || variant === "plain"
            ? space.xxs
            : compact
              ? space.md
              : 20,
        paddingVertical: space.xs,
        borderRadius: radius.pill,
        borderWidth: variant === "quiet" || variant === "plain" ? 0 : 1,
        borderColor: variant === "primary" ? t.strong : t.control,
        backgroundColor:
          variant === "primary"
            ? t.strong
            : pressed
              ? t.surface
              : "transparent",
        opacity: disabled ? 0.4 : pressed && variant === "primary" ? 0.78 : 1,
      })}
    >
      {icon && <Icon name={icon} size={size.iconSm + 2} color={fg} />}
      <Txt
        variant="bodySm"
        weight="600"
        align={align === "center" ? "center" : "left"}
        style={{
          color: fg,
          textDecorationLine: variant === "quiet" ? "underline" : "none",
        }}
      >
        {label}
      </Txt>
      {iconRight && <Icon name={iconRight} size={size.iconSm} color={fg} />}
    </Pressable>
  );
});

export const IconButton = forwardRef<
  View,
  {
    label: string;
    icon: IconName;
    onPress: () => void;
    bordered?: boolean;
    disabled?: boolean;
    testID?: string;
  }
>(function IconButton(
  { label, icon, onPress, bordered, disabled, testID },
  ref,
) {
  const { t } = useUI();
  return (
    <Pressable
      ref={ref}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-disabled={!!disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size.touch,
        height: size.touch,
        flexShrink: 0,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: bordered ? 1 : 0,
        borderColor: t.control,
        backgroundColor: pressed ? t.surface : "transparent",
        opacity: disabled ? 0.35 : 1,
      })}
    >
      <Icon name={icon} size={size.icon + 2} color={t.ink} />
    </Pressable>
  );
});

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  detail?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/** Selección única: rol radio dentro de un grupo con nombre. El seleccionado
 * cambia de forma (relleno) y de estado accesible, no solo de color. */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  refFor,
}: {
  label: string;
  options: ChipOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  refFor?: (value: T) => React.Ref<View> | undefined;
}) {
  const { t } = useUI();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            ref={refFor?.(o.value)}
            accessibilityRole="radio"
            accessibilityLabel={o.accessibilityLabel}
            aria-checked={selected}
            aria-disabled={!!o.disabled}
            disabled={o.disabled}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => ({
              minHeight: size.touch,
              minWidth: size.touch,
              maxWidth: "100%",
              flexShrink: 1,
              justifyContent: "center",
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: o.detail ? radius.md : radius.pill,
              borderWidth: 1,
              borderColor: selected ? t.strong : t.control,
              backgroundColor: selected
                ? t.strong
                : pressed
                  ? t.surface
                  : "transparent",
              opacity: o.disabled ? 0.4 : 1,
            })}
          >
            <Txt
              variant="secondary"
              weight={selected ? "600" : "400"}
              align="center"
              tone={selected ? "inverse" : "primary"}
            >
              {o.label}
            </Txt>
            {o.detail ? (
              <Txt
                variant="meta"
                align="center"
                tone={selected ? "inverse" : "muted"}
              >
                {o.detail}
              </Txt>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export const Checkbox = forwardRef<
  View,
  {
    label: string;
    help?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }
>(function Checkbox({ label, help, checked, onChange }, ref) {
  const { t } = useUI();
  return (
    <Pressable
      ref={ref}
      accessibilityRole="checkbox"
      aria-checked={checked}
      accessibilityLabel={help ? `${label}. ${help}` : label}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: space.sm,
        minHeight: size.touch,
        paddingVertical: space.sm,
        paddingHorizontal: space.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: checked ? t.strong : t.control,
        backgroundColor: pressed ? t.surface : "transparent",
      })}
    >
      <View
        style={{
          width: 22,
          height: 22,
          marginTop: 1,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: checked ? t.strong : t.control,
          backgroundColor: checked ? t.strong : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && (
          <Icon name="check" size={16} color={t.onStrong} strokeWidth={2.4} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Txt variant="secondary" weight="500">
          {label}
        </Txt>
        {help ? (
          <Txt variant="meta" tone="muted">
            {help}
          </Txt>
        ) : null}
      </View>
    </Pressable>
  );
});

/** Opción de alcance con su consecuencia escrita. Deshabilitada, conserva el
 * motivo legible para que la persona sepa qué cambiar. */
export const RadioCard = forwardRef<
  View,
  {
    title: string;
    description: string;
    selected: boolean;
    onPress: () => void;
    disabledReason?: string;
  }
>(function RadioCard(
  { title, description, selected, onPress, disabledReason },
  ref,
) {
  const { t } = useUI();
  const disabled = !!disabledReason;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      accessibilityLabel={`${title}. ${disabledReason ?? description}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: space.sm,
        padding: space.md,
        minHeight: size.touch,
        borderRadius: radius.md,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? t.strong : t.control,
        backgroundColor: pressed ? t.surface : "transparent",
      })}
    >
      <View
        style={{
          width: 20,
          height: 20,
          marginTop: 2,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: disabled ? t.divider : selected ? t.strong : t.control,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: t.strong,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
        <Txt
          variant="secondary"
          weight="600"
          tone={disabled ? "muted" : "primary"}
        >
          {title}
        </Txt>
        <Txt variant="meta" tone="muted">
          {disabledReason ?? description}
        </Txt>
      </View>
    </Pressable>
  );
});

/** Interruptor: toda la fila es el objetivo táctil (≥48) con rol switch. La
 * pista se dibuja con tokens para conservar contraste en ambos temas. */
export function SwitchRow({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useUI();
  return (
    <Pressable
      accessibilityRole="switch"
      aria-checked={value}
      accessibilityLabel={help ? `${label}. ${help}` : label}
      onPress={() => onChange(!value)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        minHeight: size.touch,
        paddingVertical: space.xxs,
        borderRadius: radius.md,
        backgroundColor: pressed ? t.surface : "transparent",
      })}
    >
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Txt variant="secondary" weight="500">
          {label}
        </Txt>
        {help ? (
          <Txt variant="meta" tone="muted">
            {help}
          </Txt>
        ) : null}
      </View>
      <View
        style={{
          width: 46,
          height: 28,
          borderRadius: 14,
          padding: 3,
          borderWidth: 1.5,
          borderColor: value ? t.strong : t.control,
          backgroundColor: value ? t.strong : "transparent",
          alignItems: value ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            width: 19,
            height: 19,
            borderRadius: 10,
            backgroundColor: value ? t.onStrong : t.control,
          }}
        />
      </View>
    </Pressable>
  );
}

/** Botón de revelado progresivo con estado expandido. */
export function Disclosure({
  label,
  expanded,
  onToggle,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="quiet"
      label={label}
      iconRight={expanded ? "chevronUp" : "chevronDown"}
      expanded={expanded}
      onPress={onToggle}
      align="flex-start"
    />
  );
}
