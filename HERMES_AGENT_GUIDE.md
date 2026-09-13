# Hermes Agent Setup Guide for SoloCRM

This guide explains how to connect your **Hermes Agent** so you can simply chat with Hermes in natural language to create leads, query priorities, and log meeting notes into **SoloCRM**.

---

## 1. Quick Credentials
* **CRM Endpoint**: `http://localhost:3000/api/hermes/v1` (or `https://your-domain.vercel.app/api/hermes/v1`)
* **Header**: `x-hermes-key: hermes-crm-secret-2026`

---

## 2. Hermes Agent System Prompt (Copy & Paste into Hermes)

Add this instruction block to your Hermes Agent's system prompt or custom instructions:

```markdown
You are an autonomous executive assistant integrated with SoloCRM for an Odoo Consultant and Trainer.

You have access to SoloCRM via REST API (Header: "x-hermes-key: hermes-crm-secret-2026"):

1. When the user mentions a prospective client, lead, or business inquiry:
   - Make a POST request to: https://<YOUR_CRM_DOMAIN>/api/hermes/v1/leads
   - Payload:
     {
       "name": "<Contact Person Name>",
       "company": "<Company Name if available>",
       "phone": "<Phone/WhatsApp with country code if provided>",
       "email": "<Email if provided>",
       "serviceType": "ODOO_CONSULTING" | "TRAINING" | "ADVISORY",
       "dealValue": <Estimated USD number, default 0>,
       "notes": "<Summary of requirements, modules, pain points>"
     }
   - Confirm to the user that the lead was created and report the AI priority score returned by the CRM.

2. When the user asks "What leads should I focus on today?" or "Give me my CRM briefing":
   - Make a GET request to: https://<YOUR_CRM_DOMAIN>/api/hermes/v1/leads
   - Summarize the top High-Priority deals and any upcoming follow-up goals.

3. When the user pastes call notes or a transcript:
   - Make a POST request to: https://<YOUR_CRM_DOMAIN>/api/hermes/v1/meetings
   - Payload:
     {
       "leadId": "<leadId if known>",
       "title": "<Call Title>",
       "rawNotes": "<Notes/Transcript text>"
     }
   - Report the executive summary and extracted action items back to the user.
```

---

## 3. Tool Function Calling Schema (For Hermes Function Calling Models)

If your Hermes model supports function calling (e.g. Nous Hermes 2/3 Tool Use), register this tool definition:

```json
[
  {
    "type": "function",
    "function": {
      "name": "solocrm_create_lead",
      "description": "Create a new prospective lead in SoloCRM with automatic DeepSeek AI scoring.",
      "parameters": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "description": "Contact person name" },
          "company": { "type": "string", "description": "Company or business name" },
          "email": { "type": "string", "description": "Email address" },
          "phone": { "type": "string", "description": "WhatsApp or phone number with country code" },
          "serviceType": {
            "type": "string",
            "enum": ["ODOO_CONSULTING", "TRAINING", "ADVISORY"],
            "description": "Service stream"
          },
          "dealValue": { "type": "number", "description": "Estimated deal value in USD" },
          "notes": { "type": "string", "description": "Inquiry scope, requirements, or pain points" }
        },
        "required": ["name"]
      }
    }
  }
]
```

---

## 4. Example Conversations with Hermes

### Example 1: Creating a Consulting Lead
> **You:** "Hey Hermes, I just spoke with Tariq from Dhaka Retail. They want an Odoo 18 Point of Sale and Inventory setup with Barcode scanners. Budget is around $8,500, phone is +8801711223344. Add him to my CRM."
>
> **Hermes:** "I have added **Tariq (Dhaka Retail)** to SoloCRM as an **Odoo Consulting** deal valued at **$8,500**. DeepSeek evaluated the lead and rated it **HIGH priority (Score: 88/100)** due to clear budget fit and immediate timeline."

### Example 2: Creating a Training Batch
> **You:** "Add a corporate training inquiry for BrainStation 23. 12 engineers for Odoo OWL 2.0 frontend framework, budget $4,000, contact is Nafis."
>
> **Hermes:** "Created lead for **Nafis (BrainStation 23)** under **Training Batches** ($4,000). DeepSeek scored it **94/100**."
