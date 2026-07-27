import { useState } from "react";
import {
  DatabaseBackup,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { JsonExportDialog } from "@/components/ui/json-export-dialog";
import { JsonImportDialog } from "@/components/ui/json-import-dialog";
import { ActionsSettings } from "@/components/actions/ActionsSettings";
import { buildBackup, restoreBackup, BackupError } from "@/lib/backup";
import { todayStamp } from "@/lib/download";
import { useSettings } from "@/stores/settings";
import { toast } from "@/stores/toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Everything is stored locally in your browser. Nothing leaves your device.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-2 min-w-0">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-5 space-y-6">
            <ApiKeySection />
            <BackupSection />
          </TabsContent>

          <TabsContent value="actions" className="mt-5">
            <ActionsSettings />
          </TabsContent>
        </Tabs>

        <p
          className="text-center font-mono text-[11px] text-muted-foreground/70"
          aria-label={`WatchBridge version ${__APP_VERSION__}`}
        >
          WatchBridge v{__APP_VERSION__}
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ApiKeySection() {
  const apiKey = useSettings((s) => s.tmdbApiKey);
  const setApiKey = useSettings((s) => s.setTmdbApiKey);
  const [reveal, setReveal] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-primary" />
        <Label htmlFor="tmdb-key">TMDB API Key</Label>
      </div>

      <div className="relative">
        <Input
          id="tmdb-key"
          type={reveal ? "text" : "password"}
          value={apiKey}
          spellCheck={false}
          autoComplete="off"
          placeholder="Paste your TMDB API key (v3 auth) here"
          onChange={(e) => setApiKey(e.target.value)}
          className="pr-10 font-mono"
        />
        <button
          type="button"
          onClick={() => setReveal((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={reveal ? "Hide key" : "Show key"}
        >
          {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
        <p className="mb-2 font-medium text-foreground/90">How to get a free key</p>
        <ol className="ml-4 list-decimal space-y-1">
          <li>Create a free account at themoviedb.org.</li>
          <li>
            Open <span className="text-foreground/80">Settings → API</span> and request an
            API key (choose &ldquo;Developer&rdquo;).
          </li>
          <li>
            Copy the <span className="text-foreground/80">API Key (v3 auth)</span> value and
            paste it above.
          </li>
        </ol>
        <Button asChild variant="link" size="sm" className="mt-1 h-auto px-0">
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noreferrer"
          >
            Get your TMDB API key
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function BackupSection() {
  const [includeApiKey, setIncludeApiKey] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  /** Returning a message keeps the import dialog open with the reason shown. */
  const handleRestore = (data: unknown): string | void => {
    try {
      const summary = restoreBackup(data);
      const skipped = summary.skipped > 0 ? `, ${summary.skipped} skipped` : "";
      toast(
        `Restored ${summary.library} titles and ${summary.actions} actions${skipped}`,
        "success",
      );
    } catch (error) {
      return error instanceof BackupError ? error.message : "Restore failed";
    }
  };

  return (
    <div className="space-y-3 border-t border-border pt-5">
      <div className="flex items-center gap-2">
        <DatabaseBackup className="h-4 w-4 text-primary" />
        <Label>Backup &amp; restore</Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Everything lives in this browser only. Export to move your library,
        actions and preferences to another browser or device.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </div>

      <JsonExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title="Export everything"
        description="Copy the JSON or save it as a file — both carry the same data."
        filename={`watchbridge-backup-${todayStamp()}.json`}
        data={buildBackup(includeApiKey)}
      >
        <label className="flex items-center justify-between gap-4 border border-border p-3">
          <span className="text-sm">
            Include TMDB API key
            <span className="block text-xs text-muted-foreground">
              Off keeps this safe to paste or store anywhere. On makes
              restoring a single step — then treat it as a secret.
            </span>
          </span>
          <Switch checked={includeApiKey} onCheckedChange={setIncludeApiKey} />
        </label>
      </JsonExportDialog>

      <JsonImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Restore from backup"
        description="This replaces your current settings, actions, library, ratings and history. Export first if you want to keep what you have."
        confirmLabel="Restore"
        destructive
        onImport={handleRestore}
      />
    </div>
  );
}
