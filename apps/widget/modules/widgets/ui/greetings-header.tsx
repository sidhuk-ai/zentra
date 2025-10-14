import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

export function GreetingsHeader({
  greeting = "Hi there 👋",
  subtitle = "How can we help today?",
}: {
  greeting?: string;
  subtitle?: string;
}) {
  return (
    <>
      <div className="min-w-0">
        <h2 className="text-pretty text-xl font-semibold leading-tight">
          {greeting}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
            "text-secondary-foreground border-border"
          )}
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-primary-foreground opacity-75 animate-pulse" />
            {/* <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-foreground" /> */}
          </span>
          Online
        </Badge>
      </div>
    </>
  );
}
