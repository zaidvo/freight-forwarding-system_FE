# Source Structure

This project is organized around clear ownership boundaries:

- `app/` contains the application shell: routes, providers, layout, and dashboard.
- `companies/` contains company-specific ERP domains.
  - `companies/trading/` owns Import/Export Trading workflows.
  - `companies/freight/` owns Freight Forwarding workflows.
- `shared/` contains reusable UI, services, and utilities used by multiple domains.
- `modules/` contains cross-company or shared business modules such as accounts, sales, operations, finance, and marketing.

Rule of thumb: if code belongs to only one company, keep it under that company. If both companies use it, move it to `shared/` or a cross-company `modules/` area.
