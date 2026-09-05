import React from "react";
import { Button } from "@/components/ui/button";

export function CleanCard() {
  return (
    <div className="p-4 ms-4 bg-surface text-on-surface">
      <h2 className="text-headline-medium text-on-surface">Order summary</h2>
      <Button variant="filled" className="bg-brand-primary text-on-primary">
        Submit order now
      </Button>
    </div>
  );
}
