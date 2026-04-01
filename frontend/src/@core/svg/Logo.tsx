import React from 'react'
import Image, { ImageProps } from 'next/image'
import logoPng from '../../../public/images/logos/favicon.png'

const Logo = (props: Omit<ImageProps, 'src' | 'alt'>) => {
  return <Image src={logoPng} alt='Logo' width={35} height={35} {...props} />
}

export default Logo
