"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CornerUpLeftIcon,
  ListIcon,
} from "lucide-react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  getCountryFlag,
  getCountryFromTimezone,
} from "@/lib/country-from-timezone";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { usePathname } from "next/navigation";
import { DiceBearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { formatDistanceToNow } from "date-fns";
import { StatusIcon } from "@workspace/ui/components/status-icon";
import { useAtomValue, useSetAtom } from "jotai/react";
import { statusFilterAtom } from "../../atoms";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfinteScrollTrigger } from "@workspace/ui/components/infinte-scroll-trigger";
import { LoadingSkeleton } from "@workspace/ui/components/loading-skeleton"

export default function ConversationPanel() {
  const pathname = usePathname();
  const statusFilter = useAtomValue(statusFilterAtom);
  const setStatusFilter = useSetAtom(statusFilterAtom);
  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      initialNumItems: 10,
    }
  );

  const {
    topElementRef,
    canLoadMore,
    isLoadingMore,
    handleLoadMore,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
  });
  return (
    <div className="flex flex-col w-full h-full text-sidebar-foreground bg-background justify-start">
      <div className="border-b border-b-border flex flex-col p-2">
        <Select
          defaultValue="all"
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as Doc<"conversation">["status"] | "all");
          }}
        >
          <SelectTrigger className="h-8 border-none px-1.5 shadow-none ring-0 bg-sidebar hover:bg-accent hover:text-accent-foreground focus-visible:ring-0">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="border-border" position="item-aligned">
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="unresolved">
              <div className="flex items-center gap-2">
                <ArrowRightIcon className="size-4" />
                <span>Unresolved</span>
              </div>
            </SelectItem>
            <SelectItem value="resolved">
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4" />
                <span>Resolved</span>
              </div>
            </SelectItem>
            <SelectItem value="escalated">
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="size-4" />
                <span>Escalated</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <LoadingSkeleton />
      ) : (
        <ScrollArea className="max-h-[calc(100vh-57px)]">
          <div className="flex w-full flex-1 flex-col text-sm">
            {conversations.results.map((conversation) => {
              const isLastMessageFromOperator =
                conversation.lastMessage?.message?.role !== "user";
              const country = getCountryFromTimezone(
                conversation.contactSession.metadata?.timezone
              );
              const countryFlag = country?.code
                ? getCountryFlag(country.code)
                : undefined;
              return (
                <Link
                  href={`/conversations/${conversation._id}`}
                  key={conversation._id}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground",
                    pathname === `/conversations/${conversation._id}` &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "-translate-y-1/2 absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity",
                      pathname === `/conversations/${conversation._id}` &&
                        "opacity-100"
                    )}
                  />
                  <DiceBearAvatar
                    seed={conversation.contactSession._id}
                    size={40}
                    className="shrink-0"
                    badgeImageUrl={countryFlag}
                  />
                  <div className="flex-1">
                    <div className="flex w-full items-center gap-2">
                      <span className="truncate font-bold">
                        {conversation.contactSession.name}
                      </span>
                      <span className="ml-auto text-muted-foreground text-xs shrink-0">
                        {formatDistanceToNow(conversation._creationTime)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex w-0 grow gap-1 items-center">
                        {isLastMessageFromOperator && (
                          <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            "text-xs line-clamp-1 text-muted-foreground",
                            !isLastMessageFromOperator &&
                              "font-bold text-foreground"
                          )}
                        >
                          {conversation.lastMessage?.text}
                        </span>
                      </div>
                      <StatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <InfinteScrollTrigger
              ref={topElementRef}
              canLoadMore={canLoadMore}
              onLoadMore={handleLoadMore}
              isLoadingMore={isLoadingMore}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
