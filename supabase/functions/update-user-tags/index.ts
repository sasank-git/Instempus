// ============================================================================
// SUPABASE EDGE FUNCTION: update-user-tags
// Runtime: Deno / TypeScript
// Path: supabase/functions/update-user-tags/index.ts
//
// Description:
//   1. Authenticates requester via incoming Bearer JWT.
//   2. Enforces RBAC (requester role MUST be 'admin' or 'principal').
//   3. Parses targetUserId and newTags payload.
//   4. Uses service_role client to bypass RLS and perform atomic JSONB merge.
//   5. Returns 200 OK with updated profile or appropriate error response.
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestPayload {
  targetUserId: string;
  newTags: Record<string, unknown>;
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 2. Authentication: Extract JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or malformed Authorization Bearer header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const jwtToken = authHeader.replace("Bearer ", "").trim();

    // 3. Environment Variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("Missing required Supabase environment secrets");
      return new Response(
        JSON.stringify({ error: "Internal server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Verify Requester Identity using anon client + JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwtToken}` } },
      auth: { persistSession: false },
    });

    const {
      data: { user: requesterUser },
      error: authError,
    } = await userClient.auth.getUser(jwtToken);

    if (authError || !requesterUser) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Invalid or expired JWT token",
          details: authError?.message,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 5. Initialize Service Role Client for RBAC query and privileged update
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // 6. Authorization (RBAC): Verify requester role in profiles table
    const { data: requesterProfile, error: profileFetchError } = await adminClient
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", requesterUser.id)
      .single();

    if (profileFetchError || !requesterProfile) {
      return new Response(
        JSON.stringify({
          error: "Forbidden: Requester profile not registered in profiles table",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const allowedRoles = ["admin", "principal"];
    if (!allowedRoles.includes(requesterProfile.role)) {
      return new Response(
        JSON.stringify({
          error: "Forbidden: Insufficient privileges. Only 'admin' or 'principal' roles can update user tags.",
          currentRole: requesterProfile.role,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 7. Payload Parsing & Validation
    const body: Partial<RequestPayload> = await req.json().catch(() => ({}));

    const { targetUserId, newTags } = body;

    if (!targetUserId || typeof targetUserId !== "string") {
      return new Response(
        JSON.stringify({
          error: "Bad Request: 'targetUserId' is required and must be a valid UUID string.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!newTags || typeof newTags !== "object" || Array.isArray(newTags)) {
      return new Response(
        JSON.stringify({
          error: "Bad Request: 'newTags' is required and must be a key-value JSON object.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 8. Fetch Target User's Existing Metadata
    const { data: targetProfile, error: targetFetchError } = await adminClient
      .from("profiles")
      .select("id, full_name, email, role, metadata")
      .eq("id", targetUserId)
      .single();

    if (targetFetchError || !targetProfile) {
      return new Response(
        JSON.stringify({
          error: `Not Found: Target user with ID '${targetUserId}' does not exist.`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 9. JSONB Merge: Merge newTags into existing metadata
    const currentMetadata =
      targetProfile.metadata &&
      typeof targetProfile.metadata === "object" &&
      !Array.isArray(targetProfile.metadata)
        ? targetProfile.metadata
        : {};

    const mergedMetadata = {
      ...currentMetadata,
      ...newTags,
    };

    // 10. Database Execution: Perform update bypassing RLS via service role
    const { data: updatedProfile, error: updateError } = await adminClient
      .from("profiles")
      .update({
        metadata: mergedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId)
      .select("id, full_name, role, email, metadata, updated_at")
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error: Failed to update metadata in profiles table",
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 11. Success Response
    return new Response(
      JSON.stringify({
        success: true,
        message: "User tags updated successfully.",
        updatedBy: {
          id: requesterProfile.id,
          name: requesterProfile.full_name,
          role: requesterProfile.role,
        },
        profile: updatedProfile,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Unhandled Edge Function error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
