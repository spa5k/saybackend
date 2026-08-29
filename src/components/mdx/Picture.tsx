import type { ComponentType, ImgHTMLAttributes, SVGProps } from 'react'

type AssetSource =
  string | { src?: string } | ComponentType<SVGProps<SVGSVGElement>>

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: AssetSource
  formats?: Array<string>
  inferSize?: boolean
}

export function Picture({
  src,
  // Kept for source compatibility with migrated MDX. The Vite transform
  // adds intrinsic dimensions to local raster images before MDX compilation.
  formats: _formats,
  inferSize: _inferSize,
  ...props
}: Props) {
  if (typeof src === 'function') {
    const Svg = src
    return <Svg aria-label={props.alt} role="img" />
  }

  const resolved = typeof src === 'string' ? src : src.src
  return (
    <img
      src={resolved}
      loading={props.loading ?? 'lazy'}
      decoding={props.decoding ?? 'async'}
      {...props}
    />
  )
}

export const Image = Picture
