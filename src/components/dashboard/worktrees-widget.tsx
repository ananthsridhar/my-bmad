import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SegmentedProgressBar } from "@/components/shared/segmented-progress-bar";
import { StaggeredList, StaggeredItem } from "@/components/shared/staggered-list";
import { GitBranch, GitMerge, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Epic, Worktree } from "@/lib/bmad/types";
import { compareIds, getEpicShortId } from "@/lib/bmad/utils";

interface WorktreesWidgetProps {
  worktrees: Worktree[];
  epics: Epic[];
}

function getProgressColor(percent: number) {
  return percent >= 100 ? "bg-success" : "bg-warning";
}

/**
 * Per-worktree progress: aggregate the completed/total stories of every epic
 * the worktree owns (matched by normalized epic id).
 */
function summarize(worktree: Worktree, epics: Epic[]) {
  const owned = new Set(worktree.epics.map((e) => e.toLowerCase()));
  const matched = epics
    .filter((e) => owned.has(e.id.toLowerCase()))
    .sort((a, b) => compareIds(a.id, b.id));
  const total = matched.reduce((sum, e) => sum + e.totalStories, 0);
  const completed = matched.reduce((sum, e) => sum + e.completedStories, 0);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { matched, total, completed, percent };
}

export function WorktreesWidget({ worktrees, epics }: WorktreesWidgetProps) {
  if (worktrees.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
          <Info className="h-5 w-5 shrink-0" />
          <span>No worktrees declared for this project</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Git Worktrees</CardTitle>
      </CardHeader>
      <CardContent>
        <StaggeredList className="space-y-3">
          {worktrees.map((wt) => {
            const { matched, total, completed, percent } = summarize(wt, epics);
            return (
              <StaggeredItem key={`${wt.name}:${wt.branch}`}>
                <div
                  className={cn(
                    "rounded-lg border border-border/50 border-l-3 p-3 transition-colors duration-300",
                    wt.merged ? "border-l-success" : "border-l-info",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Identity */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium truncate">{wt.name}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-1.5 py-0 text-[10px] leading-4",
                            wt.merged
                              ? "bg-success/15 text-success-foreground border-success/25"
                              : "bg-info/15 text-info-foreground border-info/25",
                          )}
                        >
                          {wt.merged ? (
                            <GitMerge className="mr-1 h-3 w-3" />
                          ) : null}
                          {wt.merged ? "Merged" : "Branch"}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <code className="font-mono">{wt.branch}</code>
                        {wt.path && (
                          <>
                            <span className="text-muted-foreground/50">·</span>
                            <span className="truncate" title={wt.path}>
                              {wt.path}
                            </span>
                          </>
                        )}
                      </div>
                      {matched.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {matched.map((e) => (
                            <span
                              key={e.id}
                              title={e.title}
                              className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                            >
                              {getEpicShortId(e)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {total > 0 ? (
                        <>
                          <span className="text-sm font-semibold">{percent}%</span>
                          <SegmentedProgressBar
                            percent={percent}
                            color={getProgressColor(percent)}
                            className="h-2 w-28"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {completed}/{total} stories
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          No tracked epics
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </StaggeredItem>
            );
          })}
        </StaggeredList>
      </CardContent>
    </Card>
  );
}
