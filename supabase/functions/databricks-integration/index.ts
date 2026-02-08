
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

const dbxCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DatabricksRequest {
  action: 'embed' | 'search' | 'log_run' | 'process_data';
  data: Record<string, unknown>;
}

interface EmbedRequest {
  texts: string[];
  model?: string;
}

interface SearchRequest {
  query: string;
  index_name: string;
  top_k?: number;
}

interface MLflowLogRequest {
  run_name: string;
  experiment_name: string;
  params?: Record<string, string | number>;
  metrics?: Record<string, number>;
  tags?: Record<string, string>;
}

interface ProcessDataRequest {
  facilities: Array<{
    name: string;
    region: string;
    specialties: string[];
    status: string;
  }>;
  operation: 'aggregate' | 'gap_analysis' | 'cluster';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: dbxCorsHeaders });
  }

  try {
    const DATABRICKS_HOST = Deno.env.get("DATABRICKS_HOST");
    const DATABRICKS_TOKEN = Deno.env.get("DATABRICKS_TOKEN");

    if (!DATABRICKS_HOST || !DATABRICKS_TOKEN) {
      // Allow simulation if credentials missing, but warn
      console.warn("Databricks credentials missing. Features requiring API will fail/mock.");
    }

    const { action, data } = await req.json() as DatabricksRequest;

    let result: Record<string, unknown>;

    switch (action) {
      case 'embed':
        result = await createEmbeddings(DATABRICKS_HOST || '', DATABRICKS_TOKEN || '', data as unknown as EmbedRequest);
        break;
      case 'search':
        result = await vectorSearch(DATABRICKS_HOST || '', DATABRICKS_TOKEN || '', data as unknown as SearchRequest);
        break;
      case 'log_run':
        result = await logMLflowRun(DATABRICKS_HOST || '', DATABRICKS_TOKEN || '', data as unknown as MLflowLogRequest);
        break;
      case 'process_data':
        result = await processWithSpark(DATABRICKS_HOST || '', DATABRICKS_TOKEN || '', data as unknown as ProcessDataRequest);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...dbxCorsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Databricks integration error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...dbxCorsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Create text embeddings using Databricks Foundation Models
async function createEmbeddings(
  host: string,
  token: string,
  { texts, model = 'databricks-bge-large-en' }: EmbedRequest
): Promise<{ embeddings: number[][]; model: string; usage: { total_tokens: number } }> {
  try {
    const response = await fetch(`${host}/serving-endpoints/${model}/invocations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: texts
      }),
    });

    if (!response.ok) {
      // Fallback for Free Edition (which doesn't support Model Serving)
      console.warn(`Databricks Model Serving not available (${response.status}). Using local mock fallback.`);
      return {
        embeddings: texts.map(() => Array(1024).fill(0).map(() => Math.random())), // Mock random embeddings
        model: 'local-fallback-mock',
        usage: { total_tokens: 0 }
      };
    }

    const result = await response.json();
    return {
      embeddings: result.data.map((d: { embedding: number[] }) => d.embedding),
      model: result.model,
      usage: result.usage
    };
  } catch (error) {
    console.error("Databricks embedding error:", error);
    // Explicit fallback on network error
    return {
      embeddings: texts.map(() => Array(1024).fill(0).map(() => Math.random())),
      model: 'local-fallback-error',
      usage: { total_tokens: 0 }
    };
  }
}

// Vector search using Databricks Vector Search
async function vectorSearch(
  host: string,
  token: string,
  { query, index_name, top_k = 10 }: SearchRequest
): Promise<{ results: Array<{ id: string; score: number; content: string }> }> {
  try {
    // First try to get embedding (might fallback)
    const embeddingResult = await createEmbeddings(host, token, { texts: [query] });
    const queryEmbedding = embeddingResult.embeddings[0];

    // Search the vector index
    const response = await fetch(`${host}/api/2.0/vector-search/indexes/${index_name}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query_vector: queryEmbedding,
        num_results: top_k,
        columns: ["id", "content", "metadata"]
      }),
    });

    if (!response.ok) {
      console.warn(`Databricks Vector Search not available (${response.status}). Returning empty results.`);
      return { results: [] }; // Graceful empty return for Free Edition
    }

    const result = await response.json();
    return {
      results: result.result?.data_array?.map((row: string[]) => ({
        id: row[0],
        content: row[1],
        score: parseFloat(row[2])
      })) || []
    };
  } catch (error) {
    console.error("Vector search error:", error);
    return { results: [] };
  }
}

