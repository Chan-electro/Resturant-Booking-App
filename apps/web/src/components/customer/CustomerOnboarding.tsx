"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle, LocateFixed, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { usersApi } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { Address } from "@/lib/types";

type Profile = { name: string; phone?: string | null; email?: string };
type Coordinates = { lat: number; lng: number };

const emptyAddress = {
  label: "Home",
  street: "",
  city: "Bangalore",
  state: "Karnataka",
  zip: "",
  instructions: "",
};

export default function CustomerOnboarding({ children }: { children: ReactNode }) {
  const { state, dispatch } = useApp();
  const [checking, setChecking] = useState(true);
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [name, setName] = useState(state.userName === "Guest" ? "" : state.userName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(emptyAddress);

  useEffect(() => {
    let active = true;
    Promise.all([usersApi.profile(), usersApi.addresses()])
      .then(([profileResponse, addressResponse]) => {
        if (!active) return;
        const profile = profileResponse.data as Profile | undefined;
        const addresses = (addressResponse.data as Address[] | undefined) || [];
        if (profile?.name) setName(profile.name);
        if (profile?.phone) setPhone(profile.phone);
        setComplete(Boolean(profile?.name?.trim() && profile?.phone?.trim() && addresses.length > 0));
      })
      .catch(() => active && setError("Unable to check your profile. Please try again."))
      .finally(() => active && setChecking(false));
    return () => { active = false; };
  }, []);

  const captureLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported on this device. Enter your address manually.");
      return;
    }
    setLocationMessage("Finding your current location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ lat: coords.latitude, lng: coords.longitude });
        setLocationMessage("Location captured. Please confirm the written address for the delivery partner.");
      },
      (reason) => {
        const message = reason.code === reason.PERMISSION_DENIED
          ? "Location permission was denied. You can continue with manual address entry."
          : "We could not detect your location. Enter the address manually.";
        setCoordinates(null);
        setLocationMessage(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Enter your full name.");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) return setError("Enter a valid phone number.");
    if (!/^\d{6}$/.test(address.zip)) return setError("Enter a valid 6-digit PIN code.");

    setSaving(true);
    try {
      const profileResponse = await usersApi.updateProfile({ name: name.trim(), phone: phone.trim() });
      if (!profileResponse.success) throw new Error(profileResponse.error || "Unable to save your details");
      const addressResponse = await usersApi.addAddress({
        ...address,
        isDefault: true,
        ...(coordinates || {}),
      });
      if (!addressResponse.success) throw new Error(addressResponse.error || "Unable to save your address");
      dispatch({ type: "SET_USER", payload: { name: name.trim(), email: state.userEmail } });
      setComplete(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create your profile");
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream">
        <div className="flex items-center gap-3 font-bold text-maroon"><Loader2 className="h-5 w-5 animate-spin" /> Checking your profile…</div>
      </main>
    );
  }
  if (complete) return <>{children}</>;

  return (
    <main className="min-h-screen bg-cream px-4 py-8 md:py-12">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-ivory bg-white shadow-lg">
        <header className="bg-maroon px-6 py-8 text-cream md:px-10">
          <img src="/brand/wordmark-white.svg" alt="MS Brahmin Events" className="mb-6 h-10 w-auto" />
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">One-time setup</p>
          <h1 className="font-display text-3xl font-bold">Complete your customer profile</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-cream/70">We need a contact number and delivery address before you can place an order.</p>
        </header>

        <div className="space-y-6 p-6 md:p-10">
          <section className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-bold text-maroon">Full name
              <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-ivory bg-cream px-4 py-3 text-sm font-medium outline-none focus:border-gold" />
            </label>
            <label className="text-xs font-bold text-maroon">Phone number
              <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" className="mt-1.5 w-full rounded-xl border border-ivory bg-cream px-4 py-3 text-sm font-medium outline-none focus:border-gold" />
            </label>
          </section>

          <section className="space-y-4 border-t border-ivory pt-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div><h2 className="font-display text-xl font-bold text-maroon">Delivery address</h2><p className="mt-1 text-xs text-maroon/55">GPS improves accuracy, but the written address is still required.</p></div>
              <button type="button" onClick={captureLocation} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2.5 text-sm font-bold text-maroon hover:bg-gold/20"><LocateFixed className="h-4 w-4" /> Use current location</button>
            </div>
            {locationMessage && <p className="flex items-start gap-2 rounded-xl bg-cream px-4 py-3 text-xs font-medium text-maroon/70">{coordinates ? <CheckCircle className="h-4 w-4 shrink-0 text-green-600" /> : <MapPin className="h-4 w-4 shrink-0 text-gold" />}{locationMessage}</p>}
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-xs font-bold text-maroon">Label
                <select value={address.label} onChange={(event) => setAddress({ ...address, label: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ivory bg-cream px-4 py-3 text-sm font-medium outline-none focus:border-gold"><option>Home</option><option>Work</option><option>Other</option></select>
              </label>
              <label className="text-xs font-bold text-maroon md:col-span-2">House, street and locality
                <input required value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} placeholder="Flat 4B, 12th Main Road" className="mt-1.5 w-full rounded-xl border border-ivory bg-cream px-4 py-3 text-sm font-medium outline-none focus:border-gold" />
              </label>
              <label className="text-xs font-bold text-maroon">City
                <input required value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ivory bg-cream px-4 py-3 text-sm font-medium outline-none focus:border-gold" />
              </label>
              <label className="text-xs font-bold text-maroon">State
                <input required value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ivory bg-cream px-4 py-3 text-sm font-medium outline-none focus:border-gold" />
              </label>
              <label className="text-xs font-bold text-maroon">PIN code
                <input required inputMode="numeric" maxLength={6} value={address.zip} onChange={(event) => setAddress({ ...address, zip: event.target.value.replace(/\D/g, "") })} placeholder="560001" className="mt-1.5 w-full rounded-xl border border-ivory bg-cream px-4 py-3 text-sm font-medium outline-none focus:border-gold" />
              </label>
            </div>
            <label className="block text-xs font-bold text-maroon">Delivery instructions <span className="font-normal text-maroon/40">(optional)</span>
              <input value={address.instructions} onChange={(event) => setAddress({ ...address, instructions: event.target.value })} placeholder="Landmark, gate or floor details" className="mt-1.5 w-full rounded-xl border border-ivory bg-cream px-4 py-3 text-sm font-medium outline-none focus:border-gold" />
            </label>
          </section>

          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-3 border-t border-ivory pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-maroon/50"><ShieldCheck className="h-4 w-4 text-green-600" /> Used only for order and delivery communication.</p>
            <button disabled={saving} className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-maroon px-6 py-3.5 text-sm font-bold text-cream shadow-sm disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Saving…" : "Save and continue"}</button>
          </div>
        </div>
      </form>
    </main>
  );
}
