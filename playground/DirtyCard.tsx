import React from "react";

export function DirtyCard() {
  return (
    <div style={{ backgroundColor: "#1e293b" }} className="p-[13px] ml-4">
      <h2 className="text-white text-[15px]">Order summary</h2>
      <button className="bg-[#2563eb] text-white w-8 h-8">
        Submit Order Now
      </button>
    </div>
  );
}
