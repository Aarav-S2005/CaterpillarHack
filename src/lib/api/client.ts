import { toast } from "../../components/ui/Toast";
import type {
  BehaviorAnalytics,
  CopilotMessage,
  ETAPrediction,
  IncidentRecord,
  OperatorProfile,
  SafetyState,
  SiteConflictWarning,
  SiteMachineObject,
  SiteWorkerObject,
  TaskItem,
  TelemetryData,
  TrainingCourse,
  WhatIfScenarioInput,
  WhatIfScenarioResult,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

let lastToastTime = 0;
function notifyErrorOnce(title: string, detail: string) {
  const now = Date.now();
  // Debounce duplicate toast messages within 2 seconds
  if (now - lastToastTime > 2000) {
    lastToastTime = now;
    toast.error(title, detail);
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      const msg = `API Error ${res.status}: ${errorText || res.statusText}`;
      notifyErrorOnce("Backend Service Failure", msg);
      throw new Error(msg);
    }
    return await res.json();
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : "Failed to connect to backend service";
    notifyErrorOnce(
      "Backend Connection Error",
      `${errorMsg} (${url.replace(API_BASE_URL, "")})`,
    );
    throw err;
  }
}

export const apiClient = {
  async getTelemetry(): Promise<TelemetryData> {
    return fetchJson<TelemetryData>(`${API_BASE_URL}/api/telemetry`, {
      cache: "no-store",
    });
  },

  async updateTelemetry(
    partial: Partial<TelemetryData>,
  ): Promise<TelemetryData> {
    return fetchJson<TelemetryData>(`${API_BASE_URL}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
  },

  async getSafetyState(): Promise<SafetyState> {
    return fetchJson<SafetyState>(`${API_BASE_URL}/api/safety`, {
      cache: "no-store",
    });
  },

  async updateSafetyThresholds(
    thresholds: Record<string, number>,
  ): Promise<SafetyState> {
    return fetchJson<SafetyState>(`${API_BASE_URL}/api/safety`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thresholds }),
    });
  },

  async getTasks(): Promise<TaskItem[]> {
    return fetchJson<TaskItem[]>(`${API_BASE_URL}/api/tasks`, {
      cache: "no-store",
    });
  },

  async updateTask(
    partialTask: Partial<TaskItem> & { id: string },
  ): Promise<TaskItem> {
    return fetchJson<TaskItem>(`${API_BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partialTask),
    });
  },

  async getIncidents(): Promise<IncidentRecord[]> {
    return fetchJson<IncidentRecord[]>(`${API_BASE_URL}/api/incidents`, {
      cache: "no-store",
    });
  },

  async resolveIncident(id: string, notes?: string): Promise<IncidentRecord> {
    return fetchJson<IncidentRecord>(`${API_BASE_URL}/api/incidents`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes }),
    });
  },

  async getBehavior(): Promise<BehaviorAnalytics> {
    return fetchJson<BehaviorAnalytics>(`${API_BASE_URL}/api/behavior`, {
      cache: "no-store",
    });
  },

  async getPredictions(taskId = "TASK-402"): Promise<ETAPrediction> {
    return fetchJson<ETAPrediction>(
      `${API_BASE_URL}/api/predictions?taskId=${taskId}`,
      { cache: "no-store" },
    );
  },

  async runWhatIfSimulation(
    input: WhatIfScenarioInput,
  ): Promise<WhatIfScenarioResult> {
    return fetchJson<WhatIfScenarioResult>(`${API_BASE_URL}/api/simulator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  async getOperatorProfile(): Promise<OperatorProfile> {
    return fetchJson<OperatorProfile>(`${API_BASE_URL}/api/operator`, {
      cache: "no-store",
    });
  },

  async getTrainingCourses(): Promise<TrainingCourse[]> {
    return fetchJson<TrainingCourse[]>(`${API_BASE_URL}/api/training`, {
      cache: "no-store",
    });
  },

  async completeTraining(
    courseId: string,
    score: number,
  ): Promise<TrainingCourse> {
    return fetchJson<TrainingCourse>(`${API_BASE_URL}/api/training`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, score }),
    });
  },

  async sendCopilotQuery(query: string): Promise<CopilotMessage> {
    return fetchJson<CopilotMessage>(`${API_BASE_URL}/api/copilot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
  },

  async getCopilotHistory(): Promise<CopilotMessage[]> {
    return fetchJson<CopilotMessage[]>(`${API_BASE_URL}/api/copilot`, {
      cache: "no-store",
    });
  },

  async getSiteOverview(): Promise<{
    machines: SiteMachineObject[];
    workers: SiteWorkerObject[];
    conflicts: SiteConflictWarning[];
  }> {
    return fetchJson<{
      machines: SiteMachineObject[];
      workers: SiteWorkerObject[];
      conflicts: SiteConflictWarning[];
    }>(`${API_BASE_URL}/api/site`, { cache: "no-store" });
  },
};
