"use client";

import dynamic from "next/dynamic";

const Antigravity = dynamic(() => import("./Antigravity"), {
  ssr: false,
});

export default function AntigravityBackground(props: any) {
  return <Antigravity {...props} />;
}
