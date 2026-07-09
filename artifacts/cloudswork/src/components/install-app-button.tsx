import { useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useToast } from "@/hooks/use-toast";

export function InstallAppButton() {
  const { canInstall, installed, isIos, promptInstall } = usePwaInstall();
  const { toast } = useToast();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (installed) return null;
  if (!canInstall && !isIos) return null;

  const handleClick = async () => {
    if (isIos && !canInstall) {
      setShowIosHelp(true);
      return;
    }
    const accepted = await promptInstall();
    if (accepted) {
      toast({ title: "App installed!", description: "CloudsWork has been added to your home screen." });
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl p-3.5 mb-2 text-left"
      >
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Get the App</p>
          <p className="text-xs text-muted-foreground">Install CloudsWork on your phone for quick access</p>
        </div>
        <Download className="w-4 h-4 text-primary shrink-0" />
      </button>

      {showIosHelp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowIosHelp(false)}>
          <div className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">Install CloudsWork</p>
              <button onClick={() => setShowIosHelp(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
