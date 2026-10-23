// Mes 0.1.3 · estructura de la interfaz. Estado y comandos: src/app/useMesApp.ts.
// Pantallas: src/ui/screens. Hojas: src/ui/sheets. Tokens: src/ui/tokens.ts.
import React, { useEffect, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { changeMonth } from "./src/domain/model";
import { AppContext, useApp } from "./src/app/context";
import { Tab, useMesApp } from "./src/app/useMesApp";
import {
  Button,
  IconButton,
  Toast,
  Txt,
  UI,
  UIContext,
  useUI,
} from "./src/ui/components";
import { monthName } from "./src/ui/format";
import { Icon, IconName } from "./src/ui/icons";
import { SheetHost } from "./src/ui/SheetHost";
import { CurrencyPicker } from "./src/ui/sheets/shared";
import { MesScreen } from "./src/ui/screens/MesScreen";
import { RecurrentesScreen } from "./src/ui/screens/RecurrentesScreen";
import { MovimientosScreen } from "./src/ui/screens/MovimientosScreen";
import {
  Theme,
  breakpoints,
  radius,
  size,
  space,
  themes,
} from "./src/ui/tokens";

const tabs: { name: Tab; icon: IconName }[] = [
  { name: "Mes", icon: "calendar" },
  { name: "Recurrentes", icon: "repeat" },
  { name: "Movimientos", icon: "list" },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const { width, height, fontScale } = useWindowDimensions();
  // La escala de texto participa en el ancho efectivo: texto ampliado en una
  // ventana ancha no fuerza columnas ilegibles.
  const effective = width / Math.max(1, fontScale);
  const desktop = effective >= breakpoints.desktop;
  const app = useMesApp({ desktop });
  const t = app.dark ? themes.dark : themes.light;
  const ui: UI = {
    t,
    dark: app.dark,
    reduceMotion: app.reduceMotion,
    width: effective,
    height,
    narrow: effective < breakpoints.narrow,
    tablet: effective >= breakpoints.tablet,
    desktop,
    wide: effective >= breakpoints.wide,
  };
  useWebDocument(t, app.dark);
  return (
    <AppContext.Provider value={app}>
      <UIContext.Provider value={ui}>
        <Shell />
      </UIContext.Provider>
    </AppContext.Provider>
  );
}

/** Web: colores del documento, foco visible por tema y color de la barra. */
function useWebDocument(t: Theme, dark: boolean) {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const root = document.documentElement;
    root.style.setProperty("--mes-focus", t.focus);
    root.style.setProperty("--mes-bg", t.bg);
    root.style.setProperty("--mes-ink", t.ink);
    root.style.setProperty("--mes-thumb", t.control);
    root.style.colorScheme = dark ? "dark" : "light";
    document.body.style.backgroundColor = t.bg;
    document.body.style.color = t.ink;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", t.bg);
  }, [t, dark]);
}

function Shell() {
  const app = useApp();
  const { t, desktop, wide, narrow } = useUI();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [app.tab]);
  const screen =
    app.tab === "Mes" ? (
      <MesScreen />
    ) : app.tab === "Recurrentes" ? (
      <RecurrentesScreen />
    ) : (
      <MovimientosScreen />
    );
  const bottomChrome = desktop ? 0 : 64 + 56 + insets.bottom;
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        backgroundColor: t.bg,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <StatusBar style={app.dark ? "light" : "dark"} />
      {desktop && <Sidebar />}
      <View style={{ flex: 1, minWidth: 0 }}>
        {!desktop && <TopBar />}
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: desktop ? 40 : space.md,
            paddingTop: desktop ? space.xl : narrow ? space.xs : space.md,
            paddingBottom: desktop ? 120 + insets.bottom : space.xl,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: desktop ? (wide ? size.content : 760) : 680,
              alignSelf: "center",
              gap: narrow ? space.md : space.lg,
            }}
          >
            <View style={{ gap: narrow ? space.xxs : space.xs }}>
              <ScreenHeader />
              <ContextStrip />
            </View>
            {screen}
            <Txt
              variant="caption"
              tone="muted"
              style={{ paddingTop: space.lg }}
            >
              mes. por Sistemas Digitales · prueba local · v0.1.3
            </Txt>
          </View>
        </ScrollView>
        {!desktop && <ActionBar />}
        {!desktop && <TabBar />}
        {desktop && (
          <View
            style={{
              position: "absolute",
              right: 40,
              bottom: space.xl + insets.bottom,
              borderRadius: radius.pill,
              backgroundColor: t.strong,
              shadowColor: t.shadow,
              shadowOpacity: 0.18,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }}
          >
            <Button
              testID="add-expense"
              icon="plus"
              label="Registrar gasto"
              onPress={app.newEntry}
            />
          </View>
        )}
        <Toast
          message={app.toast.message}
          actionLabel={app.toast.undo && app.canUndo ? "Deshacer" : undefined}
          onAction={app.undo}
          bottom={desktop ? 112 + insets.bottom : bottomChrome + space.sm}
          left={space.md}
          right={desktop ? 220 : space.md}
        />
      </View>
      <SheetHost />
    </View>
  );
}

