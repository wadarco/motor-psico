import type { HtmlHTMLAttributes, RefObject } from 'react'

interface PageSetProps extends HtmlHTMLAttributes<HTMLDivElement> {
  ref?: RefObject<HTMLDivElement | null>
}

function PageSet({ children, className, ...props }: PageSetProps) {
  return (
    <div
      className={`flex flex-col border-dn-foreground-100/80 p-4 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

function Header({ children, ...props }: PageSetProps) {
  return <header {...props}>{children}</header>
}

export default { Root: PageSet, Header }
