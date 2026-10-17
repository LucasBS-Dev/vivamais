import type { components } from "./generated";
export type { components, paths, operations } from "./generated";
export type SessionUser = components["schemas"]["UserView"];
export type Role = SessionUser["role"];
export type AuthResponse = components["schemas"]["LoginResponse"];
export type PatientSummary = components["schemas"]["PatientView"];
export type DashboardSummary = components["schemas"]["DashboardView"];
export type ModuleStatus = components["schemas"]["ModuleView"];
export type ModuleKey = ModuleStatus["key"];
export interface ApiProblem {
  status: number;
  title: string;
  detail: string;
}
// ApiProblem narrows the structured Spring errors; domain aliases derive from OpenAPI.
