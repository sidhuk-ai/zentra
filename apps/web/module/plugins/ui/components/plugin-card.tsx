import { Button } from "@workspace/ui/components/button";
import { ArrowLeftRightIcon, LucideIcon, PlugIcon } from "lucide-react"
import Image from "next/image";

export interface Feature {
    icon: LucideIcon,
    label: string;
    description: string
}

interface PluginCardProps {
    isDisabled?: boolean;
    serviceName: string;
    serviceImage: string;
    features: Feature[];
    onSubmit?: () => void
}

export const PluginCard = ({
    isDisabled,
    serviceImage,
    serviceName,
    features,
    onSubmit
}: PluginCardProps) => {
  return (
    <div className="h-fit w-full rounded-lg border border-border bg-background p-8">
        <div className="mb-6 flex items-center justify-center gap-6">
            <div className="flex flex-col items-center">
                <Image 
                    width={40}
                    height={40}
                    src={serviceImage}
                    alt={serviceName}
                    className="rounded object-contain"
                />
            </div>
            <div className="flex flex-col items-center gap-1">
                <ArrowLeftRightIcon />
            </div>
            <div className="flex flex-col items-center">
                <Image 
                    width={40}
                    height={40}
                    src={"/zentra.svg"}
                    alt={"platform"}
                    className="rounded object-contain"
                />
            </div>
        </div>
        
        <div className="mb-6 text-center">
            <p className="text-lg">
                <span>Connect your {serviceName} account</span>
            </p>
        </div>
        <div className="mb-6">
            <div className="space-y-4">
                {features.map((feature) => (
                    <div className="flex items-center gap-3" key={feature.label}>
                        <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted">
                            <feature.icon className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                            <div className="font-medium text-sm">{feature.label}</div>
                            <div className="text-muted-foreground text-xs">{feature.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="text-center">
            <Button
                className="size-full cursor-pointer"
                disabled={isDisabled}
                onClick={onSubmit}
            >
                Connect
                <PlugIcon />
            </Button>
        </div>
    </div>
  )
}
