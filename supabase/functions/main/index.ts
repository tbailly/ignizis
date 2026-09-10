Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const functionName = parts[0];

  if (!functionName) {
    return new Response("Edge Runtime OK", { status: 200 });
  }

  const servicePath = `/home/deno/functions/${functionName}`;

  try {
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath,
      noModuleCache: false,
      importMapPath: null,
      envVars: Object.entries(Deno.env.toObject()),
      forceCreate: false,
      netAccessDisabled: false,
    });

    const signal = AbortSignal.timeout(30_000);
    return await worker.fetch(req, { signal });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    const notFound = error.includes("not found") || error.includes("No such file");
    return new Response(
      JSON.stringify({ error: notFound ? `Function '${functionName}' not found` : error }),
      { status: notFound ? 404 : 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
