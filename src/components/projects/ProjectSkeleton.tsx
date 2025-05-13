import { Skeleton } from "@/components/ui/skeleton";

export const ProjectSkeleton = () => (
  <div className="group relative overflow-hidden rounded-lg">
    <Skeleton className="h-80 w-full" />
    <div className="mt-3">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-6 w-full max-w-[250px]" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);