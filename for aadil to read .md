DO this :

# Trading (Import/Export) Sales Module – Complete Rebuild Specification

## Important Instruction

Completely remove, ignore, and replace all existing work currently implemented under the **Trading Sales → Import Module**.

Do not extend the existing workflow. Do not reuse the existing forms, models, screens, or process logic.

Build a completely new professional Trading Import/Export workflow from scratch based on document-driven freight forwarding operations.

The goal is to create a clean, user-friendly, enterprise-grade workflow where shipment information is entered once and automatically flows through all subsequent documents.

---

# Phase 1 – Foundation, Structure & User Experience

## Objective

First build the complete module structure, navigation, record management, and user interface before implementing document generation logic.

The module should be organized as:

For now focus on **Imports**.

---

## Main Import Records Screen

Create a main listing screen similar to the attached reference screenshot.

The listing should display records in a clean table/grid view.

Example columns:

```text
Reference No
Create Date
Expected Arrival Date
Customer
Salesperson
Company
Containers
Shipment Status
Current Stage
```

Each row represents one complete shipment/import file.

Example:

```text
IMP-00001
Created: 05-Jul-2026
Customer: ABC Traders
Current Stage: HBL Created
Status: In Progress
```

---

## Record Creation

When a user creates a new Import Record:

System should create a shipment file.

Store:

```text
Reference Number
Customer
Salesperson
Company
Expected Arrival Date
Remarks
```

Example:

"This shipment record was created for ABC Traders on 05-Jul-2026."

---

## Record Detail Screen

When the user clicks a shipment record, open a complete shipment workspace.

Inside the shipment workspace display all six documents in a clear timeline/workflow format.

```text
Draft BL
↓
House BL
↓
Master BL
↓
Arrival Notice
↓
Delivery Order
↓
Import Clearing Invoice
```

---

## PDF Upload Support

For the first three received documents, provide PDF upload functionality.

These documents are received from external parties and must support document storage.

### 1. Draft BL

Fields:

```text
Upload Reference PDF
View PDF
Download PDF
Replace PDF
```

### 2. House BL (HBL)

Fields:

```text
Upload Reference PDF
View PDF
Download PDF
Replace PDF
```

### 3. Master BL (MBL)

Fields:

```text
Upload Reference PDF
View PDF
Download PDF
Replace PDF
```

Users should be able to upload original received PDFs for reference.

These uploaded PDFs should remain attached to the shipment permanently.

---

## Shipment Workspace Layout

Display:

```text
Shipment Summary
------------------------------------------------

Customer
Reference Number
Container Count
Status
Current Stage

Documents
------------------------------------------------

✓ Draft BL
✓ House BL
✓ Master BL
✓ Arrival Notice
✓ Delivery Order
✓ Import Clearing Invoice
```

Each document card should display:

```text
Status
Created Date
Created By
PDF Available
View Button
Edit Button
```

---

# Phase 2 – Document Structure & Data Flow

## Document 1 – Draft BL

Provide full form structure:

```text
Draft BL No
Booking No
Vessel
Voyage
POL
POD
Place of Delivery

Shipper
Consignee
Notify Party

Cargo Description
HS Code

Packages
Gross Weight
Net Weight
CBM

Container Table

Container No
Size
Seal No
Packages
Gross Weight
Net Weight
CBM

Freight Terms

Draft Date
On Board Date
```

Reference PDF upload required.

---

## Document 2 – House BL (HBL)

Reference PDF upload required.

Fields:

```text
HBL Number
Booking Number
Service Contract

Place of Receipt
POL
POD
Place of Delivery

Vessel
Voyage

Shipper
Consignee
Notify Party
Delivery Agent

Marks & Numbers
Cargo Description

Container Details

Packages
Gross Weight
Net Weight
CBM

Freight Terms

Place of Issue
Issue Date
On Board Date
```

Auto-fill all matching fields from Draft BL.

---

