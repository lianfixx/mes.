import React, { forwardRef, useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { radius, size, space } from "../tokens";
import { IconButton } from "./controls";
import { useUI } from "./theme";
import { Txt } from "./Txt";

export function Divider({ spacing = 0 }: { spacing?: number }) {
  const { t } = useUI();
  return (
    <View
      style={{ height: 1, backgroundColor: t.divider, marginVertical: spacing }}
    />
  );
}

/** Encabezado de sección: etiqueta breve en minúsculas, accesorio a la derecha. */
export function SectionHeader({
  title,
  detail,
  right,
  level = "meta",
}: {
  title: string;
  detail?: string;
  right?: React.ReactNode;
  level?: "meta" | "heading";
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: space.xs,
        minHeight: level === "heading" ? size.touch : undefined,
      }}
    >
      <View style={{ flexShrink: 1, minWidth: 0 }}>
        <Txt
          accessibilityRole="header"
          variant={level === "heading" ? "heading" : "meta"}
          weight={level === "heading" ? "600" : "500"}
          tone={level === "heading" ? "primary" : "muted"}
        >
          {title}
        </Txt>
        {detail ? (
          <Txt variant="meta" tone="muted">
            {detail}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  );
}

/** Fila de dato clave → valor, para detalles y conciliaciones. */
export function KeyValue({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: space.sm,
        paddingVertical: space.xs,
      }}
    >
      <Txt variant="secondary" tone="muted" style={{ flexShrink: 1 }}>
        {label}
      </Txt>
      {typeof value === "string" ? (
        <Txt variant="secondary" weight={strong ? "600" : "400"} align="right">
          {value}
        </Txt>
      ) : (
        value
      )}
    </View>
  );
}

/** Hoja (móvil, anclada abajo) o diálogo (escritorio). Usa la Modal de React
 * Native: en web, react-native-web aporta rol dialog, Escape, trampa de foco y
 * retorno al activador. Aquí se añade: nombre accesible = título, título
 * enfocable como foco inicial, fondo no enfocable y zona de acción fija que
 * sube con el teclado. */
export const Sheet = forwardRef<
  ScrollView,
  {
    visible: boolean;
    title: string;
    subtitle?: string;
    onClose: () => void;
    footer?: React.ReactNode;
    children: React.ReactNode;
  }
>(function Sheet(
  { visible, title, subtitle, onClose, footer, children },
  scrollRef,
) {
  const { t, desktop, narrow, height, reduceMotion } = useUI();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      accessibilityLabel={title}
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{
          flex: 1,
          backgroundColor: t.scrim,
          justifyContent: desktop ? "center" : "flex-end",
          alignItems: "center",
        }}
      >
        <View
          // Fondo táctil sin rol ni foco: el cierre accesible es «Cerrar»,
          // Escape en web y el gesto de escape en iOS.
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onStartShouldSetResponder={() => true}
          onResponderRelease={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            width: "100%",
            maxWidth: desktop ? 540 : 640,
            maxHeight: height * (desktop ? 0.92 : 0.95),
            paddingHorizontal: desktop ? space.lg : 0,
          }}
        >
          <View
            accessibilityViewIsModal
            onAccessibilityEscape={onClose}
            style={{
              backgroundColor: t.raised,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              borderBottomLeftRadius: desktop ? radius.lg : 0,
              borderBottomRightRadius: desktop ? radius.lg : 0,
              overflow: "hidden",
              maxHeight: "100%",
              borderWidth: t.raised === t.bg ? 0 : 1,
              borderColor: t.divider,
            }}
          >
            <SheetHeader
              title={title}
              subtitle={subtitle}
              onClose={onClose}
              visible={visible}
            />
            <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: narrow ? space.md : space.lg,
                paddingBottom: space.xl,
                gap: space.lg,
              }}
            >
              {children}
            </ScrollView>
            {footer ? (
              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: t.divider,
                  paddingHorizontal: narrow ? space.md : space.lg,
                  paddingTop: space.sm,
                  paddingBottom: space.sm + (desktop ? 0 : insets.bottom),
                  gap: space.xs,
                }}
              >
                {footer}
              </View>
            ) : (
              <View style={{ height: desktop ? 0 : insets.bottom }} />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

function SheetHeader({
  title,
  subtitle,
  onClose,
  visible,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  visible: boolean;
}) {
  const { t, narrow } = useUI();
  const titleRef = useRef<View>(null);
  // En web, el título es el primer elemento enfocable (tabIndex -1): la trampa
  // de foco de react-native-web lo elige como foco inicial y el lector anuncia
  // el nombre de la hoja. Si un campo ya tomó el foco (autoFocus), se respeta.
  useEffect(() => {
    if (Platform.OS !== "web" || !visible) return;
    const id = setTimeout(() => {
      const active = document.activeElement as HTMLElement | null;
      const node = titleRef.current as unknown as HTMLElement | null;
      if (
        node &&
        !(
          active &&
          (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
        )
      )
        node.focus?.();
    }, 60);
    return () => clearTimeout(id);
  }, [title, visible]);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        paddingLeft: narrow ? space.md : space.lg,
        paddingRight: space.xs,
        paddingVertical: space.xs,
        borderBottomWidth: 1,
        borderColor: t.divider,
      }}
    >
      <View
        ref={titleRef}
        tabIndex={-1}
        style={{ flex: 1, minWidth: 0, paddingVertical: space.xxs }}
      >
        <Txt accessibilityRole="header" variant="heading" weight="600">
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="meta" tone="muted">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      <IconButton label="Cerrar" icon="close" onPress={onClose} />
    </View>
  );
}
