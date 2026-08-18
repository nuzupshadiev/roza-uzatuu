export function PriglasiCredit({ language }: { language: string }) {
  const kyrgyz = language === "ky";

  return (
    <div
      className="priglasi-credit"
      style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: "0.65rem",
        rowGap: "0.2rem",
        boxSizing: "border-box",
        width: "100%",
        margin: "1rem auto 0",
        padding: "0 1rem",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        color: "inherit",
        opacity: 0.64,
        font: "inherit",
        fontSize: "0.68rem",
        lineHeight: 1.7,
        letterSpacing: "0.08em",
        textAlign: "center",
      }}
    >
      <nav
        aria-label={kyrgyz ? "Priglasi Design шилтемелери" : "Ссылки Priglasi Design"}
        style={{ display: "flex", justifyContent: "center", gap: "0.65rem" }}
      >
        <a
          href="https://www.instagram.com/priglasi.design.kg/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textUnderlineOffset: "0.18em" }}
        >
          Instagram
        </a>
        <span aria-hidden="true" style={{ display: "inline", font: "inherit", letterSpacing: "inherit", textTransform: "none" }}>·</span>
        <a
          href="https://wa.me/996776260702"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textUnderlineOffset: "0.18em" }}
        >
          WhatsApp
        </a>
      </nav>
      <span aria-hidden="true" style={{ display: "inline", font: "inherit", letterSpacing: "inherit", textTransform: "none" }}>·</span>
      <span style={{ display: "inline", font: "inherit", letterSpacing: "inherit", textTransform: "none" }}>
        {kyrgyz ? "Дизайн: " : "Дизайн от "}
        <a
          href="https://www.instagram.com/priglasi.design.kg/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textUnderlineOffset: "0.18em" }}
        >
          @priglasi.design.kg
        </a>
      </span>
    </div>
  );
}
