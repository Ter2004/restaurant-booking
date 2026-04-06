-- ============================================================
-- Restaurant Booking Platform — Initial Schema Migration
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL UNIQUE,
    full_name   TEXT,
    phone       TEXT,
    role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin')),
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    description   TEXT,
    cuisine_type  TEXT NOT NULL,
    address       TEXT NOT NULL,
    city          TEXT NOT NULL,
    phone         TEXT,
    email         TEXT,
    image_url     TEXT,
    capacity      INTEGER NOT NULL DEFAULT 0,
    opening_time  TIME NOT NULL DEFAULT '09:00',
    closing_time  TIME NOT NULL DEFAULT '22:00',
    open_days     TEXT[] NOT NULL DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday'],
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tables (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number  INTEGER NOT NULL,
    seats         INTEGER NOT NULL CHECK (seats > 0),
    zone          TEXT NOT NULL DEFAULT 'main' CHECK (zone IN ('main', 'outdoor', 'private', 'bar')),
    is_available  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (restaurant_id, table_number)
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    restaurant_id   UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id        UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    booking_date    DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    party_size      INTEGER NOT NULL CHECK (party_size > 0),
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    special_requests TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for conflict detection
CREATE INDEX IF NOT EXISTS idx_bookings_table_date
    ON public.bookings (table_id, booking_date, status)
    WHERE status NOT IN ('cancelled');

CREATE INDEX IF NOT EXISTS idx_bookings_customer
    ON public.bookings (customer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_restaurant
    ON public.bookings (restaurant_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id    UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title         TEXT,
    body          TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant
    ON public.reviews (restaurant_id);

-- ============================================================
-- TRIGGERS — auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_tables_updated_at
    BEFORE UPDATE ON public.tables
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TRIGGER — auto create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews     ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql STABLE AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ---- PROFILES ----
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    USING (id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- ---- RESTAURANTS ----
CREATE POLICY "restaurants_select_all"
    ON public.restaurants FOR SELECT
    USING (is_active = TRUE OR owner_id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "restaurants_insert_owner"
    ON public.restaurants FOR INSERT
    WITH CHECK (
        owner_id = auth.uid()
        AND public.current_user_role() IN ('owner', 'admin')
    );

CREATE POLICY "restaurants_update_owner"
    ON public.restaurants FOR UPDATE
    USING (owner_id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "restaurants_delete_owner"
    ON public.restaurants FOR DELETE
    USING (owner_id = auth.uid() OR public.current_user_role() = 'admin');

-- ---- TABLES ----
CREATE POLICY "tables_select_all"
    ON public.tables FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = restaurant_id AND (r.is_active OR r.owner_id = auth.uid())
        )
    );

CREATE POLICY "tables_insert_owner"
    ON public.tables FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
        )
    );

CREATE POLICY "tables_update_owner"
    ON public.tables FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
        ) OR public.current_user_role() = 'admin'
    );

CREATE POLICY "tables_delete_owner"
    ON public.tables FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
        ) OR public.current_user_role() = 'admin'
    );

-- ---- BOOKINGS ----
CREATE POLICY "bookings_select"
    ON public.bookings FOR SELECT
    USING (
        customer_id = auth.uid()
        OR public.current_user_role() = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
        )
    );

CREATE POLICY "bookings_insert_customer"
    ON public.bookings FOR INSERT
    WITH CHECK (
        customer_id = auth.uid()
        AND public.current_user_role() IN ('customer', 'admin')
    );

CREATE POLICY "bookings_update"
    ON public.bookings FOR UPDATE
    USING (
        customer_id = auth.uid()
        OR public.current_user_role() = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
        )
    );

CREATE POLICY "bookings_delete_customer"
    ON public.bookings FOR DELETE
    USING (customer_id = auth.uid() OR public.current_user_role() = 'admin');

-- ---- REVIEWS ----
CREATE POLICY "reviews_select_all"
    ON public.reviews FOR SELECT USING (TRUE);

CREATE POLICY "reviews_insert_customer"
    ON public.reviews FOR INSERT
    WITH CHECK (
        customer_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id
              AND b.customer_id = auth.uid()
              AND b.status = 'completed'
        )
    );

CREATE POLICY "reviews_update_own"
    ON public.reviews FOR UPDATE
    USING (customer_id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "reviews_delete_own"
    ON public.reviews FOR DELETE
    USING (customer_id = auth.uid() OR public.current_user_role() = 'admin');
