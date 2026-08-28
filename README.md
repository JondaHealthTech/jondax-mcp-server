# JondaX Model Context Protocol (MCP) Server

Official Model Context Protocol (MCP) server for **JondaX by Jonda Health**. Connect AI assistants (Antigravity, Claude Desktop, Cursor, Zed, Cline) directly to the JondaX Health Data Transformation Engine.

JondaX extracts data from clinical files — PDFs, images, HL7, FHIR — normalises it, and returns clean, structured, coded output in the format your system needs.

---

## Capabilities & MCP Tools

JondaX provides two core processing modules and retrieval tools:

| Tool Name | Type | Description |
| :--- | :--- | :--- |
| **`upload_pathology_scan`** | **Async** | Uploads a pathology report or lab document (PDF, JPG, PNG, JSON, CSV, Parquet and etc). JondaX de-identifies, extracts, normalises, translates, and returns an `uploadId` for tracking. |
| **`upload_medical_device`** | **Sync** | Uploads an image of a medical device reading (pulse oximeter, blood pressure monitor, glucometer, etc.) and extracts readings instantly. |
| **`get_upload_status`** | **Query** | Checks processing status (`uploaded`, `processing`, `completed`, `failed`) and webhook delivery status. |
| **`get_extracted_results`** | **Query** | Retrieves structured extracted results (JSON, FHIR JSON, FHIR XML, HL7, CSV, Parquet). Retained for 30 days. Returns HTTP 202 if still in progress. |

---

## Configuration

Get your API key from the **Integration** section in the JondaX Client Portal. https://app.jondax.eu

| Environment Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `JONDAX_API_KEY` | **Yes** | — | Your JondaX API token (`jondax_...`) |
| `JONDAX_BASE_URL` | No | `https://app.jondax.eu` | JondaX API Base URL |

---

## Quickstart Setup in AI Tools

### 1. In Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "jondax": {
      "command": "npx",
      "args": ["-y", "@jondax/mcp-server"],
      "env": {
        "JONDAX_API_KEY": "YOUR_JONDAX_API_KEY",
        "JONDAX_BASE_URL": "https://app.jondax.eu"
      }
    }
  }
}
```

### 2. In Cursor / Antigravity (`mcp_config.json`)

```json
{
  "mcpServers": {
    "jondax": {
      "command": "npx",
      "args": ["-y", "@jondax/mcp-server"],
      "env": {
        "JONDAX_API_KEY": "YOUR_JONDAX_API_KEY",
        "JONDAX_BASE_URL": "https://app.jondax.eu"
      }
    }
  }
}
```

---

## How It Works

```
┌──────────────┐     upload_pathology_scan      ┌─────────────────────────────┐
│              ├───────────────────────────────►│ JondaX Transformation Engine│
│   AI Agent   │                                │  • De-identifies & Extracts │
│ (Antigravity │◄───────────────────────────────┤  • Maps Medical Terminology │
│   / Claude)  │       Returns uploadId         │  • Converts Units & Codes   │
│              │                                └──────────────┬──────────────┘
│              │     get_extracted_results                     │
│              ├───────────────────────────────────────────────┘
│              │◄───────────────────────────────
│              │   Returns Structured Results
└──────────────┘   (JSON, FHIR, HL7, CSV, etc.)
```

---

## Supported Output Formats & Standards

* **FHIR**: FHIR JSON, FHIR XML (Observation, DiagnosticReport)
* **HL7**: HL7 v2
* **Standard Data**: JSON, CSV, Parquet
* **Terminology & Coding**: LOINC, standard clinical units & normalized ranges

---

## Compliance & Security

JondaX is built specifically for healthcare data:
* **HIPAA** · **GDPR** · **PDPA** · **ISO 27001**

---

## Local Development

If contributing or building from source:

```bash
git clone https://github.com/JondaHealthTech/jondax-mcp-server.git
cd jondax-mcp-server
npm install
npm run build
```

---

## Documentation & Links

* **API Docs**: [jondax.redocly.app](https://jondax.redocly.app/)
* **Product**: [jonda.health/product/jondax](https://www.jonda.health/product/jondax)
* **Client Portal**: [app.jondax.eu](https://app.jondax.eu)

## License

MIT © [Jonda Health](https://www.jonda.health)
