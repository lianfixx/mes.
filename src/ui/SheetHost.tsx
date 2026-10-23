// Una sola hoja (Modal) cuyo contenido cambia: pasar de Detalle a Pago no cierra
// ni reabre el diálogo, y el foco vuelve al activador original al cerrar.
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { inRange } from "../domain/model";
import { useApp } from "../app/context";
import type { SheetName } from "../app/useMesApp";
import {
  Button,
  ErrorSummary,
  Notice,
  Sheet,
  focusElement,
} from "./components";
import { EntryBody, EntryFooter, entrySheetTitle } from "./sheets/EntrySheet";
import {
  RecurringBody,
  RecurringFooter,
  recurringSheetTitle,
} from "./sheets/RecurringSheet";
import { PaymentBody, PaymentFooter } from "./sheets/PaymentSheet";
import { DetailBody, DetailFooter } from "./sheets/DetailSheet";
import {
  BudgetBody,
  GoalBody,
  SettingsBody,
  SpacesBody,
} from "./sheets/SmallSheets";

function DiscardNotice() {
  const app = useApp();
  const keep = useRef<View>(null);
  useEffect(() => {
    const id = setTimeout(() => focusElement(keep.current), 60);
    return () => clearTimeout(id);
  }, []);
  return (
    <Notice
      icon="alert"
      title="Tienes cambios sin guardar."
      actions={
        <>
          <Button
            ref={keep}
            compact
            label="Seguir editando"
            onPress={() => app.setConfirm(null)}
          />
          <Button
            compact
            variant="secondary"
            label="Descartar y cerrar"
            onPress={app.finish}
          />
        </>
      }
    >
      Si cierras ahora, no se guardará nada de este formulario.
    </Notice>
  );
}

export function SheetHost() {
  const app = useApp();
  const last = useRef<Exclude<SheetName, null>>("settings");
  if (app.sheet) last.current = app.sheet;
  const s = last.current;
  const cur = app.currentRec;
  const title = {
    entry: entrySheetTitle(app),
    recurring: recurringSheetTitle(app),
    payment: "Registrar pago",
    detail: cur?.name ?? "Detalle",
    budget: "Presupuesto de gastos",
    goal: "Tu meta",
    spaces: "Espacios",
    settings: "Ajustes de la prueba",
  }[s];
  const subtitle = {
    entry: `En ${app.spaceName} · ${app.entryForm.currency}`,
    recurring: `En ${app.spaceName} · ${app.recForm.currency}`,
    payment: `En ${app.spaceName} · ${cur?.currency ?? ""}`,
    detail: `${app.spaceName} · ${cur?.currency ?? ""}`,
    budget: `${app.spaceName} · ${app.currency}`,
    goal: `${app.spaceName} · meta en ${app.goal.currency}`,
    spaces: "Dónde ver y registrar",
    settings: "Versión 0.1.3 · datos ficticios",
  }[s];
  const footer =
    s === "entry" ? (
      <EntryFooter />
    ) : s === "recurring" ? (
      <RecurringFooter />
    ) : s === "payment" ? (
      <PaymentFooter />
    ) : s === "detail" && cur && inRange(cur, cur.nextDate) ? (
      <DetailFooter />
    ) : s === "budget" ? (
      <Button
        testID="save-budget"
        fullWidth
        label="Guardar límite"
        onPress={app.saveBudget}
      />
    ) : s === "goal" ? (
      <Button
        testID="save-goal"
        fullWidth
        label={app.contribution.trim() ? "Registrar aporte" : "Guardar meta"}
        onPress={app.saveGoal}
      />
    ) : undefined;
  const body = {
    entry: <EntryBody />,
    recurring: <RecurringBody />,
    payment: <PaymentBody />,
    detail: <DetailBody />,
    budget: <BudgetBody />,
    goal: <GoalBody />,
    spaces: <SpacesBody />,
    settings: <SettingsBody />,
  }[s];
  return (
    <Sheet
      ref={app.sheetScroll}
      visible={app.sheet !== null}
      title={title}
      subtitle={subtitle}
      onClose={app.close}
      footer={footer}
    >
      {app.confirm === "discard" && <DiscardNotice />}
      {app.error && <ErrorSummary message={app.error.message} />}
      {body}
    </Sheet>
  );
}
