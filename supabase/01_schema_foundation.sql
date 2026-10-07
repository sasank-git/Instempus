-- ============================================================================
-- INSTEMPUS - SUPABASE POSTGRESQL FOUNDATION SCHEMA
-- File: 01_schema_foundation.sql
-- Description:
--   1. Core Tables: profiles, section_slots, student_enrollments, messages
--   2. Tagging Automation Trigger: Synchronizes slot_ids into profiles.metadata
--   3. Row-Level Security (RLS) with JSONB containment filter (@>) for broadcasts
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CORE TABLES
-- ============================================================================

-- Table 1: profiles (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'warden', 'canteen', 'hod', 'principal', 'security')),
  email TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 2: section_slots (Academic Classrooms / Slot Cohorts)
CREATE TABLE IF NOT EXISTS public.section_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  year INT NOT NULL CHECK (year >= 1 AND year <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 3: student_enrollments (Many-to-many link between students and slots)
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.section_slots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_student_slot UNIQUE (student_id, slot_id)
);

-- Table 4: messages (Polymorphic: Direct Messages & Filtered Broadcasts)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('broadcast', 'dm')),
  target_tags JSONB NOT NULL DEFAULT '{}'::jsonb,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chk_dm_recipient CHECK (message_type <> 'dm' OR recipient_id IS NOT NULL)
);

-- ============================================================================
-- INDEXES FOR FAST FILTERING AND JSONB CONTAINMENT (@>)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_metadata ON public.profiles USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_messages_target_tags ON public.messages USING GIN (target_tags);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student ON public.student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_slot ON public.student_enrollments(slot_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);

-- ============================================================================
-- 2. THE TAGGING AUTOMATION (POSTGRES TRIGGER)
-- Whenever a student is inserted into student_enrollments, this trigger
-- automatically appends the slot_id into profiles.metadata->'assigned_slots'.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_student_enrollment_tagging()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_slots JSONB;
  slot_id_text TEXT;
BEGIN
  slot_id_text := NEW.slot_id::text;

  -- 1. Fetch current assigned_slots array or default to empty array
  SELECT COALESCE(metadata->'assigned_slots', '[]'::jsonb)
  INTO current_slots
  FROM public.profiles
  WHERE id = NEW.student_id;

  -- If student profile doesn't exist, proceed without failing
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- 2. Append slot_id if not already present in the array
  IF NOT (current_slots ? slot_id_text) THEN
    UPDATE public.profiles
    SET 
      metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{assigned_slots}',
        COALESCE(metadata->'assigned_slots', '[]'::jsonb) || to_jsonb(slot_id_text),
        true
      ),
      updated_at = timezone('utc'::text, now())
    WHERE id = NEW.student_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_enrollment_tagging ON public.student_enrollments;
CREATE TRIGGER trg_student_enrollment_tagging
AFTER INSERT ON public.student_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.handle_student_enrollment_tagging();

-- Optional Unenrollment Handler: Keeps assigned_slots array pristine on deletion
CREATE OR REPLACE FUNCTION public.handle_student_unenrollment_tagging()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    metadata = jsonb_set(
      metadata,
      '{assigned_slots}',
      (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements_text(COALESCE(metadata->'assigned_slots', '[]'::jsonb)) AS elem
        WHERE elem <> OLD.slot_id::text
      ),
      true
    ),
    updated_at = timezone('utc'::text, now())
  WHERE id = OLD.student_id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_unenrollment_tagging ON public.student_enrollments;
CREATE TRIGGER trg_student_unenrollment_tagging
AFTER DELETE ON public.student_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.handle_student_unenrollment_tagging();

-- ============================================================================
-- 3. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper: Check if current authenticated user has an 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- Users can read all profiles but only update their own. Admins can update any.
-- ----------------------------------------------------------------------------

-- Read: Authenticated users can view all member profiles
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Update: Users can update their own profile; admins can update any profile
DROP POLICY IF EXISTS "Users can update own profile, admins can update any" ON public.profiles;
CREATE POLICY "Users can update own profile, admins can update any"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- Insert: Users can insert their own profile record (matching their auth.uid)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id OR public.is_admin());

