import React from "react";
import { Pressable, View } from "react-native";
import { SpaceId } from "../../domain/model";
import { useApp } from "../../app/context";
import { ThemeMode, spaceLabel } from "../../app/useMesApp";
import {
  Button,
  ChipGroup,
  Disclosure,
  Divider,
  Field,
  KeyValue,
  MoneyText,
  Notice,
  SectionHeader,
  Txt,
  useUI,
} from "../components";
import { formatMoney } from "../format";
import { Icon } from "../icons";
import { radius, size, space } from "../tokens";
import { useFieldError, useFieldRefs } from "./shared";

export function BudgetBody() {
  const app = useApp();
  const reg = useFieldRefs();
  const fe = useFieldError();
  return (
    <>
      <Txt variant="secondary" tone="muted">
        Límite mensual para tu gasto neto en {app.currency}. Déjalo vacío para
        observar sin límite.
      </Txt>
      <Field
        ref={reg("amount")}
        id="budget-amount"
        label={`Límite mensual (${app.currency})`}
        value={app.budgetAmount}
        onChangeText={app.setBudgetAmount}
        number
        placeholder="Sin límite"
        error={fe("amount")}
        help="No es tu saldo bancario. Las cuotas de deuda se muestran aparte."
      />
      <Notice>
        Por ahora el límite se aplica a todos los meses: Mes aún no guarda un
        límite distinto por mes.
      </Notice>
      {app.budget.amount !== null && (
        <Button
          variant="secondary"
          compact
          label="Quitar límite"
          onPress={app.clearBudget}
        />
      )}
    </>
  );
}

export function GoalBody() {
  const app = useApp();
  const { goal } = app;
  const reg = useFieldRefs((field) => {
    if (field !== "contribution") app.setGoalDetails(true);
  });
  const fe = useFieldError();
  return (
    <>
      <KeyValue
        label={`Aportado a «${goal.name}»`}
        value={
          <Txt variant="secondary" weight="600">
            {formatMoney(goal.saved, goal.currency)} de{" "}
            {formatMoney(goal.target, goal.currency)}
          </Txt>
        }
      />
      <Field
        ref={reg("contribution")}
        id="goal-contribution"
        label={`Aporte que ya apartaste (${goal.currency})`}
        value={app.contribution}
        onChangeText={app.setContribution}
        number
        placeholder="0.00"
        error={fe("contribution")}
        help="Se suma a lo aportado. Mes no mueve ni comprueba dinero; gastar menos no cuenta como ahorro."
      />
      <Disclosure
        label="Editar nombre, objetivo o total aportado"
        expanded={app.goalDetails}
        onToggle={() => app.setGoalDetails(!app.goalDetails)}
      />
      {app.goalDetails && (
        <>
          <Field
            ref={reg("name")}
            id="goal-name"
            label="Nombre de la meta"
            value={app.goalName}
            onChangeText={app.setGoalName}
            error={fe("name")}
          />
          <Field
            ref={reg("target")}
            id="goal-target"
            label={`Objetivo (${goal.currency})`}
            value={app.goalTarget}
            onChangeText={app.setGoalTarget}
            number
            error={fe("target")}
          />
          <Field
            ref={reg("saved")}
            id="goal-saved"
            label={`Total aportado (${goal.currency})`}
            value={app.goalSaved}
            onChangeText={app.setGoalSaved}
            number
            error={fe("saved")}
            help="Corrige el total si registraste algo de más. Cero es válido."
          />
        </>
      )}
    </>
  );
}