function Brand({ large }: { large?: boolean }) {
  return (
    <Txt
      variant={large ? "titleWide" : "heading"}
      weight="700"
      style={{
        letterSpacing: large ? -1.6 : -0.8,
        fontSize: large ? 38 : 24,
        lineHeight: large ? 42 : 28,
      }}
    >
      mes.
    </Txt>
  );
}

function TopBar() {
  const app = useApp();
  const { t, narrow } = useUI();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        minHeight: 56,
        paddingLeft: space.md,
        paddingRight: space.xxs,
        paddingVertical: space.xxs,
        borderBottomWidth: 1,
        borderColor: t.divider,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Brand />
        <Txt variant="meta" tone="muted">
          {narrow
            ? "Prueba · se borra al recargar"
            : "Prueba · tus cambios se borran al recargar"}
        </Txt>
      </View>
      <IconButton
        icon="more"
        label="Ajustes de la prueba"
        onPress={() => app.open("settings")}
      />
    </View>
  );
}

function Sidebar() {
  const app = useApp();
  const { t } = useUI();
  return (
    <View
      style={{
        width: size.sidebar,
        borderRightWidth: 1,
        borderColor: t.divider,
        paddingHorizontal: space.lg,
        paddingVertical: space.xl,
        gap: space.xl,
      }}
    >
      <View style={{ gap: space.xxs }}>
        <Brand large />
        <Txt variant="meta" tone="muted">
          por Sistemas Digitales
        </Txt>
      </View>
      <View accessibilityRole="tablist" style={{ gap: space.xxs }}>
        {tabs.map((tab) => (
          <NavItem key={tab.name} {...tab} vertical />
        ))}
      </View>
      <View style={{ marginTop: "auto", gap: space.sm }}>
        <View
          style={{
            padding: space.sm,
            borderRadius: radius.md,
            backgroundColor: t.surface,
            gap: 2,
          }}
        >
          <Txt variant="meta" weight="600">
            Prueba con datos ficticios
          </Txt>
          <Txt variant="meta" tone="muted">
            Tus cambios se borran al recargar.
          </Txt>
        </View>
        <Button
          variant="quiet"
          align="flex-start"
          label="Ajustes de la prueba"
          onPress={() => app.open("settings")}
        />
        <Txt variant="caption" tone="muted">
          Versión 0.1.3
        </Txt>
      </View>
    </View>
  );
}

function NavItem({
  name,
  icon,
  vertical,
}: {
  name: Tab;
  icon: IconName;
  vertical?: boolean;
}) {
  const app = useApp();
  const { t } = useUI();
  const selected = app.tab === name;
  return (
    <Pressable
      accessibilityRole="tab"
      aria-selected={selected}
      accessibilityLabel={name}
      onPress={() => app.navigate(name)}
      style={({ pressed }) =>
        vertical
          ? {
              flexDirection: "row",
              alignItems: "center",
              gap: space.sm,
              minHeight: size.touch,
              paddingHorizontal: space.sm,
              borderRadius: radius.md,
              backgroundColor: selected || pressed ? t.surface : "transparent",
            }
          : {
              flex: 1,
              minHeight: 56,
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              borderTopWidth: 2,
              borderColor: selected ? t.ink : "transparent",
              backgroundColor: pressed ? t.surface : "transparent",
            }
      }
    >
      <Icon
        name={icon}
        size={size.icon + (vertical ? 0 : 2)}
        color={selected ? t.ink : t.muted}
      />
      <Txt
        variant={vertical ? "bodySm" : "meta"}
        weight={selected ? "600" : "400"}
        tone={selected ? "primary" : "muted"}
      >
        {name}
      </Txt>
    </Pressable>
  );
}

