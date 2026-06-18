"use client";

export default function LocatorNetwork() {
  const cardStyle = {
    background: "linear-gradient(180deg,#111827,#0b1220)",
    padding: "25px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.35)"
  };

  return (
    <div
      style={{
  minHeight: "100vh",
  backgroundColor: "#0a0a0a",
  background:
    "radial-gradient(circle at top left, rgba(29,155,240,0.20), transparent 35%), radial-gradient(circle at bottom right, rgba(30,58,95,0.28), transparent 40%)",
  color: "white",
  padding: "40px",
  width: "100%"
}}
    >
      <button
        onClick={() => {
          window.location.href = "/";
        }}
        style={{
          background: "#1e3a5f",
          color: "white",
          border: "none",
          padding: "10px 18px",
          borderRadius: "10px",
          cursor: "pointer",
          marginBottom: "30px"
        }}
      >
        ← Back to Home
      </button>

      <div
        style={{
          background:
            "linear-gradient(90deg,#0f172a,#1e3a5f,#1d9bf0)",
          padding: "16px",
          borderRadius: "14px",
          textAlign: "center",
          marginBottom: "50px",
          fontWeight: "bold",
          letterSpacing: "1px",
          boxShadow:
            "0 0 35px rgba(29,155,240,0.25)"
        }}
      >
        NATIONWIDE ELECTRICAL EQUIPMENT SOURCING •
        COMMERCIAL • INDUSTRIAL • SURPLUS
      </div>

      <div
        style={{
          textAlign: "center",
          marginBottom: "80px"
        }}
      >
        <h1
          style={{
            fontSize: "82px",
            fontWeight: 900,
            letterSpacing: "-2px",
            color: "#1d9bf0",
            marginBottom: "20px",
            textShadow:
              "0 0 40px rgba(29,155,240,0.45)"
          }}
        >
          🔍 Fiore Locator Network
        </h1>

        <p
          style={{
            fontSize: "22px",
            color: "#b0b0b0",
            maxWidth: "900px",
            margin: "0 auto",
            lineHeight: "1.8"
          }}
        >
          Need hard-to-find electrical equipment?
          Our nationwide supplier and contractor
          network helps locate disconnects,
          breakers, switchgear, transformers,
          MCC equipment, obsolete parts, and
          surplus inventory.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginTop: "35px"
          }}
        >
          {[
            "✓ Nationwide Network",
            "✓ Commercial Equipment",
            "✓ Industrial Equipment",
            "✓ Fast Response Times"
          ].map((item) => (
            <div
              key={item}
              style={{
                background:
                  "rgba(29,155,240,0.08)",
                border:
                  "1px solid rgba(29,155,240,0.2)",
                padding: "10px 18px",
                borderRadius: "999px"
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <h2
        style={{
          fontSize: "40px",
          marginBottom: "25px"
        }}
      >
        What We Source
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: "20px",
          marginBottom: "70px"
        }}
      >
        {[
          ["⚡ Disconnects", "Safety switches, fused and non-fused disconnects."],
          ["⚙️ Breakers", "Commercial and industrial breakers."],
          ["🔌 Switchgear", "Low and medium voltage switchgear."],
          ["🔋 Transformers", "Dry-type and distribution transformers."],
          ["🏭 MCC Equipment", "Motor control centers and components."],
          ["📦 Obsolete Parts", "Hard-to-find and discontinued products."]
        ].map(([title, desc]) => (
          <div key={title} style={cardStyle}>
            <h3>{title}</h3>
            <p style={{ color: "#b0b0b0" }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      <h2
        style={{
          fontSize: "40px",
          marginBottom: "25px"
        }}
      >
        Industries We Serve
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
          marginBottom: "70px"
        }}
      >
        {[
          "Commercial Construction",
          "Industrial Facilities",
          "Manufacturing Plants",
          "Data Centers",
          "Educational Campuses",
          "Municipal Projects"
        ].map((industry) => (
          <div key={industry} style={cardStyle}>
            <h3>{industry}</h3>
          </div>
        ))}
      </div>

      <h2
        style={{
          fontSize: "40px",
          marginBottom: "25px"
        }}
      >
        Why Use Fiore?
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(300px,1fr))",
          gap: "20px",
          marginBottom: "70px"
        }}
      >
        <div style={cardStyle}>
          <h3>🤝 Nationwide Network</h3>
          <p style={{ color: "#b0b0b0" }}>
            Access to suppliers,
            contractors, surplus dealers,
            and industry contacts nationwide.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>⚡ Fast Sourcing</h3>
          <p style={{ color: "#b0b0b0" }}>
            Quick turnaround on difficult
            and hard-to-find equipment requests.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>🏆 Industry Experience</h3>
          <p style={{ color: "#b0b0b0" }}>
            Commercial and industrial electrical
            equipment specialists.
          </p>
        </div>
      </div>

      <div
        style={{
          background:
            "linear-gradient(180deg,#111827,#0b1220)",
          padding: "50px",
          borderRadius: "20px",
          border: "1px solid #1e3a5f",
          textAlign: "center",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.35)"
        }}
      >
        <h2
          style={{
            fontSize: "48px",
            marginBottom: "15px"
          }}
        >
          Can't Find It?
        </h2>

        <p
          style={{
            color: "#b0b0b0",
            fontSize: "18px",
            maxWidth: "700px",
            margin:
              "0 auto 30px auto"
          }}
        >
          Submit a Locator Request and our
          team will begin searching our
          network for available inventory.
        </p>

        <button
          onClick={() => {
            window.location.href =
              `mailto:fioreelectricalinc@gmail.com?subject=Locator Network Request`;
          }}
          style={{
            background: "#1d9bf0",
            color: "white",
            border: "none",
            padding: "16px 28px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "18px"
          }}
        >
          🔍 Submit Locator Request
        </button>
      </div>
    </div>
  );
}