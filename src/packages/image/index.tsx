import NextImage from 'next/image';
import type { ComponentProps, ReactElement } from 'react';

/** Owner of `next/image`. */

export type AppImageProps = ComponentProps<typeof NextImage>;

export function AppImage(props: Readonly<AppImageProps>): ReactElement {
  return <NextImage {...props} />;
}
