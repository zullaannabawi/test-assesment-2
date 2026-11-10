import type { HTMLAttributes } from 'react'

type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold'

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  size?: TextSize
  weight?: TextWeight
}

export function Text({
  as: Tag = 'p',
  size = 'md',
  weight = 'regular',
  className = '',
  ...rest
}: TextProps) {
  return <Tag className={`text text--${size} text--${weight} ${className}`.trim()} {...rest} />
}
