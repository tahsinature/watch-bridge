import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LabeledRow } from "@/components/detail/LabeledRow";
import { actionIcon } from "@/lib/icons";
import { runAction } from "@/lib/runAction";
import { buildContext } from "@/lib/placeholders";
import { useActions } from "@/stores/actions";
import type { ActionDef, ActionGroup, TitleDetails } from "@/types";

const GROUP_ORDER: { key: ActionGroup; label: string }[] = [
  { key: "download", label: "Download" },
  { key: "search", label: "Search" },
  { key: "record", label: "Record" },
  { key: "custom", label: "Custom" },
];

/** Configurable actions, one labeled row per group. */
export function ActionBar({ details }: { details: TitleDetails }) {
  const actions = useActions((s) => s.actions);
  const ctx = useMemo(() => buildContext(details), [details]);
  const [pending, setPending] = useState<ActionDef | null>(null);

  const groups = GROUP_ORDER.map((group) => ({
    ...group,
    items: actions.filter((a) => a.enabled && a.group === group.key),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  const trigger = (action: ActionDef) => {
    if (action.confirm) setPending(action);
    else void runAction(action, ctx);
  };

  return (
    <>
      {groups.map((group) => (
        <LabeledRow key={group.key} label={group.label}>
          <div className="flex flex-wrap gap-2">
            {group.items.map((action) => {
              const Icon = actionIcon(action.icon);
              return (
                <Button
                  key={action.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => trigger(action)}
                >
                  <Icon className="size-4" />
                  {action.name}
                </Button>
              );
            })}
          </div>
        </LabeledRow>
      ))}

      <ConfirmDialog
        open={!!pending}
        title={`Run “${pending?.name}”?`}
        description={
          pending?.type === "http-request"
            ? "This sends a live network request to the endpoint you configured."
            : "This will launch an external action."
        }
        confirmLabel="Run"
        onConfirm={() => pending && void runAction(pending, ctx)}
        onOpenChange={(open) => !open && setPending(null)}
      />
    </>
  );
}
