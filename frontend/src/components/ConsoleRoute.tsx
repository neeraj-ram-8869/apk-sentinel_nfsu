import { Suspense } from "react";

import Console, { type ConsoleProps } from "@/components/Console";

// Console reads ?view= via useSearchParams, which Next requires to sit behind a
// Suspense boundary or the route cannot be prerendered. One wrapper, so every
// route gets the boundary without repeating it.
export default function ConsoleRoute(props: ConsoleProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" aria-busy="true" />}>
      <Console {...props} />
    </Suspense>
  );
}
