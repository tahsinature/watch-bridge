import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ActionEditor } from "./ActionEditor";
import { actionIcon } from "@/lib/icons";
import { useActions } from "@/stores/actions";
import { toast } from "@/stores/toast";
import type { ActionDef } from "@/types";

type EditTarget = ActionDef | "new" | null;

export function ActionsSettings() {
  const { actions, addAction, updateAction, removeAction, moveAction, resetToDefaults } =
    useActions();
  const [editing, setEditing] = useState<EditTarget>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (editing) {
    return (
      <ActionEditor
        initial={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSave={(action) => {
          if (editing === "new") addAction(action);
          else updateAction(action.id, action);
          setEditing(null);
          toast("Action saved", "success");
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Buttons shown on each title. Drag order with the arrows.
        </p>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="max-h-[46vh] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {actions.map((action, index) => (
          <ActionRow
            key={action.id}
            action={action}
            isFirst={index === 0}
            isLast={index === actions.length - 1}
            onToggle={(v) => updateAction(action.id, { enabled: v })}
            onEdit={() => setEditing(action)}
            onDelete={() => removeAction(action.id)}
            onMove={(dir) => moveAction(action.id, dir)}
          />
        ))}
      </div>

      {/* Backing these up lives in General → Backup & restore, with the rest. */}
      <div className="flex border-t border-border pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setConfirmReset(true)}
        >
          <RotateCcw className="h-4 w-4" />
          Reset to defaults
        </Button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset actions to defaults?"
        description="This replaces your current action list. Export first if you want a backup."
        confirmLabel="Reset"
        destructive
        onConfirm={() => {
          resetToDefaults();
          toast("Actions reset to defaults");
        }}
        onOpenChange={setConfirmReset}
      />
    </div>
  );
}

interface ActionRowProps {
  action: ActionDef;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (value: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}

function ActionRow({
  action,
  isFirst,
  isLast,
  onToggle,
  onEdit,
  onDelete,
  onMove,
}: ActionRowProps) {
  const Icon = actionIcon(action.icon);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2.5">
      <div className="flex flex-col">
        <button
          disabled={isFirst}
          onClick={() => onMove(-1)}
          className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-25"
          aria-label="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          disabled={isLast}
          onClick={() => onMove(1)}
          className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-25"
          aria-label="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-background text-primary">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{action.name}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="shrink-0 whitespace-nowrap px-1.5 py-0 text-[10px]"
          >
            {action.type}
          </Badge>
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {action.template}
          </span>
        </div>
      </div>

      <Switch checked={action.enabled} onCheckedChange={onToggle} />
      <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label="Delete"
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
