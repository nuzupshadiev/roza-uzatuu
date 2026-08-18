import Image from "next/image";
import { templateContent } from "@/data/template-content";
import { Reveal } from "./Reveal";

const { ornamentDiamond, divider } = templateContent.assets;

/** Gold diamond medallion the reference uses to separate its sections. */
export function Ornament({ className }: { className?: string }) {
  return (
    <Reveal motion="zoom">
      <Image
        className={`ornament${className ? ` ${className}` : ""}`}
        src={ornamentDiamond.src}
        width={ornamentDiamond.width}
        height={ornamentDiamond.height}
        sizes="126px"
        alt=""
        aria-hidden="true"
      />
    </Reveal>
  );
}

/** Thin gold rule with a sparkle at its centre. */
export function Divider({ className }: { className?: string }) {
  return (
    <Reveal motion="zoom">
      <Image
        className={className}
        src={divider.src}
        width={divider.width}
        height={divider.height}
        sizes="340px"
        alt=""
        aria-hidden="true"
        unoptimized
        style={{ width: "calc(251 * var(--u))", height: "auto", margin: "0 auto" }}
      />
    </Reveal>
  );
}
