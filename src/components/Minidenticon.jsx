import { minidenticon } from "minidenticons";
import { useMemo } from "react";

/**
 * @param {{ value: string; saturation: number; lightness: number} & import("react").HTMLProps<HTMLImageElement>} param0
 * @returns
 */
export function Minidenticon({ value, saturation, lightness, ...props }) {
    const svgURI = useMemo(
        () => "data:image/svg+xml;utf8," + encodeURIComponent(minidenticon(value, saturation, lightness)),
        [value, saturation, lightness],
    );
    return <img src={svgURI} alt={value} className="size-6" {...props} />;
}
