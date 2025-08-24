import React from "react";
import { Image } from "react-konva";
import useImage from "use-image";
import "./field-image.scss";

type Props = {
  src?: string;
  scale?: number; // multiply factor
};

export default function FieldImage({
  src = "/assets/field.jpg",
  scale = 1,
}: Props) {
  const [image] = useImage(src, "anonymous");
  if (!image) return null;

  const w = image.width * scale;
  const h = image.height * scale;

  return (
    <Image
      image={image}
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      listening={false}
    />
  );
}
