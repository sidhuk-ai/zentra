import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface InfinteScrollTriggerProps {
    canLoadMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
    loadMoreText?: string;
    noMoreText?: string;
    className?: string
    ref?: React.Ref<HTMLDivElement>
}

export function InfinteScrollTrigger({
    canLoadMore,
    isLoadingMore,
    onLoadMore,
    loadMoreText= "Load more",
    noMoreText= "No more items",
    className,
    ref
}:InfinteScrollTriggerProps) {
    let text = loadMoreText;

    if(isLoadingMore) {
        text="Loading..."
    } else if(!canLoadMore) {
        text = noMoreText
    }

    return (
        <div className={cn("flex w-full justify-center py-2",className)} ref={ref}>
            <Button
                disabled={!canLoadMore || isLoadingMore}
                onClick={onLoadMore}
                size={"sm"}
                variant={"ghost"}
            >
                {text}
            </Button>
        </div>
    )
}