import type { ReactElement } from "react";

export interface SidebarsProps {
  left?: ReactElement
  right?: ReactElement
  children: any
}

export function Sidebars({ left, right, children }: SidebarsProps) {
  return (
    <div className="container tw:grid tw:grid-cols-[10rem_1px_1fr_1px_10em] tw:gap-8">
      <aside>{left}</aside>
      <div className="tw:bg-gray-500"></div>
      <main>
        {children}
      </main>
      <div className="tw:bg-gray-500"></div>
      <aside>{right}</aside>
    </div>
  )
}
