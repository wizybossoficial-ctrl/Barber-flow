import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
};

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function listOwnedStorageObjects(
  admin: ReturnType<typeof createClient>,
  rootPath: string,
): Promise<{ paths: string[]; error: string | null }> {
  const pendingDirectories = [rootPath];
  const paths: string[] = [];

  while (pendingDirectories.length > 0) {
    const directory = pendingDirectories.shift()!;
    let offset = 0;

    while (true) {
      const { data, error } = await admin.storage
        .from("shop-images")
        .list(directory, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });

      if (error) return { paths: [], error: error.message };

      const entries = data || [];
      for (const entry of entries) {
        const path = `${directory}/${entry.name}`;
        if (entry.id === null) pendingDirectories.push(path);
        else paths.push(path);
      }

      if (entries.length < 100) break;
      offset += entries.length;
    }
  }

  return { paths, error: null };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "DELETE") {
    return jsonResponse(405, { success: false, error: "Method not allowed." });
  }

  const authorization = request.headers.get("Authorization");
  const tokenMatch = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return jsonResponse(401, { success: false, error: "Authentication is required." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, { success: false, error: "Account deletion is not configured." });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: authError } = await authClient.auth.getUser(tokenMatch[1]);
  if (authError || !userData.user) {
    return jsonResponse(401, { success: false, error: "Your session is invalid or has expired." });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: shops, error: shopsError } = await admin
    .from("shops")
    .select("id")
    .eq("owner_id", userData.user.id);

  if (shopsError) {
    return jsonResponse(500, { success: false, error: "Could not verify barbershop ownership." });
  }
  if (!shops || shops.length === 0) {
    return jsonResponse(403, { success: false, error: "No barbershop owned by this account was found." });
  }

  const storageObjects = await listOwnedStorageObjects(admin, userData.user.id);
  if (storageObjects.error) {
    return jsonResponse(500, {
      success: false,
      error: `Could not clean up barbershop images: ${storageObjects.error}`,
    });
  }

  for (let offset = 0; offset < storageObjects.paths.length; offset += 100) {
    const { error } = await admin.storage
      .from("shop-images")
      .remove(storageObjects.paths.slice(offset, offset + 100));
    if (error) {
      return jsonResponse(500, {
        success: false,
        error: `Could not clean up barbershop images: ${error.message}`,
      });
    }
  }

  const { error: deletionError } = await admin.auth.admin.deleteUser(userData.user.id);
  if (deletionError) {
    return jsonResponse(500, { success: false, error: `Could not delete the account: ${deletionError.message}` });
  }

  return jsonResponse(200, { success: true });
});