function TabBar() {
  const { t } = useUI();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        borderTopWidth: 1,
        borderColor: t.divider,
        backgroundColor: t.bg,
        paddingBottom: insets.bottom,
      }}
    >
      {tabs.map((tab) => (
        <NavItem key={tab.name} {...tab} />
      ))}
    </View>
  );
}

/** Pie de acción móvil: fuera del contenido desplazable y encima de la
 * navegación, para no tapar filas. Un único acceso primario. */
function ActionBar() {
  const app = useApp();
  const { t } = useUI();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        minHeight: 64,
        alignItems: "center",
        paddingHorizontal: space.md,
        borderTopWidth: 1,
        borderColor: t.divider,
        backgroundColor: t.bg,
      }}
    >
      <Button
        testID="add-expense"
        icon="plus"
        label="Registrar gasto"
        onPress={app.newEntry}
      />
    </View>
  );
}

function ScreenHeader() {
  const app = useApp();
  const { desktop } = useUI();
  const current = app.today.slice(0, 7);
  const periodic = app.tab !== "Recurrentes";
  const prev = changeMonth(app.month, -1);
  const next = changeMonth(app.month, 1);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: space.xs,
      }}
    >
      <View style={{ flex: 1, minWidth: 150 }}>
        <Txt
          accessibilityRole="header"
          variant={desktop ? "titleWide" : "title"}
          weight="600"
          style={{ letterSpacing: desktop ? -1 : -0.6 }}
        >
          {app.tab === "Mes" ? monthName(app.month) : app.tab}
          {app.tab === "Mes" ? (
            <Txt variant="secondary" tone="muted" weight="400">
              {"  "}
              {app.month.slice(0, 4)}
            </Txt>
          ) : null}
        </Txt>
        {app.tab === "Movimientos" ? (
          <Txt variant="secondary" tone="muted">
            {monthName(app.month)} {app.month.slice(0, 4)}
          </Txt>
        ) : null}
      </View>
      {periodic ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {app.month !== current && (
            <Button
              variant="quiet"
              label="Hoy"
              accessibilityLabel={`Volver a ${monthName(current)}`}
              onPress={() => app.setMonth(current)}
            />
          )}
          <IconButton
            icon="chevronLeft"
            label={`Mes anterior: ${monthName(prev)} ${prev.slice(0, 4)}`}
            onPress={() => app.setMonth(prev)}
          />
          <IconButton
            icon="chevronRight"
            label={`Mes siguiente: ${monthName(next)} ${next.slice(0, 4)}`}
            onPress={() => app.setMonth(next)}
          />
        </View>
      ) : (
        <Button
          variant="secondary"
          compact
          icon="plus"
          label="Agregar"
          accessibilityLabel="Agregar recurrente"
          onPress={app.newRecurring}
        />
      )}
    </View>
  );
}

function ContextStrip() {
  const app = useApp();
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        columnGap: space.md,
      }}
    >
      <Button
        variant="plain"
        compact
        label={app.spaceName}
        iconRight="chevronDown"
        accessibilityLabel={`Espacio: ${app.spaceName}. Cambiar espacio`}
        onPress={() => app.open("spaces")}
      />
      <CurrencyPicker
        value={app.currency}
        onChange={app.setCurrency}
        label="Moneda de la vista"
        plain
      />
      {app.otherCurrencies.length > 0 && (
        <Txt
          variant="meta"
          tone="muted"
          accessibilityLabel={`También hay registros en ${app.otherCurrencies.join(" y ")}; se ven por separado y no se suman.`}
        >
          También hay {app.otherCurrencies.join(" y ")}
        </Txt>
      )}
    </View>
  );
}