## Document 3 – Master BL (MBL)

Reference PDF upload required.

Fields:

```text
Shipping Line
MBL Number
Booking Number

Place of Receipt
POL
POD
Place of Delivery

Vessel
Voyage

Shipper
Consignee
Notify Party

Forwarder Reference

Cargo Description

Container Details

Packages
Gross Weight
CBM

Freight Terms
Freight Charges

Country of Origin

Place of Issue
Issue Date
On Board Date
```

Auto-fill all matching fields from HBL.

---

## Document Relationship Rules

```text
Draft BL
   ↓
House BL
   ↓
Master BL
```

The user should never re-enter duplicate shipment data.

All common fields should automatically flow forward.

---

# Phase 3 – Generated Operational Documents

These documents are generated internally.

Some fields should auto-fill from HBL/MBL while remaining fields are entered manually.

---

## Document 4 – Arrival Notice

Auto-fill:

```text
HBL No
MBL No
Booking No

Vessel
Voyage

Shipping Line

Container Details

Cargo Description

Packages
Gross Weight

POL
POD
Destination

Consignee
```

Manual:

```text
Notice No
Notice Date
ETA
Arrival Date

Storage Charges
Demurrage
Other Charges

Remarks
```

---

## Document 5 – Delivery Order

Auto-fill:

```text
HBL No
MBL No
Booking No

Consignee

Shipping Line

Container Details

Cargo Description

Packages
Gross Weight

POL
POD
Destination
```

Manual:

```text
DO Number
DO Date

Release Date
Pickup Location
Warehouse

Charges Paid
Outstanding Amount

Issued By
Approved By
```

---

## Document 6 – Import Clearing Invoice

Auto-fill:

```text
HBL Number
MBL Number

Container Number
Container Type

Shipping Line

Vessel
Voyage

Shipper
Consignee

Cargo Description

Gross Weight
Net Weight

POL
POD
Destination
```

Manual:

```text
Invoice Number
Invoice Date

Customer
NTN

Clearing Agent

Exchange Rate
```

---

## Charges Table

Provide editable charge lines:

```text
THC
EMF
ISPS
LOLO
Documentation
CAFD
ISC
Gate Pass
Security Deposit
Other Charges
```

Columns:

```text
Charge Name
Rate
Quantity
Amount
```

---

## Automatic Calculations

System must calculate:

```text
Subtotal
Total Amount
Grand Total
Amount in Words
```

---

# Additional Requirements

## Status Management

Every document should support:

```text
Draft
Pending Approval
Approved
Cancelled
```

---

## Audit Trail

Store:

```text
Created By
Created Date

Modified By
Modified Date

Approved By
Approved Date
```

---

## Smart Navigation

Users should be able to move between related documents through smart buttons.

Example:

```text
View Draft BL
View HBL
View MBL
View Arrival Notice
View Delivery Order
View Invoice
```

---

## PDF Generation

Generated documents should support:

```text
Preview PDF
Print PDF
Download PDF
Email PDF
```

---

## Dashboard

Provide dashboard statistics:

```text
Total Imports

Draft BL Pending
HBL Pending
MBL Pending

Arrival Notices Pending
Delivery Orders Pending

Invoices Pending

Completed Shipments
```

---

## Final Workflow

```text
Create Import Shipment Record
        ↓

Upload Draft BL PDF
        ↓

Create Draft BL
        ↓

Upload HBL PDF
        ↓

Create House BL
        ↓

Upload MBL PDF
        ↓

Create Master BL
        ↓

Generate Arrival Notice
        ↓

Generate Delivery Order
        ↓

Generate Import Clearing Invoice
        ↓

Complete Shipment
```

The final result should be a professional Trading Import/Export Sales Module where each shipment is maintained as a single master record, received documents are stored as PDFs for reference, generated documents inherit shipment data automatically, duplicate entry is minimized, and users can manage the entire import lifecycle from one clean workspace.