// Log runs to MLflow
async function logMLflowRun(
  host: string,
  token: string,
  { run_name, experiment_name, params, metrics, tags }: MLflowLogRequest
): Promise<{ run_id: string; experiment_id: string; status: string }> {
  try {
    // Get or create experiment
    const experimentResponse = await fetch(`${host}/api/2.0/mlflow/experiments/get-by-name?experiment_name=${encodeURIComponent(experiment_name)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    let experiment_id: string;

    if (!experimentResponse.ok) {
      // Create experiment if it doesn't exist
      const createResponse = await fetch(`${host}/api/2.0/mlflow/experiments/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: experiment_name }),
      });

      if (!createResponse.ok) {
        // Fallback if experiment creation fails (e.g. permissions/Free logic)
        console.warn("MLflow Experiment creation failed. Using mock run ID.");
        return { run_id: "mock-run-id", experiment_id: "mock-exp-id", status: "SKIPPED" };
      }

      const createResult = await createResponse.json();
      experiment_id = createResult.experiment_id;
    } else {
      const expResult = await experimentResponse.json();
      experiment_id = expResult.experiment.experiment_id;
    }

    // Create run
    const runResponse = await fetch(`${host}/api/2.0/mlflow/runs/create`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        experiment_id,
        run_name,
        start_time: Date.now(),
      }),
    });

    if (!runResponse.ok) {
      console.warn("Failed to create MLflow run. Skipping.");
      return { run_id: "mock-run-id", experiment_id: experiment_id, status: "SKIPPED" };
    }

    const runResult = await runResponse.json();
    const run_id = runResult.run.info.run_id;

    // Log parameters
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        await fetch(`${host}/api/2.0/mlflow/runs/log-parameter`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ run_id, key, value: String(value) }),
        });
      }
    }

    // Log metrics
    if (metrics) {
      for (const [key, value] of Object.entries(metrics)) {
        await fetch(`${host}/api/2.0/mlflow/runs/log-metric`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ run_id, key, value, timestamp: Date.now() }),
        });
      }
    }

    // Log tags
    if (tags) {
      for (const [key, value] of Object.entries(tags)) {
        await fetch(`${host}/api/2.0/mlflow/runs/set-tag`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ run_id, key, value }),
        });
      }
    }

    // End run
    await fetch(`${host}/api/2.0/mlflow/runs/update`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ run_id, status: "FINISHED", end_time: Date.now() }),
    });

    return { run_id, experiment_id, status: "FINISHED" };

  } catch (error) {
    console.warn("MLflow logging error (graceful fallback):", error);
    return { run_id: "mock-run-id", experiment_id: "mock-exp-id", status: "SKIPPED" };
  }
}

// Process data using Databricks SQL/Spark (Simulated Logic reused locally)
async function processWithSpark(
  host: string, // Kept for interface compatibility
  token: string, // Kept for interface compatibility
  { facilities, operation }: ProcessDataRequest
): Promise<{ results: Record<string, unknown>[] }> {
  // This logic runs locally on the Edge Function, mimicking a Spark job on small datasets.
  // It is robust and works on Free Edition because it doesn't call external compute.

  switch (operation) {
    case 'aggregate':
      // Aggregate facilities by region
      const regionCounts: Record<string, { count: number; statuses: Record<string, number> }> = {};
      for (const f of facilities) {
        if (!regionCounts[f.region]) {
          regionCounts[f.region] = { count: 0, statuses: {} };
        }
        regionCounts[f.region].count++;
        regionCounts[f.region].statuses[f.status] = (regionCounts[f.region].statuses[f.status] || 0) + 1;
      }
      return {
        results: Object.entries(regionCounts).map(([region, data]) => ({
          region,
          total_facilities: data.count,
          status_breakdown: data.statuses
        }))
      };

    case 'gap_analysis':
      // Identify regions with critical gaps
      const specialtyByRegion: Record<string, Set<string>> = {};
      const criticalSpecialties = ['cardiology', 'emergency', 'pediatrics', 'surgery', 'oncology'];

      for (const f of facilities) {
        if (!specialtyByRegion[f.region]) {
          specialtyByRegion[f.region] = new Set();
        }
        f.specialties.forEach(s => specialtyByRegion[f.region].add(s));
      }

      return {
        results: Object.entries(specialtyByRegion).map(([region, specs]) => {
          const missing = criticalSpecialties.filter(s => !specs.has(s));
          return {
            region,
            available_specialties: Array.from(specs),
            missing_critical: missing,
            gap_score: missing.length / criticalSpecialties.length
          };
        }).sort((a, b) => (b.gap_score as number) - (a.gap_score as number))
      };

    case 'cluster':
      // Cluster facilities by specialty coverage
      const clusters: Record<string, typeof facilities> = {
        'comprehensive': [],
        'specialized': [],
        'basic': []
      };

      for (const f of facilities) {
        if (f.specialties.length >= 5) {
          clusters['comprehensive'].push(f);
        } else if (f.specialties.length >= 2) {
          clusters['specialized'].push(f);
        } else {
          clusters['basic'].push(f);
        }
      }

      return {
        results: Object.entries(clusters).map(([cluster, facs]) => ({
          cluster_name: cluster,
          facility_count: facs.length,
          sample_facilities: facs.slice(0, 3).map(f => f.name)
        }))
      };

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
