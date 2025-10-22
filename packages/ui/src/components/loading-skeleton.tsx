import { Skeleton } from "@workspace/ui/components/skeleton";

function LoadingSkeleton() {
    return (
        <div className="w-full h-full flex flex-col gap-1.5 p-1">
            {Array.from({ length: 8 }).map((_,i) => (
                <div className="flex items-start gap-3 rounded-lg p-4" key={i}>
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full"/>
                    <div className="min-w-0 flex-1">
                        <div className="flex w-full items-center gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="ml-auto h-3 w-12 shrink-0" />
                        </div>
                        <div className="mt-2">
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function WidgetViewLoadingSkeleton() {
    return (
        <div className="w-full h-full flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_,i) => (
                <div className="w-full flex flex-col gap-2 p-4" key={i}>
                    <div className="flex justify-between">
                        <Skeleton className="w-14 h-4"/>
                        <Skeleton className="w-24 h-4"/>
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="w-1/2 h-4" />
                        <Skeleton className="w-7 h-7 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export { LoadingSkeleton, WidgetViewLoadingSkeleton }