-- ----------------------------------------------------------------------------
-- SECTION SLOTS POLICIES
-- ----------------------------------------------------------------------------

-- Read: All authenticated users can inspect SectionSlots
DROP POLICY IF EXISTS "Section slots are readable by authenticated users" ON public.section_slots;
CREATE POLICY "Section slots are readable by authenticated users"
ON public.section_slots
FOR SELECT
TO authenticated
USING (true);

-- Manage: Faculty and Admins can create/edit section slots
DROP POLICY IF EXISTS "Faculty and Admins can manage section slots" ON public.section_slots;
CREATE POLICY "Faculty and Admins can manage section slots"
ON public.section_slots
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'hod', 'principal')
  )
);

-- ----------------------------------------------------------------------------
-- STUDENT ENROLLMENTS POLICIES
-- ----------------------------------------------------------------------------

-- Read: Student can view their own enrollments; faculty & admins can view all
DROP POLICY IF EXISTS "Enrollments readable by enrolled student and staff" ON public.student_enrollments;
CREATE POLICY "Enrollments readable by enrolled student and staff"
ON public.student_enrollments
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'hod', 'principal')
  )
);

-- Manage: Admins, teachers, or students self-enrolling
DROP POLICY IF EXISTS "Authorized users can manage enrollments" ON public.student_enrollments;
CREATE POLICY "Authorized users can manage enrollments"
ON public.student_enrollments
FOR ALL
TO authenticated
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'hod', 'principal')
  )
);

-- ----------------------------------------------------------------------------
-- MESSAGES POLICIES (THE MAGIC FILTER)
-- DMs: auth.uid() must match recipient_id or sender_id.
-- Broadcasts: target_tags must be contained (@>) within profiles.metadata.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Messages visibility policy (DMs & Tagged Broadcasts)" ON public.messages;
CREATE POLICY "Messages visibility policy (DMs & Tagged Broadcasts)"
ON public.messages
FOR SELECT
TO authenticated
USING (
  -- 1. Direct Messages (1-on-1 DMs)
  (
    message_type = 'dm'
    AND (
      auth.uid() = recipient_id
      OR auth.uid() = sender_id
    )
  )
  OR
  -- 2. Broadcasts (The Magic Filter via JSONB containment)
  (
    message_type = 'broadcast'
    AND (
      -- Global broadcast with empty or wild-card tags
      target_tags IS NULL
      OR target_tags = '{}'::jsonb
      OR target_tags = '[]'::jsonb
      -- OR scholar's profile metadata contains the broadcast's target_tags
      -- e.g. {"assigned_slots": ["slot_uuid"]} OR {"department": "CSE"}
      OR (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND (
            -- Exact metadata containment:
            p.metadata @> messages.target_tags
            -- Or if target_tags is an array of slots, match against assigned_slots:
            OR (
              jsonb_typeof(messages.target_tags) = 'array'
              AND COALESCE(p.metadata->'assigned_slots', '[]'::jsonb) @> messages.target_tags
            )
          )
        )
      )
      -- The sender or staff/admins can always read broadcasts they created or moderate
      OR sender_id = auth.uid()
      OR public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'hod', 'principal')
      )
    )
  )
);

-- Insert: Senders can insert messages where sender_id matches their authenticated UID
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
);

-- Delete: Senders or Admins can delete their messages
DROP POLICY IF EXISTS "Senders or admins can delete messages" ON public.messages;
CREATE POLICY "Senders or admins can delete messages"
ON public.messages
FOR DELETE
TO authenticated
USING (
  auth.uid() = sender_id OR public.is_admin()
);

-- ============================================================================
-- 4. BONUS HELPER: AUTOMATIC USER PROFILE PROVISIONING ON AUTH SIGNUP
-- Automatically creates a public.profiles entry whenever a user signs up.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, metadata)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->'metadata', '{}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
