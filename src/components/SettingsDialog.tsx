import { useState } from "react";
import { ExternalLink, Eye, EyeOff, KeyRound, NotebookPen } from "lucide-react";
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
import { ActionsSettings } from "@/components/actions/ActionsSettings";
import { useSettings } from "@/stores/settings";

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
            <NotionSection />
          </TabsContent>

          <TabsContent value="actions" className="mt-5">
            <ActionsSettings />
          </TabsContent>
        </Tabs>
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

function NotionSection() {
  const notionUrl = useSettings((s) => s.notionUrl);
  const setNotionUrl = useSettings((s) => s.setNotionUrl);

  return (
    <div className="space-y-3 border-t border-border pt-5">
      <div className="flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-primary" />
        <Label htmlFor="notion-url">Notion page URL (optional)</Label>
      </div>
      <Input
        id="notion-url"
        value={notionUrl}
        spellCheck={false}
        autoComplete="off"
        placeholder="https://www.notion.so/your-watch-log"
        onChange={(e) => setNotionUrl(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        Where “Log to Notion” opens after copying a formatted note. Leave blank to
        open a fresh Notion tab.
      </p>
    </div>
  );
}