export function SpacesBody() {
  const app = useApp();
  const { t } = useUI();
  const copy: Record<SpaceId, string> = {
    personal: "Solo tú en esta prueba.",
    shared: "Tú y Alex · datos ficticios. No es colaboración real.",
  };
  return (
    <>
      <Txt variant="secondary" tone="muted">
        Cada espacio tiene sus propios movimientos, pagos, presupuestos y meta.
      </Txt>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Espacio"
        style={{ gap: space.xs }}
      >
        {(["personal", "shared"] as SpaceId[]).map((s) => {
          const selected = s === app.space;
          return (
            <Pressable
              key={s}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${spaceLabel[s]}. ${copy[s]}`}
              onPress={() => app.setSpace(s)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: space.sm,
                minHeight: size.touch,
                padding: space.md,
                borderRadius: radius.md,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? t.strong : t.control,
                backgroundColor: pressed ? t.surface : "transparent",
              })}
            >
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Txt variant="body" weight="600">
                  {spaceLabel[s]}
                </Txt>
                <Txt variant="meta" tone="muted">
                  {copy[s]}
                </Txt>
              </View>
              {selected ? (
                <Icon name="check" size={size.icon} color={t.ink} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <Txt variant="meta" tone="muted">
        Invitaciones, permisos y colaboración entre personas llegarán con
        cuentas reales en la primera beta. Un selector local no es seguridad.
      </Txt>
    </>
  );
}

export function SettingsBody() {
  const app = useApp();
  return (
    <>
      <Notice title="Prueba con datos ficticios">
        Los cambios viven en esta pestaña y se borran al recargar. Todavía no
        hay cuenta, respaldo ni sincronización; usa solo información de ejemplo.
      </Notice>
      <View style={{ gap: space.xs }}>
        <SectionHeader title="Apariencia" />
        <ChipGroup
          label="Apariencia"
          value={app.themeMode}
          onChange={(m: ThemeMode) => app.setThemeMode(m)}
          options={[
            { value: "system", label: "Según el sistema" },
            { value: "light", label: "Claro" },
            { value: "dark", label: "Oscuro" },
          ]}
        />
        <Txt variant="meta" tone="muted">
          {app.themeMode === "system"
            ? `Sigue al sistema (ahora ${app.dark ? "oscuro" : "claro"}). `
            : ""}
          La elección dura mientras esta pestaña esté abierta.
        </Txt>
      </View>
      <Divider />
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Datos de esta prueba" />
        <Button
          variant="secondary"
          compact
          icon="arrowRight"
          label="Exportar copia (JSON)"
          onPress={app.exportData}
        />
        <Txt variant="meta" tone="muted">
          Para revisar tus datos. Aún no existe un importador para recuperarlos.
        </Txt>
        {app.confirm === "reset" ? (
          <Notice
            icon="alert"
            title="¿Empezar en blanco?"
            actions={
              <>
                <Button
                  compact
                  label="Empezar en blanco"
                  onPress={app.resetBlank}
                />
                <Button
                  compact
                  variant="secondary"
                  label="Cancelar"
                  onPress={() => app.setConfirm(null)}
                />
              </>
            }
          >
            Se quitarán movimientos, recurrentes, presupuestos y metas de esta
            sesión. Podrás deshacerlo justo después.
          </Notice>
        ) : (
          <Button
            variant="secondary"
            compact
            label="Empezar en blanco"
            onPress={() => app.setConfirm("reset")}
          />
        )}
        {app.confirm === "restore" ? (
          <Notice
            icon="alert"
            title="¿Restaurar el ejemplo?"
            actions={
              <>
                <Button
                  compact
                  label="Restaurar ejemplo"
                  onPress={app.restoreDemo}
                />
                <Button
                  compact
                  variant="secondary"
                  label="Cancelar"
                  onPress={() => app.setConfirm(null)}
                />
              </>
            }
          >
            Se reemplazarán los datos de esta sesión por el ejemplo. Podrás
            deshacerlo justo después.
          </Notice>
        ) : (
          <Button
            variant="secondary"
            compact
            label="Restaurar ejemplo"
            onPress={() => app.setConfirm("restore")}
          />
        )}
      </View>
      <Divider />
      <View style={{ gap: space.xs }}>
        <SectionHeader title="Aún no disponible" />
        <Txt variant="secondary" tone="muted">
          Cuentas, colaboración real, respaldo, sincronización, recordatorios
          del teléfono y acceso biométrico.
        </Txt>
      </View>
      <Txt variant="caption" tone="muted">
        mes. es un nombre provisional · por Sistemas Digitales · v0.1.3 ·
        Español (México)
      </Txt>
    </>
  );
}
