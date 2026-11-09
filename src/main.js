import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Bell, CalendarCheck, CalendarDays,
  CheckCircle2, ChevronDown, Clock3, Eye, Heart, HeartHandshake, House, Info, LogOut, MapPin,
  Mail, MessageCircle, Pencil, Phone, Plus, RotateCcw, Search, ShieldCheck, Sparkles, Star, Store, Trash2, UserRound, X, createIcons,
} from "lucide";
import "./style.css";
import "./dashboard.css";
import "./service-images.css";
import "./store-contact.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const demoMode = !supabase;
const appIcons = {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Bell, CalendarCheck, CalendarDays,
  CheckCircle2, ChevronDown, Clock3, Eye, Heart, HeartHandshake, House, Info, LogOut, MapPin,
  Mail, MessageCircle, Pencil, Phone, Plus, RotateCcw, Search, ShieldCheck, Sparkles, Star, Store, Trash2, UserRound, X,
};
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const categories = [
  { name: "Unhas", icon: "✳", query: "Manicure" },
  { name: "Cabelos", icon: "⌁", query: "Cabelo" },
  { name: "Sobrancelhas", icon: "◠", query: "Sobrancelha" },
  { name: "Maquiagem", icon: "✧", query: "Maquiagem" },
  { name: "Cílios", icon: "◉", query: "Cílios" },
  { name: "Pele & estética", icon: "❋", query: "Estética" },
  { name: "Massagem", icon: "〰", query: "Massagem" },
  { name: "Depilação", icon: "✦", query: "Depilação" },
];

const seedStores = [
  { id: "studio-luna", name: "Studio Luna", owner_name: "Marina Costa", category: "Unhas", city: "Pinheiros, São Paulo", rating: 4.9, review_count: 128, image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=960&q=80", description: "Um respiro na sua rotina. Especialistas em cuidado, cor e autoestima.", service: "Manicure em gel", price: 95, duration_minutes: 60, featured: true },
  { id: "casa-aurora", name: "Casa Aurora", owner_name: "Bianca Almeida", category: "Cabelos", city: "Vila Madalena, São Paulo", rating: 4.8, review_count: 96, image_url: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=960&q=80", description: "Beleza leve, feita para realçar quem você já é.", service: "Corte + escova", price: 150, duration_minutes: 75, featured: true },
  { id: "atelier-bela", name: "Ateliê Bela", owner_name: "Camila Rocha", category: "Sobrancelhas", city: "Jardins, São Paulo", rating: 5.0, review_count: 74, image_url: "https://images.unsplash.com/photo-1583001809873-a128495da465?auto=format&fit=crop&w=960&q=80", description: "Design que respeita sua beleza natural, em cada detalhe.", service: "Design de sobrancelhas", price: 75, duration_minutes: 45, featured: true },
  { id: "flor-de-pele", name: "Flor de Pele", owner_name: "Isabela Nunes", category: "Estética", city: "Moema, São Paulo", rating: 4.9, review_count: 112, image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=960&q=80", description: "Rituais de cuidado e bem-estar para você se sentir em casa.", service: "Limpeza de pele", price: 180, duration_minutes: 90, featured: true },
  { id: "studio-amora", name: "Studio Amora", owner_name: "Luiza Martins", category: "Maquiagem", city: "Itaim Bibi, São Paulo", rating: 4.9, review_count: 83, image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=960&q=80", description: "Maquiagem para momentos que merecem ser lembrados.", service: "Maquiagem social", price: 220, duration_minutes: 90, featured: false },
  { id: "essenza", name: "Essenza Terapias", owner_name: "Renata Oliveira", category: "Massagem", city: "Perdizes, São Paulo", rating: 4.8, review_count: 65, image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=960&q=80", description: "Seu tempo de pausa, equilíbrio e renovação.", service: "Massagem relaxante", price: 160, duration_minutes: 60, featured: false },
];

const state = {
  stores: demoMode ? [...seedStores] : [],
  services: [],
  ownedStores: [],
  storeReviewStats: [],
  page: "home",
  query: "",
  category: "",
  sort: "recommended",
  location: localStorage.getItem("vellora-location") || "São Paulo, SP",
  customerCoordinates: JSON.parse(localStorage.getItem("vellora-location-coordinates") || "null"),
  pendingStoreCoordinates: null,
  user: null,
  profile: null,
  favorites: JSON.parse(localStorage.getItem("vellora-favorites") || "[]"),
  appointments: JSON.parse(localStorage.getItem("vellora-appointments") || "[]"),
  notifications: [],
  serviceLikes: [],
  serviceReviews: [],
  reviewAppointmentId: "",
  editingReviewId: "",
  reviewPromptedAppointmentIds: [],
  reviewDraftFiles: [],
  reviewDraftPreviews: [],
  reviewRemovedImageUrls: [],
  reviewedAppointmentIds: [],
  storeHours: [],
  blockedTimes: [],
  selectedStoreHours: null,
  selectedBlockedTimes: [],
  proposingAppointmentId: "",
  selectedStore: null,
  selectedService: null,
  selectedDate: dateKey(new Date()),
  selectedTime: "",
  bookedSlots: [],
  authMode: "",
  authRole: "customer",
  accountMenu: false,
  bookingStep: 0,
  notice: "",
  installPrompt: null,
  editingService: null,
  viewingService: null,
};
let appointmentMigrationNoticeShown = false;
let engagementMigrationNoticeShown = false;
let storeProfileMigrationNoticeShown = false;
let reviewCheckInProgress = false;

const app = document.querySelector("#app");
const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;

function notify(message) {
  state.notice = message;
  render();
  window.setTimeout(() => {
    if (state.notice === message) {
      state.notice = "";
      render();
    }
  }, 3000);
}

function distanceBetweenCoordinates(first, second) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latitudeDifference = toRadians(second.latitude - first.latitude);
  const longitudeDifference = toRadians(second.longitude - first.longitude);
  const latitude1 = toRadians(first.latitude);
  const latitude2 = toRadians(second.latitude);
  const haversine = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDifference / 2) ** 2;
  const boundedHaversine = Math.min(1, Math.max(0, haversine));
  return 6371 * 2 * Math.atan2(Math.sqrt(boundedHaversine), Math.sqrt(1 - boundedHaversine));
}

function storeDistance(store) {
  if (!state.customerCoordinates || !hasStoreCoordinates(store)) return null;
  return distanceBetweenCoordinates(state.customerCoordinates, {
    latitude: Number(store.latitude),
    longitude: Number(store.longitude),
  });
}

function hasStoreCoordinates(store) {
  return store.latitude !== null && store.latitude !== undefined && store.latitude !== ""
    && store.longitude !== null && store.longitude !== undefined && store.longitude !== ""
    && Number.isFinite(Number(store.latitude)) && Number.isFinite(Number(store.longitude))
    && Number(store.latitude) >= -90 && Number(store.latitude) <= 90
    && Number(store.longitude) >= -180 && Number(store.longitude) <= 180;
}

function normalizedLocation(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function storeMatchesLocation(store) {
  const locationTokens = normalizedLocation(state.location)
    .split(/[,\-]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !["sp", "brasil", "br"].includes(token));
  if (!locationTokens.length) return false;
  const storeLocation = normalizedLocation(`${store.city || ""} ${store.address || ""}`);
  return locationTokens.some((token) => storeLocation.includes(token));
}

function sortStoresByProximity(stores) {
  if (!state.customerCoordinates && !state.location.trim()) return stores;
  return stores.map((store, index) => ({
    store,
    index,
    locationMatch: storeMatchesLocation(store),
    distance: storeDistance(store),
  })).sort((first, second) => {
    if (first.locationMatch !== second.locationMatch) return Number(second.locationMatch) - Number(first.locationMatch);
    if (first.distance !== null && second.distance !== null && first.distance !== second.distance) {
      return first.distance - second.distance;
    }
    if (first.distance !== null && second.distance === null) return -1;
    if (first.distance === null && second.distance !== null) return 1;
    return first.index - second.index;
  }).map((item) => item.store);
}

function captureCurrentLocation({ store = false } = {}) {
  if (!navigator.geolocation) {
    if (store) {
      const status = document.querySelector(".store-location-status");
      if (status) status.textContent = "Este navegador não oferece acesso à localização. Informe o endereço manualmente.";
    } else {
      notify("Este navegador não oferece acesso à localização. Informe sua cidade ou bairro manualmente.");
    }
    return;
  }
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    const coordinates = { latitude: coords.latitude, longitude: coords.longitude };
    if (store) {
      state.pendingStoreCoordinates = coordinates;
      const latitude = document.querySelector('#store-form input[name="latitude"], #store-settings-form input[name="latitude"]');
      const longitude = document.querySelector('#store-form input[name="longitude"], #store-settings-form input[name="longitude"]');
      if (latitude && longitude) {
        latitude.value = String(coordinates.latitude);
        longitude.value = String(coordinates.longitude);
      }
      const status = document.querySelector(".store-location-status");
      if (status) status.textContent = "Localização capturada. Salve o formulário para publicar o ponto no mapa.";
      return;
    }
    state.customerCoordinates = coordinates;
    state.location = "Minha localização";
    try {
      localStorage.setItem("vellora-location", state.location);
      localStorage.setItem("vellora-location-coordinates", JSON.stringify(coordinates));
    } catch (error) {
      console.error("Falha ao salvar localização neste navegador:", error);
      notify("A localização está ativa nesta sessão, mas não foi possível salvá-la neste navegador.");
      render();
      return;
    }
    state.locationModal = false;
    notify("Localização atualizada. As lojas mais próximas aparecem primeiro.");
  }, (error) => {
    console.error("Falha ao obter localização do navegador:", error);
    const message = error.code === error.PERMISSION_DENIED
      ? "Permita o acesso à localização ou informe sua cidade/bairro e endereço manualmente."
      : "Não foi possível obter a localização. Informe o endereço da loja manualmente.";
    if (store) {
      const status = document.querySelector(".store-location-status");
      if (status) status.textContent = message;
    } else {
      notify(message);
    }
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 });
}

async function loadBackend() {
  if (!supabase) return;
  try {
    const [{ data: stores, error: storesError }, { data: sessionData }] = await Promise.all([
      supabase.from("stores").select("*, services(*)").eq("is_active", true),
      supabase.auth.getSession(),
    ]);
    if (storesError) throw storesError;
    if (stores?.length) {
      state.stores = stores.map((store) => {
        const services = store.services || [];
        const firstActiveService = services.find((service) => service.is_active !== false) || services[0];
        return { ...store, service: firstActiveService?.name || store.category, price: firstActiveService?.price || 0, duration_minutes: firstActiveService?.duration_minutes || 60 };
      });
      state.services = stores.flatMap((store) => store.services || []);
    } else { state.stores = []; state.services = []; }
    await loadStoreReviewStats();
    if (sessionData.session) await loadUser(sessionData.session.user);
    supabase.auth.onAuthStateChange((_event, session) => {
      state.user = session?.user || null;
      if (state.user) loadUser(state.user).then(render);
      else {
        state.profile = null;
        state.reviewAppointmentId = "";
        state.editingReviewId = "";
        state.reviewPromptedAppointmentIds = [];
        render();
      }
    });
    render();
  } catch (error) {
    console.error("Não foi possível carregar os dados do Supabase:", error);
    notify("Não foi possível conectar à plataforma. Tente novamente.");
  }
}

function applyStoreReviewStats(stats) {
  state.storeReviewStats = stats;
  const statsByStore = new Map(stats.map((item) => [item.store_id, item]));
  const updateStore = (store) => {
    const stat = statsByStore.get(store.id);
    if (stat) return { ...store, rating: Number(stat.rating), review_count: Number(stat.review_count) };
    return demoMode ? store : { ...store, rating: null, review_count: 0 };
  };
  state.stores = state.stores.map(updateStore);
  state.ownedStores = state.ownedStores.map(updateStore);
  if (state.selectedStore) {
    state.selectedStore = state.stores.find((store) => store.id === state.selectedStore.id)
      || state.ownedStores.find((store) => store.id === state.selectedStore.id)
      || state.selectedStore;
  }
}

async function loadStoreReviewStats() {
  if (demoMode) {
    const grouped = new Map();
    for (const review of state.serviceReviews) {
      if (!review.store_id) continue;
      const current = grouped.get(review.store_id) || { store_id: review.store_id, total: 0, review_count: 0 };
      current.total += Number(review.rating) || 0;
      current.review_count += 1;
      grouped.set(review.store_id, current);
    }
    applyStoreReviewStats([...grouped.values()].map((item) => ({
      ...item,
      rating: Number((item.total / item.review_count).toFixed(1)),
    })));
    return;
  }
  const { data, error } = await supabase.from("store_review_stats")
    .select("store_id, rating, review_count");
  if (error) {
    if (["42P01", "PGRST205", "42703", "PGRST204"].includes(error.code)) {
      const { data: reviews, error: reviewsError } = await supabase.from("service_reviews").select("store_id, rating");
      if (!reviewsError) {
        const grouped = new Map();
        for (const review of reviews || []) {
          const current = grouped.get(review.store_id) || { store_id: review.store_id, total: 0, review_count: 0 };
          current.total += Number(review.rating) || 0;
          current.review_count += 1;
          grouped.set(review.store_id, current);
        }
        applyStoreReviewStats([...grouped.values()].map((item) => ({
          ...item,
          rating: Number((item.total / item.review_count).toFixed(1)),
        })));
        if (!storeProfileMigrationNoticeShown) {
          storeProfileMigrationNoticeShown = true;
          notify("As avaliações foram carregadas. Execute supabase/store-profile-and-review-stats.sql para editar e-mail e contatos da loja.");
        }
        return;
      }
      console.error("Falha ao carregar avaliações para a vitrine:", reviewsError);
      if (!storeProfileMigrationNoticeShown) {
        storeProfileMigrationNoticeShown = true;
        notify("Execute supabase/service-engagement.sql e supabase/store-profile-and-review-stats.sql para habilitar avaliações e contatos na vitrine.");
      }
    } else {
      console.error("Falha ao carregar as avaliações da vitrine:", error);
      notify("Não foi possível atualizar as avaliações da página inicial.");
    }
    return;
  }
  applyStoreReviewStats(data || []);
}

function updateStoreReviewStats(storeId, reviews) {
  const storeReviews = reviews.filter((review) => review.store_id === storeId);
  if (!storeReviews.length) return;
  const stat = {
    rating: Number((storeReviews.reduce((sum, review) => sum + Number(review.rating), 0) / storeReviews.length).toFixed(1)),
    review_count: storeReviews.length,
  };
  const update = (store) => store.id === storeId ? { ...store, ...stat } : store;
  state.stores = state.stores.map(update);
  state.ownedStores = state.ownedStores.map(update);
  state.storeReviewStats = [...state.storeReviewStats.filter((item) => item.store_id !== storeId), { store_id: storeId, ...stat }];
  if (state.selectedStore?.id === storeId) state.selectedStore = update(state.selectedStore);
}

function adjustStoreReviewStats(review, previousReview) {
  const update = (store) => {
    if (store.id !== review.store_id) return store;
    const previousCount = Number(store.review_count || 0);
    const nextCount = Math.max(0, previousCount + (previousReview ? 0 : 1));
    const previousTotal = Number(store.rating || 0) * previousCount;
    const nextTotal = previousTotal - Number(previousReview?.rating || 0) + Number(review.rating);
    return { ...store, review_count: nextCount, rating: nextCount ? Number((nextTotal / nextCount).toFixed(1)) : null };
  };
  state.stores = state.stores.map(update);
  state.ownedStores = state.ownedStores.map(update);
  const updatedStore = state.stores.find((store) => store.id === review.store_id)
    || state.ownedStores.find((store) => store.id === review.store_id);
  if (updatedStore) {
    state.storeReviewStats = [...state.storeReviewStats.filter((item) => item.store_id !== review.store_id), {
      store_id: review.store_id,
      rating: updatedStore.rating,
      review_count: updatedStore.review_count,
    }];
  }
  if (state.selectedStore?.id === review.store_id) state.selectedStore = update(state.selectedStore);
}

async function loadUser(user) {
  state.user = user;
  if (!supabase) return;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  state.profile = data;
  const [{ data: bookings, error: bookingError }, { data: ownedStores, error: storeError }, { data: favorites, error: favoritesError }] = await Promise.all([
    supabase.from("appointments").select("*, stores(name), services(name, price)").order("appointment_date", { ascending: true }),
    supabase.from("stores").select("*, services(*)").eq("owner_id", user.id),
    supabase.from("favorites").select("store_id").eq("customer_id", user.id),
  ]);
  if (bookingError) throw bookingError;
  if (storeError) throw storeError;
  if (favoritesError) throw favoritesError;
  state.appointments = bookings || [];
  state.reviewedAppointmentIds = [];
  state.ownedStores = ownedStores || [];
  applyStoreReviewStats(state.storeReviewStats);
  state.notifications = await loadNotifications(user.id);
  if (state.ownedStores.length) {
    const storeIds = state.ownedStores.map((store) => store.id);
    const [{ data: hours, error: hoursError }, { data: blocked, error: blockedError }] = await Promise.all([
      supabase.from("store_hours").select("*").in("store_id", storeIds).order("weekday"),
      supabase.from("blocked_times").select("*").in("store_id", storeIds).order("starts_at", { ascending: true }),
    ]);
    if (hoursError) throw hoursError;
    if (blockedError) throw blockedError;
    state.storeHours = hours || [];
    state.blockedTimes = blocked || [];
  } else {
    state.storeHours = [];
    state.blockedTimes = [];
  }
  for (const ownedStore of state.ownedStores) {
    for (const service of ownedStore.services || []) {
      if (!state.services.some((item) => item.id === service.id)) state.services.push(service);
    }
  }
  if (favorites) state.favorites = favorites.map((favorite) => favorite.store_id);
  if (state.appointments.length) {
    const appointmentIds = state.appointments.map((appointment) => appointment.id);
    if (demoMode) {
      const reviews = JSON.parse(localStorage.getItem("vellora-service-reviews") || "[]");
      state.reviewedAppointmentIds = reviews.map((review) => review.appointment_id);
    } else {
      const { data: reviews, error: reviewsError } = await supabase.from("reviews").select("appointment_id").eq("customer_id", user.id).in("appointment_id", appointmentIds);
      if (reviewsError && !["42P01", "PGRST205"].includes(reviewsError.code)) throw reviewsError;
      state.reviewedAppointmentIds = (reviews || []).map((review) => review.appointment_id);
    }
  }
  openNextReviewPrompt();
}

function openNextReviewPrompt() {
  if (!state.user || state.user.is_anonymous || isProfessionalRole(state.profile) || state.reviewAppointmentId || state.editingReviewId) return;
  const appointment = state.appointments.find((item) =>
    item.customer_id === state.user.id
    && item.status === "completed"
    && !state.reviewedAppointmentIds.includes(item.id)
    && !state.reviewPromptedAppointmentIds.includes(item.id));
  if (!appointment) return;
  state.reviewPromptedAppointmentIds.push(appointment.id);
  state.reviewAppointmentId = appointment.id;
}

async function checkCompletedAppointmentsForReview() {
  const user = state.user;
  if (reviewCheckInProgress || demoMode || !user || user.is_anonymous || isProfessionalRole(state.profile)) return;
  reviewCheckInProgress = true;
  try {
    const { data: completed, error } = await supabase.from("appointments")
      .select("*, stores(name), services(name, price)")
      .eq("customer_id", user.id)
      .eq("status", "completed")
      .order("appointment_date", { ascending: false });
    if (error) {
      console.error("Falha ao verificar atendimentos concluídos para avaliação:", error);
      return;
    }
    if (state.user?.id !== user.id || !completed?.length) return;

    const appointmentIds = completed.map((item) => item.id);
    const { data: reviews, error: reviewsError } = await supabase.from("reviews")
      .select("appointment_id")
      .eq("customer_id", user.id)
      .in("appointment_id", appointmentIds);
    if (reviewsError) {
      console.error("Falha ao verificar avaliações existentes:", reviewsError);
      return;
    }

    const mergedAppointments = new Map(state.appointments.map((item) => [item.id, item]));
    let appointmentsChanged = false;
    completed.forEach((item) => {
      const current = mergedAppointments.get(item.id);
      if (!current || current.status !== item.status) appointmentsChanged = true;
      mergedAppointments.set(item.id, item);
    });
    state.appointments = [...mergedAppointments.values()];
    const previousReviewed = state.reviewedAppointmentIds.length;
    state.reviewedAppointmentIds = [...new Set([
      ...state.reviewedAppointmentIds,
      ...(reviews || []).map((item) => item.appointment_id),
    ])];
    const previousPrompt = state.reviewAppointmentId;
    openNextReviewPrompt();
    if (appointmentsChanged || previousReviewed !== state.reviewedAppointmentIds.length
      || previousPrompt !== state.reviewAppointmentId) render();
  } finally {
    reviewCheckInProgress = false;
  }
}

async function loadServiceEngagement(store) {
  const services = state.services.filter((service) => service.store_id === store.id);
  const serviceIds = services.length ? services.map((service) => service.id) : (store.services || []).map((service) => service.id);
  if (!serviceIds.length) {
    state.serviceLikes = [];
    state.serviceReviews = [];
    return;
  }
  if (demoMode) {
    const allLikes = JSON.parse(localStorage.getItem("vellora-service-likes") || "[]");
    const allReviews = JSON.parse(localStorage.getItem("vellora-service-reviews") || "[]");
    state.serviceLikes = allLikes.filter((like) => serviceIds.includes(like.service_id));
    state.serviceReviews = allReviews.filter((review) => review.store_id === store.id || serviceIds.includes(review.service_id));
    return;
  }
  const [{ data: likes, error: likesError }, { data: reviews, error: reviewsError }] = await Promise.all([
    supabase.from("service_like_counts").select("service_id, like_count").in("service_id", serviceIds),
    supabase.from("service_reviews").select("id, appointment_id, store_id, service_id, service_name, reviewer_name, rating, comment, image_urls, created_at").eq("store_id", store.id).order("created_at", { ascending: false }),
  ]);
  const error = likesError || reviewsError;
  if (error) {
    if (["42P01", "PGRST205", "42703", "PGRST204"].includes(error.code)) {
      state.serviceLikes = [];
      state.serviceReviews = [];
      if (!engagementMigrationNoticeShown) {
        engagementMigrationNoticeShown = true;
        notify("Execute supabase/service-engagement.sql no Supabase para ativar curtidas e avaliações.");
      }
      return;
    }
    console.error("Falha ao carregar curtidas e avaliações:", error);
    notify("Não foi possível carregar as avaliações deste serviço.");
    return;
  }
  let ownLikes = [];
  if (state.user && !state.user.is_anonymous && !isProfessionalRole(state.profile)) {
    const { data, error: ownLikesError } = await supabase.from("service_likes").select("service_id").eq("customer_id", state.user.id).in("service_id", serviceIds);
    if (ownLikesError) {
      console.error("Falha ao carregar curtidas da cliente:", ownLikesError);
      notify("Não foi possível carregar suas curtidas.");
      return;
    }
    ownLikes = (data || []).map((like) => ({ ...like, customer_id: state.user.id }));
  }
  state.serviceLikes = [...(likes || []), ...ownLikes];
  state.serviceReviews = reviews || [];
}

async function loadNotifications(userId) {
  const { data, error } = await supabase.from("notifications")
    .select("id, kind, title, body, read_at, created_at, appointment_id, recipient_id")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (!error) return data || [];
  if (error.code !== "42703" || !error.message?.includes("notifications.appointment_id")) throw error;

  if (!appointmentMigrationNoticeShown) {
    appointmentMigrationNoticeShown = true;
    notify("Aplique supabase/appointment-availability.sql no Supabase para ativar as notificações de agenda e propostas de horário.");
  }
  const { data: legacyNotifications, error: legacyError } = await supabase.from("notifications")
    .select("id, kind, title, body, read_at, created_at, recipient_id")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (legacyError) throw legacyError;
  return legacyNotifications || [];
}

function header() {
  return `<header class="topbar">
    <a class="brand" href="#" data-action="home" aria-label="Vellora início"><span class="brand-mark">v</span><span>vellora<span class="brand-dot">.</span></span></a>
    <nav class="desktop-nav"><a class="${state.page === "home" ? "active" : ""}" href="#" data-action="home">Início</a><a href="#explorar" data-action="explore">Explorar</a><a href="#como-funciona" data-action="how">Como funciona</a></nav>
    <button class="location-button" data-action="location">${icon("map-pin", 16)}<span>${escapeHtml(state.location)}</span>${icon("chevron-down", 14)}</button>
    <div class="top-actions">${state.user ? `<button class="icon-button notification-button" aria-label="Notificações" data-action="notifications">${icon("bell", 19)}${state.notifications.some((item) => !item.read_at && (!item.recipient_id || item.recipient_id === state.user.id)) ? '<span class="notification-dot"></span>' : ""}</button><div class="account-menu-wrap"><button class="avatar-button" data-action="account-menu" aria-label="Abrir menu da conta" aria-haspopup="menu" aria-expanded="${state.accountMenu}">${escapeHtml((state.profile?.full_name || state.user.email || "V").slice(0, 1).toUpperCase())}</button>${state.accountMenu ? `<div class="account-menu" role="menu"><span>${escapeHtml(state.profile?.full_name || state.user.email || "Minha conta")}</span><button data-action="profile" role="menuitem">${isProfessionalRole(state.profile) ? "Painel profissional" : "Minha conta"}</button><button data-action="appointments" role="menuitem">Meus agendamentos</button><button class="account-menu-logout" data-action="logout" role="menuitem">${icon("log-out", 16)} Sair da conta</button></div>` : ""}</div></div>` : `<button class="text-button login-button" data-action="login">Entrar como cliente</button><button class="button button-dark header-join professional-login-button" data-action="login-professional">Área profissional</button><button class="button button-dark header-join" data-action="signup">Criar conta</button>`}</div>
  </header>`;
}

function storeCard(store) {
  const favorited = state.favorites.includes(store.id);
  const reviewCount = Number(store.review_count || 0);
  const rating = reviewCount ? Number(store.rating).toFixed(1) : "—";
  const storeServices = state.services.some((service) => service.store_id === store.id)
    ? state.services.filter((service) => service.store_id === store.id)
    : store.services || [];
  const primaryService = storeServices.find((service) => service.is_active !== false) || storeServices[0];
  const image = primaryService?.image_url || store.image_url || seedStores[0].image_url;
  return `<article class="store-card">
    <button class="store-image-button" data-action="store" data-id="${escapeHtml(store.id)}" aria-label="Ver loja ${escapeHtml(store.name)}">
      <img class="store-image" src="${escapeHtml(image)}" alt="${escapeHtml(primaryService?.name ? `${store.name} — ${primaryService.name}` : store.name)}" loading="lazy">
      ${store.featured ? '<span class="featured-pill">Em destaque</span>' : ""}
    </button>
    <button class="favorite-button ${favorited ? "is-favorite" : ""}" data-action="favorite" data-id="${escapeHtml(store.id)}" aria-label="${favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}">${icon(favorited ? "heart-handshake" : "heart", 18)}</button>
    <button class="store-info" data-action="store" data-id="${escapeHtml(store.id)}">
      <span class="store-title-row"><strong>${escapeHtml(store.name)}</strong><span class="rating">${icon("star", 14)} ${rating}<small>(${reviewCount})</small></span></span>
      <span class="store-location">${escapeHtml(store.category || "Beleza")} <span>·</span> ${escapeHtml(store.city || "Atendimento com hora marcada")}</span>
      <span class="store-service">${escapeHtml(store.service || "Serviços de beleza")} <b>a partir de ${money(store.price || 0)}</b></span>
    </button>
  </article>`;
}

function categoryCards() {
  return categories.map((item, index) => `<button class="category-item ${state.category === item.query ? "selected" : ""}" data-action="category" data-category="${escapeHtml(item.query)}">
    <span class="category-icon category-${index}">${item.icon}</span><span>${item.name}</span>
  </button>`).join("");
}

function homePage() {
  const matching = filteredStores();
  const featured = matching.filter((store) => store.featured).slice(0, 4);
  const popular = matching.slice(0, 4);
  return `<main>
    <section class="hero">
      <div class="hero-copy"><span class="eyebrow"><span class="eyebrow-line"></span> SEU MOMENTO, DO SEU JEITO</span>
        <h1>Beleza que<br>encontra <em>você.</em></h1>
        <p>Encontre profissionais incríveis, pertinho de você. Seu próximo momento de autocuidado começa aqui.</p>
        <div class="search-panel">
          <label class="search-field">${icon("search", 19)}<input id="hero-search" type="search" placeholder="Serviço, profissional ou espaço..." value="${escapeHtml(state.query)}" aria-label="Buscar serviço ou profissional"></label>
          <span class="search-divider"></span>
          <button class="search-location" data-action="location">${icon("map-pin", 18)}<span>${escapeHtml(state.location)}</span></button>
          <button class="search-submit" data-action="search" aria-label="Buscar">${icon("arrow-right", 19)}</button>
        </div>
        <span class="hero-note">${icon("shield-check", 15)} Profissionais avaliadas por clientes reais</span>
      </div>
      <div class="hero-art"><img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85" alt="Mulher aproveitando um momento de beleza" fetchpriority="high"><div class="hero-image-tint"></div><div class="hero-quote"><span class="quote-star">✳</span><span>Um lugar para<br><em>florescer.</em></span></div><div class="floating-rating"><span class="floating-stars">★★★★★</span><span><b>4,9/5</b> <small>avaliação média</small></span></div></div>
    </section>
    ${notificationFeed()}
    <section class="category-section"><div class="section-heading"><div><span class="eyebrow">UM UNIVERSO DE CUIDADO</span><h2>O que você está buscando?</h2></div><button class="link-button" data-action="explore">Ver tudo ${icon("arrow-up-right", 15)}</button></div><div class="category-grid">${categoryCards()}</div></section>
    <section class="listing-section" id="explorar"><div class="section-heading"><div><span class="eyebrow">SELECIONADOS PARA VOCÊ</span><h2>Espaços que amamos</h2></div><button class="link-button" data-action="explore">Explorar todos ${icon("arrow-up-right", 15)}</button></div><div class="store-grid">${featured.length ? featured.map(storeCard).join("") : `<div class="empty-state">Nenhum espaço encontrado. Experimente outra busca.</div>`}</div></section>
    <section class="editorial-banner"><div class="editorial-copy"><span class="eyebrow">PARA QUEM FAZ A BELEZA ACONTECER</span><h2>Seu talento merece<br>um espaço só seu.</h2><p>Crie sua loja, mostre seu trabalho e encontre clientes que valorizam o que você faz.</p><button class="button button-light" data-action="professional">Quero ter minha loja ${icon("arrow-up-right", 16)}</button></div><div class="editorial-image"><img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80" alt="Profissional em seu espaço de beleza" loading="lazy"></div><span class="editorial-flower">✳</span></section>
    <section class="listing-section popular-section"><div class="section-heading"><div><span class="eyebrow">SEU PRÓXIMO FAVORITO</span><h2>Mais procurados</h2></div><button class="link-button" data-action="explore">Ver todos ${icon("arrow-up-right", 15)}</button></div><div class="store-grid">${popular.map(storeCard).join("")}</div></section>
    <section class="how-section" id="como-funciona"><div class="how-heading"><span class="eyebrow">SIMPLES ASSIM</span><h2>Seu próximo momento<br>de cuidado, em 3 passos.</h2></div><div class="how-steps"><div class="how-step"><span>01</span><div class="step-icon">${icon("search", 22)}</div><h3>Encontre</h3><p>Descubra espaços e profissionais que combinam com você.</p></div><div class="how-step"><span>02</span><div class="step-icon">${icon("calendar-days", 22)}</div><h3>Agende</h3><p>Escolha seu serviço, dia e horário. Sem complicação.</p></div><div class="how-step"><span>03</span><div class="step-icon">${icon("sparkles", 22)}</div><h3>Floresça</h3><p>Viva seu momento. Você merece esse cuidado.</p></div></div></section>
    <section class="testimonial-section"><span class="eyebrow">PALAVRAS QUE ACOLHEM</span><div class="testimonial-stars">★★★★★</div><blockquote>“Finalmente encontrei um lugar que entende que autocuidado não é luxo, é parte de quem eu sou.”</blockquote><div class="testimonial-author"><span class="testimonial-avatar">M</span><span><b>Mariana L.</b><small>Cliente Vellora há 8 meses</small></span></div></section>
    <section class="newsletter"><div><span class="eyebrow">UM CARINHO NA SUA CAIXA DE ENTRADA</span><h2>Beleza, inspiração<br>e novidades.</h2></div><form id="newsletter-form"><label class="newsletter-input"><input type="email" placeholder="Seu melhor e-mail" aria-label="Seu e-mail" required><button aria-label="Inscrever-se">${icon("arrow-right", 18)}</button></label><small>Ao se inscrever, você concorda com nossa política de privacidade.</small></form></section>
  </main>${footer()}`;
}

function filteredStores() {
  let list = [...state.stores];
  if (state.page === "favorites") list = list.filter((store) => state.favorites.includes(store.id));
  if (state.category) list = list.filter((store) => `${store.category} ${store.service}`.toLowerCase().includes(state.category.toLowerCase()));
  if (state.query) list = list.filter((store) => `${store.name} ${store.owner_name} ${store.category} ${store.service} ${store.city} ${store.address || ""}`.toLowerCase().includes(state.query.toLowerCase()));
  if (state.sort === "price") list.sort((a, b) => a.price - b.price);
  if (state.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (state.sort === "recommended") list = sortStoresByProximity(list);
  return list;
}

function explorePage() {
  const stores = filteredStores();
  return `<main class="subpage"><div class="page-intro"><span class="eyebrow">ENCONTRE SEU PRÓXIMO MOMENTO</span><h1>${state.page === "favorites" ? "Seus espaços favoritos" : "Explore a Vellora"}</h1><p>${state.page === "favorites" ? "Todos os espaços que você guardou em um só lugar." : "Profissionais incríveis, serviços especiais e um cuidado que é todo seu."}</p></div><div class="explore-controls"><label class="explore-search">${icon("search", 18)}<input id="explore-search" placeholder="Serviço, profissional ou bairro..." value="${escapeHtml(state.query)}"></label><select id="sort-select" aria-label="Ordenar resultados"><option value="recommended" ${state.sort === "recommended" ? "selected" : ""}>Recomendados</option><option value="rating" ${state.sort === "rating" ? "selected" : ""}>Melhor avaliação</option><option value="price" ${state.sort === "price" ? "selected" : ""}>Menor preço</option></select></div><div class="explore-categories">${categoryCards()}</div><div class="results-count">${stores.length} ${stores.length === 1 ? "espaço encontrado" : "espaços encontrados"}</div><div class="store-grid explore-grid">${stores.length ? stores.map(storeCard).join("") : `<div class="empty-state">${state.page === "favorites" ? "Você ainda não salvou nenhum espaço." : "Nenhum espaço encontrado para essa busca."}</div>`}</div></main>${footer()}`;
}

function storePage() {
  const store = state.selectedStore;
  if (!store) return explorePage();
  const serviceSource = state.services.some((item) => item.store_id === store.id)
    ? state.services.filter((item) => item.store_id === store.id)
    : store.services || [];
  const activeServices = serviceSource.length
    ? serviceSource.filter((item) => item.is_active !== false)
    : [{ id: store.id, store_id: store.id, name: store.service || store.category, description: "Um cuidado especial, feito para você.", duration_minutes: store.duration_minutes || 60, price: store.price || 0 }];
  const serviceMarkup = activeServices.length ? serviceList(store, activeServices) : `<div class="empty-state">Esta loja ainda não publicou serviços disponíveis.</div>`;
  const storeReviews = state.serviceReviews.filter((review) => review.store_id === store.id);
  const reviewCount = storeReviews.length || Number(store.review_count || 0);
  const storeRating = reviewCount
    ? storeReviews.length
      ? (storeReviews.reduce((sum, review) => sum + Number(review.rating), 0) / storeReviews.length).toFixed(1)
      : Number(store.rating).toFixed(1)
    : "—";
  return `<main class="store-page">
    <button class="back-link" data-action="explore">${icon("arrow-left", 17)} Voltar para explorar</button>
    <div class="store-cover"><img src="${escapeHtml(store.cover_url || store.image_url || seedStores[0].image_url)}" alt="${escapeHtml(store.name)}"><button class="favorite-button store-favorite ${state.favorites.includes(store.id) ? "is-favorite" : ""}" data-action="favorite" data-id="${escapeHtml(store.id)}">${icon("heart", 19)}</button></div>
    <div class="store-profile"><div class="store-profile-main"><span class="eyebrow">${escapeHtml(store.category || "BELEZA & BEM-ESTAR")}</span><h1>${escapeHtml(store.name)}</h1><p>${escapeHtml(store.description || "Um espaço feito para você se sentir bem.")}</p><div class="profile-meta"><span>${icon("map-pin", 16)} ${escapeHtml(store.city || state.location)}</span><span>${icon("star", 15)} <b>${storeRating}</b> (${reviewCount} avaliações)</span></div></div><div class="store-profile-badge"><span>${icon("badge-check", 22)}</span><b>Espaço verificado</b><small>por Vellora</small></div></div>
    <div class="store-content"><section class="services-column"><div class="section-heading"><div><span class="eyebrow">UM TEMPO PARA VOCÊ</span><h2>Serviços</h2></div></div><div class="service-list">${serviceMarkup}</div><section class="store-about"><h2>Sobre o espaço</h2><p>${escapeHtml(store.description || "Um espaço feito para você se sentir bem.")}</p><div class="about-detail">${icon("clock-3", 17)} Atendimento com hora marcada</div><div class="about-detail">${icon("map-pin", 17)} ${escapeHtml(store.city || state.location)}</div><h3>Fale com a loja</h3>${storeContactMarkup(store)}</section></section>
    <aside class="booking-aside"><div class="booking-aside-top"><span class="eyebrow">SEU PRÓXIMO MOMENTO</span><h3>Agende seu horário</h3><p>Escolha seu serviço e encontre o melhor horário para você.</p></div><button class="button button-dark booking-aside-button" data-action="book" data-id="${escapeHtml(store.id)}" ${activeServices.length ? "" : "disabled"}>Ver horários disponíveis ${icon("arrow-right", 17)}</button><div class="booking-assurance">${icon("shield-check", 16)} Agendamento seguro e sem taxas</div></aside></div>
    <section class="store-reviews"><div class="section-heading"><div><span class="eyebrow">QUEM VIVEU, RECOMENDA</span><h2>Avaliações dos serviços</h2></div><span class="reviews-overall">${icon("star", 16)} ${storeRating} <small>(${reviewCount})</small></span></div>${storeReviews.length ? `<div class="review-cards">${storeReviews.map(serviceReviewCard).join("")}</div>` : `<p class="service-review-empty">Ainda não há avaliações de serviços desta loja.</p>`}</section>
  </main>${footer()}`;
}

function reviewFormMarkup(service, eligibleAppointments, review = null) {
  const selected = eligibleAppointments.find((appointment) => appointment.id === (review?.appointment_id || state.reviewAppointmentId)) || eligibleAppointments[0];
  if (!selected) return "";
  const existingPhotos = (review?.image_urls || [])
    .filter((url) => url && !state.reviewRemovedImageUrls.includes(url));
  const photoLimitReached = existingPhotos.length + state.reviewDraftFiles.length >= 5;
  const photoMarkup = [
    ...existingPhotos.map((url) => `<figure class="review-photo-preview"><img src="${escapeHtml(url)}" alt="Foto adicionada à avaliação"><button type="button" data-action="remove-review-photo" data-kind="existing" data-url="${escapeHtml(url)}" aria-label="Remover foto da avaliação">${icon("x", 14)}</button></figure>`),
    ...state.reviewDraftPreviews.map((url, index) => `<figure class="review-photo-preview"><img src="${escapeHtml(url)}" alt="Nova foto selecionada"><button type="button" data-action="remove-review-photo" data-kind="new" data-index="${index}" aria-label="Remover foto selecionada">${icon("x", 14)}</button></figure>`),
  ].join("");
  const appointmentField = review || eligibleAppointments.length === 1
    ? `<input type="hidden" name="appointment_id" value="${escapeHtml(selected.id)}">`
    : `<label class="form-label">Agendamento concluído<select name="appointment_id" required>${eligibleAppointments.map((appointment) => `<option value="${escapeHtml(appointment.id)}" ${appointment.id === selected.id ? "selected" : ""}>${new Date(`${appointment.appointment_date}T12:00:00`).toLocaleDateString("pt-BR")} · ${escapeHtml(String(appointment.appointment_time).slice(0, 5))}</option>`).join("")}</select></label>`;
  return `<form class="service-review-form" data-service-id="${escapeHtml(service.id)}" data-review-id="${escapeHtml(review?.id || "")}">${appointmentField}<label class="form-label">Sua nota<select name="rating" required><option value="">Escolha de 1 a 5 estrelas</option><option value="5" ${Number(review?.rating) === 5 ? "selected" : ""}>★★★★★ — Amei</option><option value="4" ${Number(review?.rating) === 4 ? "selected" : ""}>★★★★ — Gostei</option><option value="3" ${Number(review?.rating) === 3 ? "selected" : ""}>★★★ — Foi bom</option><option value="2" ${Number(review?.rating) === 2 ? "selected" : ""}>★★ — Poderia melhorar</option><option value="1" ${Number(review?.rating) === 1 ? "selected" : ""}>★ — Não gostei</option></select></label><label class="form-label">Conte como foi <textarea name="comment" rows="4" maxlength="1000" placeholder="Sua experiência ajuda outras clientes." required>${escapeHtml(review?.comment || "")}</textarea></label><div class="review-photo-field"><span class="form-label">Fotos do resultado <span class="optional">(até 5, opcional)</span></span><label class="review-photo-picker ${photoLimitReached ? "is-disabled" : ""}">${icon("plus", 17)} Adicionar fotos<input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple ${photoLimitReached ? "disabled" : ""}></label>${photoMarkup ? `<div class="review-photo-grid">${photoMarkup}</div>` : `<small class="review-photo-help">Você pode selecionar várias imagens de uma vez.</small>`}</div><div class="review-form-actions"><button class="button button-dark" type="submit">${review ? "Salvar avaliação" : "Publicar avaliação"} ${icon("arrow-right", 15)}</button><button class="review-form-cancel" type="button" data-action="close-review">Cancelar</button></div></form>`;
}

function reviewModal() {
  const editedReview = state.serviceReviews.find((item) => item.id === state.editingReviewId);
  const appointment = state.appointments.find((item) => item.id === (editedReview?.appointment_id || state.reviewAppointmentId));
  if (!appointment) return "";
  const review = editedReview || state.serviceReviews.find((item) => item.appointment_id === appointment.id);
  const service = state.services.find((item) => item.id === appointment.service_id)
    || state.stores.flatMap((store) => store.services || []).find((item) => item.id === appointment.service_id)
    || { id: appointment.service_id || "", store_id: appointment.store_id, name: appointment.services?.name || appointment.service_name || "Atendimento" };
  const store = state.stores.find((item) => item.id === appointment.store_id);
  const eligibleAppointments = review
    ? [appointment]
    : state.appointments.filter((item) => item.service_id === appointment.service_id
      && item.status === "completed" && item.customer_id === state.user?.id
      && !state.reviewedAppointmentIds.includes(item.id));
  const form = reviewFormMarkup(service, eligibleAppointments, review);
  return `<div class="modal-backdrop review-modal-backdrop" data-action="close-review"><section class="modal review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title"><button class="modal-close" data-action="close-review" aria-label="Fechar">${icon("x", 20)}</button><span class="eyebrow">${review ? "SUA AVALIAÇÃO" : "SUA EXPERIÊNCIA IMPORTA"}</span><h2 id="review-modal-title">${review ? "Edite sua experiência" : "Conte como foi"}</h2><p class="review-modal-context">${escapeHtml(service.name)}${store ? ` · ${escapeHtml(store.name)}` : ""}</p>${form}</section></div>`;
}

function serviceReviewCard(review) {
  const serviceName = review.service_name || state.services.find((service) => service.id === review.service_id)?.name || "Atendimento";
  const photos = (review.image_urls || []).filter(Boolean);
  const canEdit = Boolean(state.user && !isProfessionalRole(state.profile)
    && state.appointments.some((appointment) => appointment.id === review.appointment_id
      && appointment.customer_id === state.user.id && appointment.status === "completed"));
  return `<article class="review-card service-review-card"><div class="review-stars" aria-label="${Number(review.rating)} de 5 estrelas">${"★".repeat(Number(review.rating))}${"☆".repeat(5 - Number(review.rating))}</div><small class="service-review-name">${escapeHtml(serviceName)}</small><p>${escapeHtml(review.comment || "")}</p>${photos.length ? `<div class="service-review-photos">${photos.map((url) => `<img src="${escapeHtml(url)}" alt="Foto enviada junto à avaliação" loading="lazy">`).join("")}</div>` : ""}<b>${escapeHtml(review.reviewer_name || "Cliente Vellora")}</b><small>${new Date(review.created_at).toLocaleDateString("pt-BR")}</small>${canEdit ? `<button class="review-edit-button" type="button" data-action="edit-review" data-id="${escapeHtml(review.appointment_id)}">Editar avaliação</button>` : ""}</article>`;
}

function storeContactMarkup(store) {
  const email = String(store.email || "").trim();
  const phone = String(store.phone || "").replace(/\D/g, "");
  const rawWhatsapp = String(store.whatsapp || store.phone || "").replace(/\D/g, "");
  const whatsapp = rawWhatsapp.length === 10 || rawWhatsapp.length === 11 ? `55${rawWhatsapp}` : rawWhatsapp;
  const contacts = [
    email ? `<a href="mailto:${escapeHtml(email)}">${icon("mail", 16)} ${escapeHtml(email)}</a>` : "",
    phone ? `<a href="tel:${escapeHtml(phone)}">${icon("phone", 16)} ${escapeHtml(store.phone)}</a>` : "",
    whatsapp.length >= 12 ? `<a href="https://wa.me/${escapeHtml(whatsapp)}" target="_blank" rel="noopener noreferrer">${icon("message-circle", 16)} Conversar pelo WhatsApp</a>` : "",
  ].filter(Boolean);
  const address = String(store.address || "").trim();
  return `${address ? `<p class="store-address">${icon("map-pin", 16)} ${escapeHtml(address)}${store.city ? ` · ${escapeHtml(store.city)}` : ""}</p>` : ""}${contacts.length
    ? `<div class="store-contact-list">${contacts.join("")}</div>`
    : `<p class="store-contact-empty">Esta loja ainda não informou os dados de contato.</p>`}`;
}

function serviceDetailsModal() {
  const { service, store } = state.viewingService || {};
  if (!service || !store) return "";
  return `<div class="modal-backdrop" data-action="close-service-details"><section class="modal service-details-modal" role="dialog" aria-modal="true" aria-labelledby="service-details-title"><button class="modal-close" data-action="close-service-details" aria-label="Fechar">${icon("x", 20)}</button>${service.image_url ? `<img class="service-details-image" src="${escapeHtml(service.image_url)}" alt="${escapeHtml(service.name)}">` : ""}<span class="eyebrow">${escapeHtml(store.category || "BELEZA & BEM-ESTAR")}</span><h2 id="service-details-title">${escapeHtml(service.name)}</h2><p class="service-details-description">${escapeHtml(service.description || "Um cuidado especial, feito para você.")}</p><div class="service-details-meta"><b>${money(service.price)}</b><span>${icon("clock-3", 15)} ${Number(service.duration_minutes || 60)} min</span></div><section class="service-details-store"><h3>${escapeHtml(store.name)}</h3><p>${escapeHtml(store.description || "Um espaço feito para você se sentir bem.")}</p><p class="service-details-location">${icon("map-pin", 15)} ${escapeHtml(store.city || state.location)}</p>${storeContactMarkup(store)}</section><button class="button button-dark modal-primary" data-action="book" data-id="${escapeHtml(store.id)}" data-service="${escapeHtml(service.id)}">Agendar este serviço ${icon("arrow-right", 16)}</button></section></div>`;
}

function serviceList(store, services = state.services.filter((service) => service.store_id === store.id && service.is_active !== false)) {
  return services.map((service) => {
    const reviews = state.serviceReviews.filter((review) => review.service_id === service.id);
    const avg = reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1) : "—";
    const likeCount = state.serviceLikes.find((like) => like.service_id === service.id && Number.isFinite(Number(like.like_count)))?.like_count;
    const likes = likeCount === undefined
      ? state.serviceLikes.filter((like) => like.service_id === service.id).length
      : Number(likeCount);
    const liked = state.user && state.serviceLikes.some((like) => like.service_id === service.id && like.customer_id === state.user.id);
    const eligibleAppointments = state.appointments.filter((appointment) =>
      appointment.service_id === service.id && appointment.status === "completed" &&
      appointment.customer_id === state.user?.id &&
      !state.reviewedAppointmentIds.includes(appointment.id));
    const reviewButton = eligibleAppointments.length
      ? `<button class="service-review-open" data-action="review-service" data-id="${escapeHtml(service.id)}">Avaliar este serviço</button>`
      : "";
    return `<article class="service-card" id="service-${escapeHtml(service.id)}" data-action="service-details" data-id="${escapeHtml(service.id)}">${service.image_url ? `<img class="service-card-image" src="${escapeHtml(service.image_url)}" alt="${escapeHtml(service.name)}" loading="lazy">` : ""}<div class="service-card-info"><h3>${escapeHtml(service.name)}</h3><p>${escapeHtml(service.description || "Um cuidado especial, feito para você.")}</p><span>${icon("clock-3", 14)} ${service.duration_minutes || 60} min</span><div class="service-rating-summary">${icon("star", 14)} <b>${avg}</b> <span>(${reviews.length} avaliações)</span></div><button class="service-details-open" data-action="service-details" data-id="${escapeHtml(service.id)}">Ver detalhes e contato</button><div class="service-engagement"><button class="service-like ${liked ? "is-liked" : ""}" data-action="like-service" data-id="${escapeHtml(service.id)}" aria-pressed="${Boolean(liked)}" aria-label="${liked ? "Remover curtida" : "Curtir serviço"}">${icon("heart", 16)} ${likes}</button>${reviewButton}</div></div><div class="service-card-action"><b>${money(service.price)}</b><button class="button button-outline" data-action="book" data-id="${escapeHtml(store.id)}" data-service="${escapeHtml(service.id)}">Agendar</button></div></article>`;
  }).join("");
}

function appointmentsPage() {
  const professional = isProfessionalRole(state.profile);
  const storeIds = new Set(state.ownedStores.map((store) => store.id));
  const appointments = professional
    ? state.appointments.filter((appointment) => storeIds.has(appointment.store_id))
    : state.appointments;
  const heading = professional
    ? ["SUA AGENDA PROFISSIONAL", "Pedidos de agendamento", "Confirme os pedidos ou proponha outro horário para sua cliente."]
    : ["SEU TEMPO, DO SEU JEITO", "Meus agendamentos", "Acompanhe seus próximos momentos e reveja os que já viveu."];
  return `<main class="subpage appointments-page"><div class="page-intro"><span class="eyebrow">${heading[0]}</span><h1>${heading[1]}</h1><p>${heading[2]}</p></div>${state.user ? notificationFeed() : ""}${state.user ? "" : `<div class="login-required"><div class="step-icon">${icon("calendar-days", 23)}</div><h2>Entre para ver seus agendamentos</h2><p>Seus horários favoritos estão a um login de distância.</p><button class="button button-dark" data-action="login">Entrar ou criar conta</button></div>`}<div class="appointment-list">${state.user ? appointments.length ? appointments.map((appointment) => professional ? professionalAppointmentCard(appointment) : appointmentCard(appointment)).join("") : `<div class="empty-state">${professional ? "Você ainda não recebeu pedidos de agendamento." : "Você ainda não tem agendamentos. Que tal encontrar seu próximo momento?"}</div>` : ""}</div></main>${footer()}`;
}

function appointmentProposalForm(appointment) {
  return `<form class="appointment-proposal-form" data-appointment-id="${escapeHtml(appointment.id)}"><label class="form-label">Nova data<input type="date" name="date" min="${dateKey(new Date())}" value="${escapeHtml(appointment.appointment_date)}" required></label><label class="form-label">Novo horário<input type="time" name="time" value="${escapeHtml(String(appointment.appointment_time).slice(0, 5))}" required></label><label class="form-label">Mensagem para a cliente<input name="message" maxlength="240" placeholder="Ex.: Pode ser às 20?" required></label><button class="button button-dark" type="submit">Enviar proposta ${icon("arrow-right", 15)}</button></form>`;
}

function professionalAppointmentCard(appointment) {
  const store = appointment.stores?.name || state.ownedStores.find((item) => item.id === appointment.store_id)?.name || "Sua loja";
  const service = appointment.services?.name || appointment.service_name || "Atendimento";
  const date = appointment.appointment_date
    ? new Date(`${appointment.appointment_date}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const status = appointment.status || "pending";
  const proposalPending = appointment.proposal_status === "pending" && appointment.proposed_date && appointment.proposed_time;
  const label = proposalPending
    ? "Aguardando resposta da cliente"
    : { pending: "Aguardando sua confirmação", confirmed: "Confirmado", completed: "Concluído", canceled: "Cancelado", rejected: "Recusado" }[status] || status;
  const actions = status === "pending" && !proposalPending
    ? `<div class="professional-appointment-actions"><button class="button button-dark" data-action="booking-status" data-id="${escapeHtml(appointment.id)}" data-status="confirmed">${icon("check-circle-2", 16)} Confirmar</button><button class="button button-outline" data-action="propose-time" data-id="${escapeHtml(appointment.id)}">${icon("rotate-ccw", 16)} Mudar horário</button><button class="professional-reject-action" data-action="booking-status" data-id="${escapeHtml(appointment.id)}" data-status="rejected">Recusar pedido</button></div>${state.proposingAppointmentId === appointment.id ? appointmentProposalForm(appointment) : ""}`
    : status === "confirmed"
      ? `<div class="professional-appointment-actions"><button class="button button-dark" data-action="booking-status" data-id="${escapeHtml(appointment.id)}" data-status="completed">${icon("check-circle-2", 16)} Marcar como concluído</button></div>`
      : "";
  const proposalNote = proposalPending
    ? `<div class="proposal-status-note">Proposta enviada: ${new Date(`${appointment.proposed_date}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} às ${escapeHtml(String(appointment.proposed_time).slice(0, 5))}<br>${escapeHtml(appointment.proposal_message || "")}</div>`
    : "";
  return `<article class="appointment-card professional-appointment-card"><div class="appointment-date">${icon("calendar-days", 20)}<b>${escapeHtml(date)}</b><span>${escapeHtml(String(appointment.appointment_time || "").slice(0, 5))}</span></div><div class="appointment-detail"><small class="professional-appointment-store">${escapeHtml(store)}</small><h3>${escapeHtml(appointment.customer_name || "Cliente")}</h3><p>${escapeHtml(service)} · ${escapeHtml(appointment.customer_phone || "")}</p><span class="appointment-status status-${escapeHtml(status)}">${escapeHtml(label)}</span>${proposalNote}</div>${actions}</article>`;
}

function appointmentCard(appointment) {
  const store = appointment.stores?.name || state.stores.find((item) => item.id === appointment.store_id)?.name || "Espaço Vellora";
  const service = appointment.services?.name || appointment.service_name || "Atendimento";
  const date = appointment.appointment_date ? new Date(`${appointment.appointment_date}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) : "";
  const status = appointment.status || "pending";
  const proposalPending = appointment.proposal_status === "pending" && appointment.proposed_date && appointment.proposed_time;
  const label = proposalPending ? "Sua resposta é necessária" : { pending: "Aguardando confirmação", confirmed: "Confirmado", completed: "Concluído", canceled: "Cancelado", rejected: "Recusado" }[status] || status;
  const proposal = proposalPending
    ? `<div class="customer-proposal"><b>${escapeHtml(appointment.proposal_message || "A profissional sugeriu outro horário.")}</b><small>Proposta: ${new Date(`${appointment.proposed_date}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} às ${escapeHtml(String(appointment.proposed_time).slice(0, 5))}</small><div><button class="button button-dark" data-action="respond-proposal" data-id="${escapeHtml(appointment.id)}" data-response="accept">Confirmar novo horário</button><button class="button button-outline" data-action="respond-proposal" data-id="${escapeHtml(appointment.id)}" data-response="decline">Recusar proposta</button></div></div>`
    : "";
  const cancel = ["pending", "confirmed", "aguardando", "confirmado"].includes(status) && !proposalPending
    ? `<button class="button button-outline cancel-appointment" data-action="cancel-booking" data-id="${escapeHtml(appointment.id)}">Cancelar</button>`
    : "";
  const review = status === "completed" && !state.reviewedAppointmentIds.includes(appointment.id)
    ? `<button class="button button-outline appointment-review-action" data-action="review-appointment" data-id="${escapeHtml(appointment.id)}">Avaliar atendimento</button>`
    : "";
  return `<article class="appointment-card"><div class="appointment-date">${icon("calendar-days", 20)}<b>${escapeHtml(date)}</b><span>${escapeHtml(String(appointment.appointment_time || "").slice(0, 5))}</span></div><div class="appointment-detail"><h3>${escapeHtml(store)}</h3><p>${escapeHtml(service)}</p><span class="appointment-status status-${escapeHtml(status)}">${escapeHtml(label)}</span></div>${cancel}${review}${proposal}</article>`;
}

function notificationFeed() {
  const notifications = state.notifications
    .filter((item) => !state.user || !item.recipient_id || item.recipient_id === state.user.id)
    .slice(0, 5);
  if (!notifications.length) return "";
  return `<section class="notification-feed" aria-label="Notificações recentes"><span class="eyebrow">ATUALIZAÇÕES DA SUA AGENDA</span>${notifications.map((item) => `<button class="${item.read_at ? "is-read" : ""}" data-action="read-notification" data-id="${escapeHtml(item.id)}"><span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.body)}</small></span><small>${item.read_at ? "Lida" : "Nova"}</small></button>`).join("")}</section>`;
}

async function markNotificationRead(id) {
  const notification = state.notifications.find((item) => item.id === id);
  if (!notification) return;
  const readAt = new Date().toISOString();
  if (!demoMode) {
    const { error } = await supabase.from("notifications").update({ read_at: readAt }).eq("id", id).eq("recipient_id", state.user.id);
    if (error) {
      console.error("Falha ao marcar notificação como lida:", error);
      notify("Não foi possível atualizar a notificação.");
      return;
    }
  }
  if (demoMode) {
    try {
      localStorage.setItem("vellora-demo-notifications", JSON.stringify(state.notifications.map((item) =>
        item.id === id ? { ...item, read_at: readAt } : item)));
    } catch (error) {
      console.error("Falha ao salvar notificação lida:", error);
      notify("Não foi possível salvar a leitura da notificação neste navegador.");
      return;
    }
  }
  notification.read_at = readAt;
  state.page = "appointments";
}

async function markAllNotificationsRead() {
  const unread = state.notifications.filter((item) => !item.read_at && (!item.recipient_id || item.recipient_id === state.user?.id));
  if (!unread.length) {
    state.page = "appointments";
    return;
  }
  const readAt = new Date().toISOString();
  if (!demoMode) {
    const { error } = await supabase.from("notifications").update({ read_at: readAt })
      .eq("recipient_id", state.user.id).is("read_at", null);
    if (error) {
      console.error("Falha ao marcar notificações como lidas:", error);
      notify("Não foi possível atualizar as notificações. Tente novamente.");
      return;
    }
  }
  state.notifications = state.notifications.map((item) =>
    unread.some((notification) => notification.id === item.id) ? { ...item, read_at: readAt } : item);
  if (demoMode) {
    try {
      localStorage.setItem("vellora-demo-notifications", JSON.stringify(state.notifications));
    } catch (error) {
      console.error("Falha ao salvar notificações lidas:", error);
      notify("As notificações foram abertas, mas não foi possível salvar a leitura neste navegador.");
      return;
    }
  }
  state.page = "appointments";
}

async function toggleServiceLike(serviceId) {
  if (!state.user || state.user.is_anonymous || isProfessionalRole(state.profile)) {
    state.authRole = "customer";
    state.authMode = "login";
    notify(isProfessionalRole(state.profile) ? "Curtidas estão disponíveis para contas de clientes." : "Entre na sua conta de cliente para curtir serviços.");
    return;
  }
  const existing = state.serviceLikes.some((like) => like.service_id === serviceId && like.customer_id === state.user.id);
  if (!demoMode) {
    const request = existing
      ? supabase.from("service_likes").delete().eq("service_id", serviceId).eq("customer_id", state.user.id)
      : supabase.from("service_likes").insert({ service_id: serviceId, customer_id: state.user.id });
    const { error } = await request;
    if (error) {
      console.error("Falha ao atualizar curtida do serviço:", error);
      notify(error.code === "42P01" || error.code === "PGRST205"
        ? "Execute supabase/service-engagement.sql para ativar curtidas."
        : "Não foi possível atualizar a curtida. Tente novamente.");
      return;
    }
  }
  if (demoMode) {
    const allLikes = JSON.parse(localStorage.getItem("vellora-service-likes") || "[]")
      .filter((like) => !(like.service_id === serviceId && like.customer_id === state.user.id));
    if (!existing) allLikes.push({ service_id: serviceId, customer_id: state.user.id });
    try {
      localStorage.setItem("vellora-service-likes", JSON.stringify(allLikes));
    } catch (error) {
      console.error("Falha ao salvar curtida localmente:", error);
      notify("Não foi possível salvar a curtida neste navegador.");
      return;
    }
    const currentStoreServiceIds = new Set(state.services.filter((service) => service.store_id === state.selectedStore?.id).map((service) => service.id));
    if (state.selectedStore?.id) currentStoreServiceIds.add(state.selectedStore.id);
    state.serviceLikes = allLikes.filter((like) => currentStoreServiceIds.has(like.service_id));
  } else {
    const count = state.serviceLikes.find((like) => like.service_id === serviceId && Number.isFinite(Number(like.like_count)));
    const nextCount = Math.max(0, Number(count?.like_count || 0) + (existing ? -1 : 1));
    state.serviceLikes = [
      ...state.serviceLikes.filter((like) => like.service_id !== serviceId),
      { service_id: serviceId, like_count: nextCount },
      ...(!existing ? [{ service_id: serviceId, customer_id: state.user.id }] : []),
    ];
  }
}

async function submitServiceReview(form) {
  if (!state.user || state.user.is_anonymous || isProfessionalRole(state.profile)) {
    state.authRole = "customer";
    state.authMode = "login";
    notify("Entre na sua conta de cliente para avaliar um serviço.");
    return;
  }
  const serviceId = form.dataset.serviceId;
  const values = new FormData(form);
  const appointmentId = String(values.get("appointment_id") || "");
  const appointment = state.appointments.find((item) => item.id === appointmentId);
  const service = state.services.find((item) => item.id === serviceId)
    || state.stores.flatMap((store) => store.services || []).find((item) => item.id === serviceId)
    || (appointment ? {
      id: appointment.service_id || "",
      store_id: appointment.store_id,
      name: appointment.services?.name || appointment.service_name || "Atendimento",
    } : null);
  const reviewId = String(form.dataset.reviewId || "");
  const existingReview = reviewId
    ? state.serviceReviews.find((review) => review.id === reviewId && review.appointment_id === appointmentId)
    : null;
  if (!service || !appointment || appointment.service_id !== (serviceId || null)
    || appointment.customer_id !== state.user.id || appointment.status !== "completed") {
    notify("A avaliação só pode ser enviada pela cliente após a conclusão do serviço.");
    return;
  }
  if (!existingReview && state.reviewedAppointmentIds.includes(appointmentId)) {
    notify("Este agendamento já foi avaliado.");
    return;
  }
  if (reviewId && !existingReview) {
    notify("Não encontramos a avaliação para editar. Atualize a página e tente novamente.");
    return;
  }
  const rating = Number(values.get("rating"));
  const comment = String(values.get("comment") || "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
    notify("Escolha uma nota e escreva um comentário para publicar sua avaliação.");
    return;
  }
  const retainedImages = (existingReview?.image_urls || [])
    .filter((url) => url && !state.reviewRemovedImageUrls.includes(url));
  const imageFiles = state.reviewDraftFiles;
  if (retainedImages.length + imageFiles.length > 5) {
    notify("Cada avaliação pode ter até 5 fotos.");
    return;
  }
  const uploadedImages = await Promise.all(imageFiles.map((file) => savePortfolioImage(file, "review")));
  if (uploadedImages.some((url) => !url)) return;
  const review = {
    appointment_id: appointmentId,
    store_id: service.store_id,
    service_id: service.id || null,
    customer_id: state.user.id,
    reviewer_name: state.profile?.full_name || "Cliente Vellora",
    rating,
    comment,
    image_urls: [...retainedImages, ...uploadedImages],
  };
  if (demoMode) {
    review.id = existingReview?.id || crypto.randomUUID();
    review.created_at = existingReview?.created_at || new Date().toISOString();
    const allReviews = JSON.parse(localStorage.getItem("vellora-service-reviews") || "[]");
    const updatedReviews = existingReview
      ? allReviews.map((item) => item.id === existingReview.id ? review : item)
      : [...allReviews, review];
    try {
      localStorage.setItem("vellora-service-reviews", JSON.stringify(updatedReviews));
    } catch (error) {
      console.error("Falha ao salvar avaliação localmente:", error);
      notify("Não foi possível salvar a avaliação neste navegador.");
      return;
    }
    state.serviceReviews = state.serviceReviews.filter((item) => item.id !== review.id);
    state.serviceReviews = [...state.serviceReviews, review];
  } else {
    const request = existingReview
      ? supabase.from("reviews").update({ rating, comment, image_urls: review.image_urls }).eq("id", existingReview.id)
        .eq("appointment_id", appointmentId).eq("customer_id", state.user.id)
      : supabase.from("reviews").insert(review);
    const { data, error } = await request.select("*, services(name)").single();
    if (error) {
      console.error(existingReview ? "Falha ao editar avaliação:" : "Falha ao publicar avaliação:", error);
      notify(error.code === "23505"
        ? "Este agendamento já foi avaliado."
        : existingReview
          ? "Não foi possível editar a avaliação. Confira se a migração atualizada foi aplicada."
          : "Não foi possível publicar sua avaliação. Confira se a migração de avaliações foi aplicada.");
      return;
    }
    const updatedReview = {
      ...data,
      service_name: data.services?.name || service.name,
    };
    state.serviceReviews = [
      updatedReview,
      ...state.serviceReviews.filter((item) => item.id !== updatedReview.id),
    ];
  }
  adjustStoreReviewStats(review, existingReview);
  state.reviewedAppointmentIds = [...new Set([...state.reviewedAppointmentIds, appointmentId])];
  clearReviewDraft();
  openNextReviewPrompt();
  notify(existingReview
    ? "Sua avaliação foi atualizada com sucesso."
    : "Sua avaliação foi publicada. Obrigada por compartilhar sua experiência!");
}

function recordDemoNotification(notification) {
  state.notifications.unshift({ ...notification, id: crypto.randomUUID(), created_at: new Date().toISOString(), read_at: null });
  localStorage.setItem("vellora-demo-notifications", JSON.stringify(state.notifications));
}

function profilePage() {
  if (state.user && (state.profile?.role === "professional" || state.authRole === "professional")) return dashboardPage();
  if (state.user) return customerDashboardPage();
  return `<main class="subpage profile-page"><div class="page-intro"><span class="eyebrow">SEU ESPAÇO VELLORA</span><h1>Olá${state.profile?.full_name ? `, ${escapeHtml(state.profile.full_name.split(" ")[0])}` : ""}.</h1><p>Um cantinho para cuidar de você e dos seus momentos.</p></div>${state.user ? `<div class="profile-cards"><button class="profile-tile" data-action="appointments"><span class="step-icon">${icon("calendar-days", 22)}</span><b>Meus agendamentos</b><small>Veja seus horários e histórico</small>${icon("arrow-up-right", 17)}</button><button class="profile-tile" data-action="favorites"><span class="step-icon">${icon("heart", 22)}</span><b>Meus favoritos</b><small>Espaços que você guardou</small>${icon("arrow-up-right", 17)}</button><button class="profile-tile" data-action="professional"><span class="step-icon">${icon("store", 22)}</span><b>Quero ter minha loja</b><small>Seu talento merece ser visto</small>${icon("arrow-up-right", 17)}</button><button class="profile-tile" data-action="logout"><span class="step-icon">${icon("log-out", 22)}</span><b>Sair da conta</b><small>Você pode voltar quando quiser</small>${icon("arrow-up-right", 17)}</button></div>` : `<div class="login-required"><div class="step-icon">${icon("user-round", 23)}</div><h2>Seu espaço está te esperando</h2><p>Entre para acompanhar seus agendamentos e salvar seus lugares favoritos.</p><button class="button button-dark" data-action="login">Entrar ou criar conta</button></div>`}</main>${footer()}`;
}

function customerDashboardPage() {
  const firstName = state.profile?.full_name?.trim().split(/\s+/)[0] || "bem-vinda";
  const today = dateKey(new Date());
  const upcoming = state.appointments
    .filter((appointment) => appointment.appointment_date >= today && ["pending", "confirmed", "aguardando", "confirmado"].includes(appointment.status))
    .sort((a, b) => `${a.appointment_date} ${a.appointment_time}`.localeCompare(`${b.appointment_date} ${b.appointment_time}`));
  const favoriteStores = state.stores.filter((store) => state.favorites.includes(store.id));
  const recentAppointments = upcoming.slice(0, 3);
  return `<main class="customer-dashboard">
    <section class="customer-welcome">
      <div class="customer-welcome-copy"><span class="eyebrow">SEU ESPAÇO DE CUIDADO</span><span class="customer-account-label">${icon("heart", 14)} CONTA DA CLIENTE</span><h1>Olá, ${escapeHtml(firstName)}.</h1><p>Seu próximo momento especial começa por aqui.</p><button class="button button-light" data-action="explore">Descobrir profissionais ${icon("arrow-up-right", 16)}</button></div>
      <div class="customer-welcome-mark" aria-hidden="true">v</div>
    </section>
    <section class="customer-overview" aria-label="Resumo da sua conta">
      <button class="customer-stat" data-action="appointments"><span class="customer-stat-icon">${icon("calendar-days", 20)}</span><span><b>${upcoming.length}</b><small>próximos agendamentos</small></span>${icon("arrow-up-right", 16)}</button>
      <button class="customer-stat" data-action="favorites"><span class="customer-stat-icon">${icon("heart", 20)}</span><span><b>${favoriteStores.length}</b><small>espaços favoritos</small></span>${icon("arrow-up-right", 16)}</button>
      <button class="customer-stat" data-action="explore"><span class="customer-stat-icon">${icon("sparkles", 20)}</span><span><b>Seu momento</b><small>encontre algo novo</small></span>${icon("arrow-up-right", 16)}</button>
    </section>
    <div class="customer-dashboard-grid">
      <section class="customer-content-card">
        <div class="customer-section-heading"><div><span class="eyebrow">NA SUA AGENDA</span><h2>Próximos momentos</h2></div><button class="link-button" data-action="appointments">Ver agenda ${icon("arrow-up-right", 15)}</button></div>
        <div class="customer-upcoming-list">${recentAppointments.length ? recentAppointments.map(appointmentCard).join("") : `<div class="customer-empty"><span class="customer-empty-icon">${icon("calendar-days", 22)}</span><b>Um tempinho só seu?</b><p>Quando você agendar um serviço, ele aparecerá aqui.</p><button class="button button-dark" data-action="explore">Encontrar um serviço ${icon("arrow-right", 15)}</button></div>`}</div>
      </section>
      <section class="customer-content-card customer-favorites-card">
        <div class="customer-section-heading"><div><span class="eyebrow">GUARDADOS COM CARINHO</span><h2>Seus favoritos</h2></div><button class="link-button" data-action="favorites">Ver todos ${icon("arrow-up-right", 15)}</button></div>
        <div class="customer-favorite-list">${favoriteStores.length ? favoriteStores.slice(0, 3).map((store) => `<article class="customer-favorite-item"><button class="customer-favorite-open" data-action="store" data-id="${escapeHtml(store.id)}"><img src="${escapeHtml(store.image_url || seedStores[0].image_url)}" alt="" loading="lazy"><span><b>${escapeHtml(store.name)}</b><small>${escapeHtml(store.category || "Beleza")} · ${escapeHtml(store.city || state.location)}</small></span></button><button class="customer-favorite-remove" data-action="favorite" data-id="${escapeHtml(store.id)}" aria-label="Remover ${escapeHtml(store.name)} dos favoritos">${icon("heart", 17)}</button></article>`).join("") : `<div class="customer-favorite-empty"><span class="customer-empty-icon">${icon("heart", 21)}</span><b>Salve os espaços que você ama</b><p>Toque no coração de uma loja para encontrá-la facilmente aqui.</p><button class="link-button" data-action="explore">Explorar espaços ${icon("arrow-up-right", 15)}</button></div>`}</div>
      </section>
    </div>
    <section class="customer-account-card"><span class="customer-account-avatar">${escapeHtml(firstName.slice(0, 1).toUpperCase())}</span><div><span class="eyebrow">SUA CONTA VELLORA</span><b>${escapeHtml(state.profile?.full_name || "Cliente Vellora")}</b><small>${escapeHtml(state.user.email || "")}</small></div><button class="button button-outline" data-action="logout">${icon("log-out", 16)} Sair da conta</button></section>
  </main>${footer()}`;
}

function dashboardPage() {
  const store = state.ownedStores[0] || state.stores.find((item) => item.owner_id === state.user?.id);
  if (!store) {
    return `<main class="subpage dashboard-page"><div class="page-intro"><span class="eyebrow">SEU NEGÓCIO, DO SEU JEITO</span><h1>Painel da profissional</h1><p>Crie sua primeira loja para começar a receber agendamentos.</p></div><div class="login-required"><div class="step-icon">${icon("store", 23)}</div><h2>Seu talento merece um espaço só seu.</h2><p>Monte sua vitrine em poucos passos e comece a receber clientes.</p><button class="button button-dark" data-action="professional">Criar minha loja ${icon("arrow-right", 16)}</button></div></main>${footer()}`;
  }
  const bookings = state.appointments.filter((item) => store && item.store_id === store.id);
  const pending = bookings.filter((item) => item.status === "pending" || item.status === "aguardando");
  const bookingRows = bookings.length
    ? bookings.map((booking) => {
      const statusText = booking.proposal_status === "pending" ? "Aguardando resposta da cliente" : ({ pending: "Aguardando confirmação", confirmed: "Confirmado", completed: "Concluído", canceled: "Cancelado", rejected: "Recusado" })[booking.status] || booking.status;
      const actions = booking.status === "pending" && booking.proposal_status !== "pending"
        ? `<div class="booking-actions"><button data-action="booking-status" data-id="${escapeHtml(booking.id)}" data-status="confirmed">Confirmar</button><button data-action="propose-time" data-id="${escapeHtml(booking.id)}">Mudar horário</button><button data-action="booking-status" data-id="${escapeHtml(booking.id)}" data-status="rejected">Recusar pedido</button></div>${state.proposingAppointmentId === booking.id ? appointmentProposalForm(booking) : ""}`
        : booking.status === "confirmed"
          ? `<div class="booking-actions"><button data-action="booking-status" data-id="${escapeHtml(booking.id)}" data-status="completed">Marcar como concluído</button></div>`
          : "";
      const proposed = booking.proposal_status === "pending" && booking.proposed_date && booking.proposed_time
        ? `<small class="proposal-status-note">Proposta enviada: ${escapeHtml(booking.proposed_date)} às ${escapeHtml(String(booking.proposed_time).slice(0, 5))} · aguardando resposta</small>`
        : "";
      return `<article class="dashboard-booking"><div><b>${escapeHtml(booking.customer_name || "Cliente")}</b><small>${escapeHtml(booking.services?.name || booking.service_name || "Serviço")} · ${escapeHtml(booking.appointment_date || "")} às ${escapeHtml(String(booking.appointment_time || "").slice(0, 5))}</small>${proposed}</div><span class="appointment-status status-${escapeHtml(booking.status)}">${escapeHtml(statusText)}</span>${actions}</article>`;
    }).join("")
    : `<div class="empty-state">Seus novos pedidos aparecerão aqui.</div>`;
  const stateServices = state.services.filter((item) => item.store_id === store.id);
  const services = stateServices.length ? stateServices : store.services || [];
  const activeServices = services.filter((item) => item.is_active !== false);
  const serviceCount = activeServices.length;
  return `<main class="subpage dashboard-page"><div class="page-intro dashboard-heading"><div><span class="eyebrow">SEU NEGÓCIO, DO SEU JEITO</span><h1>Painel da profissional</h1><p>Um espaço simples para cuidar da sua loja e das suas clientes.</p></div><button class="button button-dark" data-action="professional">${icon("store", 16)} Adicionar outra loja</button></div><section class="dashboard-preview-section"><div class="dashboard-preview-heading"><div><span class="eyebrow">ASSIM SUA LOJA APARECE NO VELLORA</span><h2>Prévia para suas clientes</h2><p>Esta vitrine é atualizada conforme você adiciona serviços e fotos.</p></div><span class="preview-live">${icon("eye", 15)} Visualização da cliente</span></div>${dashboardStorePreview(store, activeServices)}</section><section class="dashboard-summary"><article><span>Agendamentos</span><b>${bookings.length}</b><small>no total</small></article><article><span>Aguardando</span><b>${pending.length}</b><small>para confirmar</small></article><article><span>Serviços ativos</span><b>${serviceCount}</b><small>na sua loja</small></article><article><span>Visualizações</span><b>—</b><small>em breve</small></article></section>${notificationFeed()}${availabilityManager(store)}<div class="dashboard-columns"><section class="dashboard-panel"><div class="section-heading"><div><span class="eyebrow">SUA VITRINE</span><h2>${escapeHtml(store.name)}</h2></div><button class="link-button" data-action="store" data-id="${escapeHtml(store.id)}">Ver loja ${icon("arrow-up-right", 15)}</button></div><p>${escapeHtml(store.city || "")} · ${escapeHtml(store.category || "")}</p><div class="dashboard-service-manager"><div class="service-manager-heading"><b>Serviços cadastrados</b><small>${services.length} ${services.length === 1 ? "serviço" : "serviços"}</small></div>${serviceManagementList(services)}</div><details class="dashboard-disclosure service-form-disclosure"><summary class="dashboard-disclosure-summary"><span><b>Adicionar um serviço</b><small>Cadastre um novo atendimento na sua loja.</small></span><span class="dashboard-disclosure-icon">${icon("chevron-down", 18)}</span></summary><form id="service-form" class="dashboard-service-form"><label class="form-label">Nome do serviço<input name="name" required placeholder="Ex.: Manicure em gel"></label><label class="form-label">Descrição <span class="optional">(opcional)</span><textarea name="description" rows="2" placeholder="O que está incluso neste serviço?"></textarea></label><label class="form-label">Preço (R$)<input name="price" type="number" min="0" step="0.01" required placeholder="95"></label><label class="form-label">Duração (minutos)<input name="duration" type="number" min="5" max="720" value="60" required></label><label class="form-label">Foto do serviço <span class="optional">(opcional)</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"></label><button class="button button-dark">${icon("plus", 15)} Salvar serviço</button></form></details></section><section class="dashboard-panel"><div class="section-heading"><div><span class="eyebrow">SUA AGENDA</span><h2>Pedidos recentes</h2></div></div>${bookingRows}</section></div><button class="text-button dashboard-logout" data-action="logout">Sair da conta</button></main>${footer()}`;
}

function availabilityManager(store) {
  const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const currentHours = (weekday) => state.storeHours.find((item) => item.store_id === store.id && item.weekday === weekday);
  const rows = weekdays.map((name, weekday) => {
    const hours = currentHours(weekday);
    const closed = hours ? hours.is_closed : true;
    return `<div class="availability-day-row"><strong>${name}</strong><label class="availability-closed"><input type="checkbox" name="closed_${weekday}" ${closed ? "checked" : ""}> Fechado</label><label class="form-label">Abre<input type="time" name="opens_${weekday}" value="${escapeHtml(String(hours?.opens_at || "09:00").slice(0, 5))}" ${closed ? "disabled" : ""}></label><label class="form-label">Fecha<input type="time" name="closes_${weekday}" value="${escapeHtml(String(hours?.closes_at || "18:00").slice(0, 5))}" ${closed ? "disabled" : ""}></label><label class="form-label">Pausa inicia<input type="time" name="break_start_${weekday}" value="${escapeHtml(String(hours?.break_start || "").slice(0, 5))}" ${closed ? "disabled" : ""}></label><label class="form-label">Pausa termina<input type="time" name="break_end_${weekday}" value="${escapeHtml(String(hours?.break_end || "").slice(0, 5))}" ${closed ? "disabled" : ""}></label></div>`;
  }).join("");
  const blocks = state.blockedTimes.filter((item) => item.store_id === store.id);
  return `<section class="availability-panel"><details class="dashboard-disclosure availability-disclosure"><summary class="availability-panel-heading"><div><span class="eyebrow">SUA AGENDA, SUAS REGRAS</span><h2>Horários disponíveis</h2><p>Defina dias e expediente para seus agendamentos.</p></div><span class="availability-summary-actions"><span class="availability-panel-icon">${icon("clock-3", 22)}</span><span class="dashboard-disclosure-icon">${icon("chevron-down", 18)}</span></span></summary><div class="availability-disclosure-content"><form id="store-hours-form" data-store-id="${escapeHtml(store.id)}"><div class="availability-week">${rows}</div><button class="button button-dark" type="submit">${icon("check-circle-2", 16)} Salvar horários da semana</button></form><div class="blocked-times-section"><div><b>Bloquear um período</b><small>Folga, compromisso ou indisponibilidade pontual.</small></div><form id="blocked-time-form" data-store-id="${escapeHtml(store.id)}"><label class="form-label">Data<input name="date" type="date" min="${dateKey(new Date())}" required></label><label class="form-label">Início<input name="start" type="time" required></label><label class="form-label">Fim<input name="end" type="time" required></label><label class="form-label">Motivo<input name="reason" maxlength="100" placeholder="Ex.: Compromisso"></label><button class="button button-outline" type="submit">${icon("plus", 15)} Bloquear</button></form>${blocks.length ? `<div class="blocked-time-list">${blocks.map((block) => `<article><span><b>${new Date(block.starts_at).toLocaleDateString("pt-BR")} · ${new Date(block.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}–${new Date(block.ends_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</b><small>${escapeHtml(block.reason || "Indisponível")}</small></span><button type="button" data-action="remove-block" data-id="${escapeHtml(block.id)}" aria-label="Remover bloqueio">${icon("trash-2", 15)}</button></article>`).join("")}</div>` : ""}</div></div></details></section>`;
}

async function saveStoreHours(form) {
  const storeId = form.dataset.storeId;
  const values = new FormData(form);
  const rows = Array.from({ length: 7 }, (_, weekday) => {
    const isClosed = values.has(`closed_${weekday}`);
    const opensAt = values.get(`opens_${weekday}`);
    const closesAt = values.get(`closes_${weekday}`);
    const breakStart = values.get(`break_start_${weekday}`) || null;
    const breakEnd = values.get(`break_end_${weekday}`) || null;
    if (!isClosed && (!opensAt || !closesAt || opensAt >= closesAt)) {
      throw new Error(`Confira o horário de abertura e fechamento de ${["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"][weekday]}.`);
    }
    if (!isClosed && Boolean(breakStart) !== Boolean(breakEnd)) {
      throw new Error("Preencha os dois horários do intervalo ou deixe ambos vazios.");
    }
    if (!isClosed && breakStart && (breakStart <= opensAt || breakEnd >= closesAt || breakStart >= breakEnd)) {
      throw new Error("O intervalo precisa ficar dentro do expediente e ter início antes do fim.");
    }
    return {
      store_id: storeId,
      weekday,
      is_closed: isClosed,
      opens_at: isClosed ? null : opensAt,
      closes_at: isClosed ? null : closesAt,
      break_start: isClosed ? null : breakStart,
      break_end: isClosed ? null : breakEnd,
    };
  });
  if (demoMode) {
    state.storeHours = [...state.storeHours.filter((hour) => hour.store_id !== storeId), ...rows];
    localStorage.setItem("vellora-demo-store-hours", JSON.stringify(state.storeHours));
  } else {
    const { data, error } = await supabase.from("store_hours").upsert(rows, { onConflict: "store_id,weekday" }).select();
    if (error) {
      console.error("Falha ao salvar horários de atendimento:", error);
      throw new Error("Não foi possível salvar. Verifique se a migração de agenda foi aplicada.");
    }
    state.storeHours = [...state.storeHours.filter((hour) => hour.store_id !== storeId), ...(data || rows)];
  }
  notify("Horários de atendimento salvos. A agenda já usará essa disponibilidade.");
}

async function addBlockedTime(form) {
  const values = new FormData(form);
  const storeId = form.dataset.storeId;
  const date = String(values.get("date"));
  const start = String(values.get("start"));
  const end = String(values.get("end"));
  if (date < dateKey(new Date())) throw new Error("Escolha hoje ou uma data futura para bloquear.");
  if (start >= end) throw new Error("O horário final precisa ser depois do horário inicial.");
  const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;
  const conflict = state.appointments.some((appointment) => {
    if (appointment.store_id !== storeId || appointment.appointment_date !== date || !["pending", "confirmed"].includes(appointment.status)) return false;
    const appointmentStart = new Date(`${date}T${String(appointment.appointment_time).slice(0, 5)}`).getTime();
    const appointmentEnd = appointmentStart + Number(appointment.duration_minutes || 60) * 60000;
    return overlaps(new Date(`${date}T${start}`).getTime(), new Date(`${date}T${end}`).getTime(), appointmentStart, appointmentEnd);
  });
  if (conflict) throw new Error("Esse período coincide com um agendamento já solicitado ou confirmado.");
  const startsAt = new Date(`${date}T${start}`).toISOString();
  const endsAt = new Date(`${date}T${end}`).toISOString();
  const payload = { store_id: storeId, starts_at: startsAt, ends_at: endsAt, reason: String(values.get("reason") || "").trim() };
  if (demoMode) {
    state.blockedTimes.push({ ...payload, id: crypto.randomUUID(), date });
    localStorage.setItem("vellora-demo-blocked-times", JSON.stringify(state.blockedTimes));
  } else {
    const { data, error } = await supabase.from("blocked_times").insert(payload).select().single();
    if (error) {
      console.error("Falha ao bloquear período:", error);
      throw new Error("Não foi possível bloquear esse período. Verifique a migração da agenda.");
    }
    state.blockedTimes.push(data);
  }
  notify("Período bloqueado; clientes não poderão agendar nesse horário.");
}

async function removeBlockedTime(id) {
  const block = state.blockedTimes.find((item) => item.id === id);
  if (!block) return;
  if (!demoMode) {
    const { error } = await supabase.from("blocked_times").delete().eq("id", id).eq("store_id", block.store_id);
    if (error) {
      console.error("Falha ao remover bloqueio de horário:", error);
      notify("Não foi possível remover esse bloqueio.");
      return;
    }
  }
  state.blockedTimes = state.blockedTimes.filter((item) => item.id !== id);
  if (demoMode) localStorage.setItem("vellora-demo-blocked-times", JSON.stringify(state.blockedTimes));
  notify("Bloqueio removido.");
}

async function proposeAppointmentTime(form) {
  const appointmentId = form.dataset.appointmentId;
  const values = new FormData(form);
  const proposal = {
    p_appointment_id: appointmentId,
    p_proposed_date: String(values.get("date")),
    p_proposed_time: String(values.get("time")),
    p_message: String(values.get("message")).trim(),
  };
  if (proposal.p_proposed_date < dateKey(new Date())) throw new Error("A nova data deve ser hoje ou futura.");
  if (!proposal.p_message) throw new Error("Escreva uma mensagem para a cliente.");
  if (demoMode) {
    const appointment = state.appointments.find((item) => item.id === appointmentId);
    if (!appointment) throw new Error("Não encontramos esse agendamento.");
    Object.assign(appointment, { proposed_date: proposal.p_proposed_date, proposed_time: proposal.p_proposed_time, proposal_message: proposal.p_message, proposal_status: "pending" });
    localStorage.setItem("vellora-appointments", JSON.stringify(state.appointments));
    recordDemoNotification({ recipient_id: appointment.customer_id, kind: "reschedule_proposal", title: "A profissional sugeriu outro horário", body: proposal.p_message, appointment_id: appointmentId });
  } else {
    const { error } = await supabase.rpc("propose_appointment_time", proposal);
    if (error) {
      console.error("Falha ao enviar proposta de horário:", error);
      throw new Error("Não foi possível enviar a proposta. Verifique a migração de agenda e tente novamente.");
    }
    await refreshAppointments();
  }
  state.proposingAppointmentId = "";
  notify("Proposta enviada à cliente. Ela receberá uma notificação para responder.");
}

async function respondToAppointmentProposal(id, response) {
  const appointment = state.appointments.find((item) => item.id === id);
  if (!appointment) { notify("Não encontramos esse agendamento."); return; }
  if (demoMode) {
    if (response === "accept") {
      appointment.appointment_date = appointment.proposed_date;
      appointment.appointment_time = appointment.proposed_time;
      appointment.status = "confirmed";
    } else {
    }
    appointment.proposal_status = response === "accept" ? "accepted" : "declined";
    localStorage.setItem("vellora-appointments", JSON.stringify(state.appointments));
    const ownerId = state.stores.find((store) => store.id === appointment.store_id)?.owner_id;
    recordDemoNotification({ recipient_id: ownerId, kind: "reschedule_response", title: response === "accept" ? "A cliente aceitou o novo horário" : "A cliente recusou o novo horário", body: appointment.customer_name || "Sua cliente", appointment_id: id });
  } else {
    const { error } = await supabase.rpc("respond_to_appointment_proposal", { p_appointment_id: id, p_accept: response === "accept" });
    if (error) {
      console.error("Falha ao responder à proposta de horário:", error);
      notify("Não foi possível registrar sua resposta. Verifique a conexão e tente novamente.");
      return;
    }
    await refreshAppointments();
  }
  notify(response === "accept" ? "Novo horário confirmado. A profissional foi avisada." : "Proposta recusada. O agendamento original continua aguardando confirmação.");
}

async function refreshAppointments() {
  if (demoMode || !state.user) return;
  const { data: appointments, error: appointmentsError } = await supabase.from("appointments")
    .select("*, stores(name), services(name, price)")
    .order("appointment_date", { ascending: true });
  if (appointmentsError) throw appointmentsError;
  state.appointments = appointments || [];
  state.notifications = await loadNotifications(state.user.id);
}

function serviceManagementList(services) {
  if (!services.length) return `<div class="service-manager-empty">Você ainda não adicionou serviços.</div>`;
  return `<div class="service-manager-list">${services.map((service) => `<article class="managed-service ${service.is_active === false ? "is-inactive" : ""}"><img src="${escapeHtml(service.image_url || seedStores[0].image_url)}" alt="" loading="lazy"><div class="managed-service-info"><b>${escapeHtml(service.name)}</b><small>${escapeHtml(service.description || `${service.duration_minutes || 60} minutos`)} · ${money(service.price)}</small><span>${service.is_active === false ? "Oculto da loja" : "Visível para clientes"}</span></div><div class="managed-service-actions"><button type="button" class="service-edit-button" data-action="edit-service" data-id="${escapeHtml(service.id)}">${icon("pencil", 15)} Editar</button>${service.is_active === false ? `<button type="button" class="service-restore-button" data-action="restore-service" data-id="${escapeHtml(service.id)}" aria-label="Reativar serviço">${icon("rotate-ccw", 15)}</button>` : `<button type="button" class="service-delete-button" data-action="delete-service" data-id="${escapeHtml(service.id)}" aria-label="Excluir serviço da loja">${icon("trash-2", 15)}</button>`}</div></article>`).join("")}</div>`;
}

function dashboardStorePreview(store, services) {
  const cover = store.cover_url || store.image_url || seedStores[0].image_url;
  const rows = services.length
    ? services.map((service) => `<article class="preview-service"><img src="${escapeHtml(service.image_url || cover)}" alt="${escapeHtml(service.name)}" loading="lazy"><div class="preview-service-info"><b>${escapeHtml(service.name)}</b><small>${escapeHtml(service.description || `${service.duration_minutes || 60} minutos`)}</small><strong>${money(service.price)}</strong></div><span class="preview-book-label">Agendar</span></article>`).join("")
    : `<div class="preview-empty"><span class="step-icon">${icon("sparkles", 19)}</span><b>Seus serviços vão aparecer aqui</b><small>Adicione um serviço e, se quiser, uma foto para deixar a vitrine com a sua cara.</small></div>`;
  const previewRating = Number(store.review_count) ? Number(store.rating).toFixed(1) : "—";
  return `<article class="store-preview-card"><div class="store-preview-cover"><img src="${escapeHtml(cover)}" alt="Capa de ${escapeHtml(store.name)}" loading="lazy"><span class="preview-store-avatar">${escapeHtml((store.name || "V").slice(0, 1).toUpperCase())}</span><span class="preview-client-tag">Página pública da loja</span></div><div class="store-preview-body"><div class="store-preview-title"><div><span class="eyebrow">${escapeHtml(store.category || "BELEZA & BEM-ESTAR")}</span><h3>${escapeHtml(store.name)}</h3><p>${escapeHtml(store.city || "")} · <span>${icon("star", 13)} ${previewRating} (${Number(store.review_count || 0)} avaliações)</span></p></div><span class="preview-verified">${icon("badge-check", 17)} Verificada</span></div><p class="store-preview-description">${escapeHtml(store.description || "Um espaço feito para você se sentir bem.")}</p>${storeContactMarkup(store)}<div class="preview-services-heading"><b>Serviços</b><small>${services.length} ${services.length === 1 ? "opção" : "opções"}</small></div><div class="preview-services-list">${rows}</div></div></article>${storeSettingsMarkup(store)}`;
}

function storeSettingsMarkup(store) {
  const coordinates = state.pendingStoreCoordinates || store;
  const hasCoordinates = hasStoreCoordinates(coordinates);
  return `<section class="dashboard-panel store-settings-panel"><details class="dashboard-disclosure"><summary class="dashboard-disclosure-summary"><span><b>Editar dados da loja</b><small>Atualize apresentação, endereço e contatos públicos.</small></span><span class="dashboard-disclosure-icon">${icon("chevron-down", 18)}</span></summary><form id="store-settings-form" class="store-settings-form" data-store-id="${escapeHtml(store.id)}"><label class="form-label">Nome da loja<input name="name" required maxlength="100" value="${escapeHtml(store.name || "")}"></label><label class="form-label">Categoria<input name="category" required maxlength="80" value="${escapeHtml(store.category || "")}"></label><label class="form-label store-settings-wide">Cidade / bairro<input name="city" required maxlength="120" value="${escapeHtml(store.city || "")}"></label><label class="form-label store-settings-wide">Endereço do espaço<input name="address" maxlength="240" value="${escapeHtml(store.address || "")}" placeholder="Rua, número, bairro e complemento"></label><input type="hidden" name="latitude" value="${hasCoordinates ? escapeHtml(String(coordinates.latitude)) : ""}"><input type="hidden" name="longitude" value="${hasCoordinates ? escapeHtml(String(coordinates.longitude)) : ""}"><button class="button button-outline" type="button" data-action="use-store-location">${icon("map-pin", 16)} Capturar localização atual da loja</button><small class="location-privacy-note">Ao capturar, o ponto ficará público para calcular a proximidade entre clientes e sua loja.</small><small class="store-location-status" aria-live="polite"></small><label class="form-label store-settings-wide">Descrição da loja<textarea name="description" rows="3" maxlength="1000" placeholder="Conte aos clientes sobre seu espaço e atendimento">${escapeHtml(store.description || "")}</textarea></label><label class="form-label">E-mail público<input name="email" type="email" maxlength="254" value="${escapeHtml(store.email || "")}" placeholder="contato@seudominio.com"></label><label class="form-label">Telefone<input name="phone" type="tel" maxlength="30" value="${escapeHtml(store.phone || "")}" placeholder="(11) 99999-9999"></label><label class="form-label store-settings-wide">WhatsApp<input name="whatsapp" type="tel" maxlength="30" value="${escapeHtml(store.whatsapp || "")}" placeholder="(11) 99999-9999"></label><button class="button button-dark" type="submit">${icon("check-circle-2", 16)} Salvar dados da loja</button></form></details></section>`;
}

function footer() {
  return `<footer class="footer"><div class="footer-top"><a class="brand footer-brand" href="#" data-action="home"><span class="brand-mark">v</span><span>vellora<span class="brand-dot">.</span></span></a><span class="footer-tagline">Sua beleza, seu espaço, seu negócio.<br><small class="footer-developer-credit">Desenvolvido por <b>Auren Digital</b></small></span><div class="footer-links"><a href="#como-funciona" data-action="how">Como funciona</a><a href="#" data-action="professional">Para profissionais</a><a href="#" data-action="contact">Contato</a><button class="footer-install" data-action="install">Instalar app</button></div></div><div class="footer-bottom"><span>© 2025 Vellora. Feito com carinho.</span><span>Beleza que floresce por aqui. <span class="footer-flower">✳</span></span></div></footer>`;
}

function bottomNav() {
  const active = state.page;
  return `<nav class="mobile-nav" aria-label="Navegação principal"><button class="${active === "home" ? "current" : ""}" data-action="home">${icon("house", 20)}<span>Início</span></button><button class="${active === "explore" ? "current" : ""}" data-action="explore">${icon("search", 20)}<span>Explorar</span></button><button class="${active === "favorites" ? "current" : ""}" data-action="favorites">${icon("heart", 20)}<span>Favoritos</span></button><button class="${active === "appointments" ? "current" : ""}" data-action="appointments">${icon("calendar-days", 20)}<span>Agenda</span></button><button class="${active === "profile" ? "current" : ""}" data-action="profile">${icon("user-round", 20)}<span>Perfil</span></button></nav>`;
}

function modal() {
  if (state.viewingService) return serviceDetailsModal();
  if (state.reviewAppointmentId || state.editingReviewId) return reviewModal();
  if (state.bookingStep) return bookingModal();
  if (state.authMode) return authModal();
  if (state.locationModal) return locationModal();
  if (state.professionalModal) return professionalModal();
  if (state.editingService) return editServiceModal();
  return "";
}

function clearReviewDraft() {
  state.reviewDraftPreviews.forEach((url) => URL.revokeObjectURL(url));
  state.reviewDraftFiles = [];
  state.reviewDraftPreviews = [];
  state.reviewRemovedImageUrls = [];
  state.reviewAppointmentId = "";
  state.editingReviewId = "";
}

function editServiceModal() {
  const service = state.editingService;
  const previewUrl = service.pendingImagePreview || service.image_url;
  const imageLabel = service.pendingImageName
    ? `Nova foto selecionada: ${service.pendingImageName}`
    : service.image_url ? "Foto atual. Escolha um arquivo para substituí-la." : "Nenhuma foto adicionada. Escolha uma imagem para o serviço.";
  return `<div class="modal-backdrop" data-action="close-modal"><section class="modal professional-modal service-edit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x", 20)}</button><span class="eyebrow">ATUALIZE SUA VITRINE</span><h2 id="modal-title">Editar serviço</h2><p>As alterações aparecerão na prévia e na página pública da sua loja.</p><form id="edit-service-form" class="auth-form"><input type="hidden" name="id" value="${escapeHtml(service.id)}"><label class="form-label">Nome do serviço<input name="name" required value="${escapeHtml(service.name)}"></label><label class="form-label">Descrição<textarea name="description" rows="3" placeholder="O que está incluso neste serviço?">${escapeHtml(service.description || "")}</textarea></label><label class="form-label">Preço (R$)<input name="price" type="number" min="0" step="0.01" required value="${Number(service.price || 0)}"></label><label class="form-label">Duração (minutos)<input name="duration" type="number" min="5" max="720" required value="${Number(service.duration_minutes || 60)}"></label><label class="form-label">Trocar foto do serviço <span class="optional">(opcional)</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"></label><span class="service-image-status" aria-live="polite">${previewUrl ? `<img src="${escapeHtml(previewUrl)}" alt="Prévia da foto do serviço">` : ""}<small>${escapeHtml(imageLabel)}</small></span><button class="button button-dark modal-primary" type="submit">Salvar alterações ${icon("check-circle-2", 16)}</button></form></section></div>`;
}

function discardPendingServiceImage() {
  const service = state.editingService;
  if (!service) return;
  if (service.pendingImagePreview) URL.revokeObjectURL(service.pendingImagePreview);
  delete service.pendingImage;
  delete service.pendingImageName;
  delete service.pendingImagePreview;
  state.editingService = null;
}

function bookingModal() {
  if (!state.selectedStore || !state.bookingStep) return "";
  const store = state.selectedStore;
  const service = state.selectedService || { id: store.id, name: store.service || store.category, price: store.price || 0, duration_minutes: store.duration_minutes || 60 };
  const duration = Number(service.duration_minutes || store.duration_minutes || 60);
  const today = new Date();
  const dateOptions = Array.from({ length: 10 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const value = dateKey(date);
    return `<button class="date-option ${state.selectedDate === value ? "selected" : ""}" data-action="date" data-date="${value}"><small>${date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</small><b>${date.getDate()}</b><small>${date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</small></button>`;
  }).join("");
  const selectedWeekday = new Date(`${state.selectedDate}T12:00:00`).getDay();
  const hours = state.selectedStoreHours?.store_id === store.id && state.selectedStoreHours.weekday === selectedWeekday
    ? state.selectedStoreHours
    : state.storeHours.find((item) => item.store_id === store.id && item.weekday === selectedWeekday);
  const toMinutes = (value) => {
    const [hour, minute] = String(value || "00:00").slice(0, 5).split(":").map(Number);
    return hour * 60 + minute;
  };
  const times = [];
  if (hours && !hours.is_closed) {
    const open = toMinutes(hours.opens_at);
    const close = toMinutes(hours.closes_at);
    const now = new Date();
    const firstAvailable = state.selectedDate === dateKey(now)
      ? Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / 30) * 30
      : open;
    for (let minute = Math.max(open, firstAvailable); minute + duration <= close; minute += 30) {
      times.push(`${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`);
    }
  }
  const taken = (demoMode
    ? state.appointments.filter((item) => item.store_id === store.id && item.appointment_date === state.selectedDate && !["canceled", "rejected"].includes(item.status)).map((item) => ({ appointment_time: item.appointment_time, duration_minutes: item.duration_minutes || store.duration_minutes || 60 }))
    : state.bookedSlots);
  const isTaken = (time) => {
    const start = (value) => {
      const [hours, minutes] = String(value).split(":").map(Number);
      return hours * 60 + minutes;
    };
    const proposedStart = start(time);
    const overlaps = (startMinute, endMinute) => proposedStart < endMinute && proposedStart + duration > startMinute;
    const appointmentTaken = taken.some((booking) => overlaps(start(booking.appointment_time), start(booking.appointment_time) + Number(booking.duration_minutes || 60)));
    const breakTaken = hours?.break_start && hours?.break_end && overlaps(start(hours.break_start), start(hours.break_end));
    const blocked = state.selectedBlockedTimes.some((block) => {
      const startMinute = new Date(block.starts_at).getHours() * 60 + new Date(block.starts_at).getMinutes();
      const endMinute = new Date(block.ends_at).getHours() * 60 + new Date(block.ends_at).getMinutes();
      return overlaps(startMinute, endMinute);
    });
    return appointmentTaken || breakTaken || blocked;
  };
  const availabilityNotice = !hours
    ? "A profissional ainda não configurou os horários desta data."
    : hours.is_closed ? "A profissional não atende neste dia."
      : times.every(isTaken) ? "Todos os horários disponíveis neste dia já estão ocupados."
        : "";
  return `<div class="modal-backdrop" data-action="close-modal"><section class="modal booking-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x", 20)}</button><div class="modal-heading"><span class="eyebrow">UM TEMPO PARA VOCÊ</span><h2 id="modal-title">Agende seu momento</h2><p>${escapeHtml(store.name)}</p></div><div class="booking-progress"><span class="${state.bookingStep >= 1 ? "done" : ""}"></span><span class="${state.bookingStep >= 2 ? "done" : ""}"></span></div>${state.bookingStep === 1 ? `<div class="booking-form"><div class="selected-service"><span class="step-icon">${icon("sparkles", 19)}</span><div><b>${escapeHtml(service.name)}</b><small>${service.duration_minutes} min · ${money(service.price)}</small></div><button class="change-service" data-action="change-service">Trocar</button></div><label class="form-label">Escolha um dia<div class="date-options">${dateOptions}</div></label><label class="form-label">Horários disponíveis<div class="time-options">${times.map((time) => `<button class="time-option ${state.selectedTime === time ? "selected" : ""}" data-action="time" data-time="${time}" ${isTaken(time) ? "disabled" : ""}>${time}</button>`).join("") || `<span class="availability-empty">${escapeHtml(availabilityNotice)}</span>`}</div></label>${availabilityNotice ? `<p class="availability-notice">${escapeHtml(availabilityNotice)}</p>` : ""}<button class="button button-dark modal-primary" data-action="booking-next" ${!state.selectedTime || isTaken(state.selectedTime) ? "disabled" : ""}>Continuar ${icon("arrow-right", 17)}</button></div>` : `<form id="booking-form" class="booking-form"><div class="booking-summary">${icon("calendar-check", 19)} <span>${new Date(`${state.selectedDate}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}, às ${state.selectedTime}</span></div><label class="form-label">Seu nome<input name="name" required autocomplete="name" value="${escapeHtml(state.profile?.full_name || "")}" placeholder="Como podemos te chamar?"></label><label class="form-label">Seu WhatsApp<input name="phone" required autocomplete="tel" inputmode="tel" value="${escapeHtml(state.profile?.phone || "")}" placeholder="(11) 99999-9999"></label><label class="form-label">Algum recadinho? <span class="optional">(opcional)</span><textarea name="note" rows="2" placeholder="Conte algo que a profissional precisa saber"></textarea></label><button class="button button-dark modal-primary" type="submit">Solicitar agendamento ${icon("arrow-right", 17)}</button><p class="form-footnote">${icon("shield-check", 14)} A profissional confirmará seu horário em breve.</p></form>`}</section></div>`;
}

function authModal() {
  const isProfessional = state.authRole === "professional";
  return `<div class="modal-backdrop" data-action="close-modal"><section class="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x", 20)}</button><div class="auth-mark">v</div><span class="eyebrow">ACESSO VELLORA</span><h2 id="modal-title">${state.authMode === "signup" ? isProfessional ? "Seu negócio começa aqui." : "Seu momento começa agora." : isProfessional ? "Bem-vinda de volta." : "Que bom ter você por aqui."}</h2><p>${state.authMode === "signup" ? isProfessional ? "Crie seu acesso profissional e monte sua loja na Vellora." : "Crie sua conta para agendar e salvar seus espaços favoritos." : isProfessional ? "Entre para gerenciar sua loja e seus agendamentos." : "Entre para acompanhar seus momentos e espaços favoritos."}</p><div class="auth-role-switch" aria-label="Tipo de acesso"><button class="${isProfessional ? "" : "selected"}" data-action="auth-role" data-role="customer" aria-pressed="${!isProfessional}">${icon("user-round", 16)} Sou cliente</button><button class="${isProfessional ? "selected" : ""}" data-action="auth-role" data-role="professional" aria-pressed="${isProfessional}">${icon("store", 16)} Sou profissional</button></div><form id="auth-form" class="auth-form">${state.authMode === "signup" ? `<label class="form-label">Seu nome<input name="name" required autocomplete="name" placeholder="${isProfessional ? "Seu nome profissional" : "Nome e sobrenome"}"></label>` : ""}<label class="form-label">E-mail<input type="email" name="email" required autocomplete="email" placeholder="voce@email.com"></label><label class="form-label">Senha<input type="password" name="password" required minlength="6" autocomplete="${state.authMode === "signup" ? "new-password" : "current-password"}" placeholder="Mínimo de 6 caracteres"></label><button class="button button-dark modal-primary" type="submit">${state.authMode === "signup" ? isProfessional ? "Criar acesso profissional" : "Criar conta de cliente" : isProfessional ? "Entrar como profissional" : "Entrar como cliente"} ${icon("arrow-right", 17)}</button></form><div class="auth-switch">${state.authMode === "signup" ? "Já tem uma conta?" : "Ainda não tem uma conta?"} <button data-action="auth-mode" data-mode="${state.authMode === "signup" ? "login" : "signup"}">${state.authMode === "signup" ? "Entrar" : "Criar conta"}</button></div>${demoMode ? `<small class="demo-hint">Modo de demonstração: cada tipo de acesso usa sua própria conta neste navegador.</small>` : ""}</section></div>`;
}

function locationModal() {
  return `<div class="modal-backdrop" data-action="close-modal"><section class="modal location-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x", 20)}</button><span class="eyebrow">BELEZA BEM PERTINHO</span><h2 id="modal-title">Onde você está?</h2><p>Vamos encontrar lugares especiais perto de você.</p><form id="location-form"><label class="form-label">Cidade ou bairro<input name="location" value="${escapeHtml(state.location === "Minha localização" ? "" : state.location)}" placeholder="Ex.: Taubaté, SP"></label><button class="button button-dark modal-primary" type="submit">Atualizar localização ${icon("arrow-right", 17)}</button></form><button class="button button-outline location-gps-button" type="button" data-action="use-location">${icon("map-pin", 16)} Usar minha localização atual</button><small class="location-privacy-note">Sua posição fica neste navegador e não é enviada a serviços externos.</small></section></div>`;
}

function professionalModal() {
  return `<div class="modal-backdrop" data-action="close-modal"><section class="modal professional-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x", 20)}</button><span class="eyebrow">SEU TALENTO MERECE UM ESPAÇO</span><h2 id="modal-title">Sua loja começa aqui.</h2><p>Conte um pouquinho sobre seu negócio e dê o primeiro passo para encontrar novas clientes.</p><form id="store-form" class="auth-form"><label class="form-label">Nome do seu espaço<input name="name" required maxlength="100" placeholder="Ex.: Studio Flor de Lis"></label><label class="form-label">Seu nome<input name="owner" required maxlength="100" value="${escapeHtml(state.profile?.full_name || "")}" placeholder="Seu nome completo"></label><label class="form-label">Categoria principal<select name="category" required><option value="">Escolha uma categoria</option>${categories.map((category) => `<option>${escapeHtml(category.name)}</option>`).join("")}</select></label><label class="form-label">Cidade / bairro<input name="city" required maxlength="120" value="${escapeHtml(state.location === "Minha localização" ? "" : state.location)}" placeholder="Ex.: Taubaté, SP"></label><label class="form-label">Endereço do espaço<input name="address" maxlength="240" placeholder="Rua, número, bairro e complemento"></label><input type="hidden" name="latitude" value="${state.pendingStoreCoordinates?.latitude ?? ""}"><input type="hidden" name="longitude" value="${state.pendingStoreCoordinates?.longitude ?? ""}"><button class="button button-outline" type="button" data-action="use-store-location">${icon("map-pin", 16)} Usar localização atual da loja</button><small class="location-privacy-note">O ponto capturado será publicado na página da loja para ajudar clientes a encontrar profissionais próximos.</small><small class="store-location-status" aria-live="polite"></small><label class="form-label">Descrição da loja<textarea name="description" rows="3" maxlength="1000" placeholder="Apresente seu espaço e atendimento"></textarea></label><label class="form-label">E-mail público<input type="email" name="email" maxlength="254" placeholder="contato@seudominio.com"></label><label class="form-label">Telefone<input type="tel" name="phone" maxlength="30" placeholder="(11) 99999-9999"></label><label class="form-label">WhatsApp<input type="tel" name="whatsapp" maxlength="30" placeholder="(11) 99999-9999"></label><label class="form-label">Seu principal serviço<input name="service" required maxlength="120" placeholder="Ex.: Manicure em gel"></label><label class="form-label">Preço a partir de<input type="number" name="price" required min="0" step="0.01" placeholder="95"></label><label class="form-label">Foto da sua loja <span class="optional">(opcional)</span><input type="file" name="image" accept="image/jpeg,image/png,image/webp" capture="environment"></label><label class="form-label">Foto deste serviço <span class="optional">(opcional)</span><input type="file" name="service_image" accept="image/jpeg,image/png,image/webp" capture="environment"></label><button class="button button-dark modal-primary" type="submit">Criar minha loja ${icon("arrow-right", 17)}</button></form></section></div>`;
}

function render() {
  const content = state.page === "home" ? homePage() : state.page === "store" ? storePage() : state.page === "appointments" ? appointmentsPage() : state.page === "profile" ? profilePage() : explorePage();
  app.innerHTML = `${header()}${demoMode ? `<div class="demo-banner">${icon("info", 14)} Modo de demonstração — configure o Supabase para publicar sua loja.</div>` : ""}${content}${bottomNav()}${modal()}${state.notice ? `<div class="toast">${icon("check-circle-2", 18)} ${escapeHtml(state.notice)}</div>` : ""}`;
  createIcons({ icons: appIcons });
}

function openStore(id) {
  state.selectedStore = state.stores.find((store) => store.id === id);
  if (!state.selectedStore) return;
  state.page = "store";
  state.bookingStep = 0;
  state.authMode = "";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function beginBooking(storeId, serviceId) {
  const store = state.stores.find((item) => item.id === storeId) || state.selectedStore;
  if (!store) return;
  state.selectedStore = store;
  state.selectedService = state.services.find((item) => item.id === serviceId) || null;
  state.selectedTime = "";
  state.selectedDate = dateKey(new Date());
  state.bookedSlots = [];
  state.bookingStep = 1;
  state.authMode = "";
  render();
  loadBookedSlots(store.id, state.selectedDate);
}

async function loadBookedSlots(storeId, date, shouldRender = true) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  if (demoMode) {
    state.selectedStoreHours = state.storeHours.find((item) => item.store_id === storeId && item.weekday === weekday) || null;
    state.selectedBlockedTimes = state.blockedTimes.filter((item) => item.store_id === storeId && item.date === date);
    state.bookedSlots = state.appointments
    .filter((item) => item.store_id === storeId && item.appointment_date === date && ["pending", "confirmed"].includes(item.status))
      .map((item) => ({ appointment_time: item.appointment_time, duration_minutes: item.duration_minutes || 60 }));
  } else {
    const [{ data: slots, error: slotsError }, { data: hours, error: hoursError }, { data: blocked, error: blockedError }] = await Promise.all([
      supabase.rpc("get_store_booked_slots", { p_store_id: storeId, p_date: date }),
      supabase.from("store_hours").select("*").eq("store_id", storeId).eq("weekday", weekday).maybeSingle(),
      supabase.rpc("get_store_blocked_times", { p_store_id: storeId, p_date: date }),
    ]);
    if (slotsError || hoursError || blockedError) {
      const error = slotsError || hoursError || blockedError;
      console.error("Falha ao carregar a disponibilidade:", error);
      notify("Não foi possível carregar os horários disponíveis. Confira se a migração de agenda foi aplicada.");
      return false;
    }
    state.bookedSlots = slots || [];
    state.selectedStoreHours = hours || null;
    state.selectedBlockedTimes = blocked || [];
  }
  if (shouldRender && state.selectedStore?.id === storeId && state.selectedDate === date) {
    render();
  }
  return true;
}

async function selectedBookingSlotIsAvailable() {
  const store = state.selectedStore;
  const service = state.selectedService || { duration_minutes: store?.duration_minutes || 60 };
  if (!store || !state.selectedTime) return false;
  if (await loadBookedSlots(store.id, state.selectedDate, false) === false) return false;
  const weekday = new Date(`${state.selectedDate}T12:00:00`).getDay();
  const hours = state.selectedStoreHours?.store_id === store.id && state.selectedStoreHours.weekday === weekday
    ? state.selectedStoreHours
    : state.storeHours.find((item) => item.store_id === store.id && item.weekday === weekday);
  if (!hours || hours.is_closed) return false;
  const minuteOf = (value) => {
    const [hour, minute] = String(value).slice(0, 5).split(":").map(Number);
    return hour * 60 + minute;
  };
  const start = minuteOf(state.selectedTime);
  const end = start + Number(service.duration_minutes || store.duration_minutes || 60);
  if (start < minuteOf(hours.opens_at) || end > minuteOf(hours.closes_at)) return false;
  if (hours.break_start && hours.break_end && start < minuteOf(hours.break_end) && minuteOf(hours.break_start) < end) return false;
  const taken = demoMode
    ? state.appointments.filter((item) => item.store_id === store.id && item.appointment_date === state.selectedDate && ["pending", "confirmed"].includes(item.status))
    : state.bookedSlots;
  const overlaps = taken.some((booking) => start < minuteOf(booking.appointment_time) + Number(booking.duration_minutes || 60)
    && minuteOf(booking.appointment_time) < end);
  const blocked = state.selectedBlockedTimes.some((block) => {
    const blockStart = new Date(block.starts_at).getHours() * 60 + new Date(block.starts_at).getMinutes();
    const blockEnd = new Date(block.ends_at).getHours() * 60 + new Date(block.ends_at).getMinutes();
    return start < blockEnd && blockStart < end;
  });
  return !overlaps && !blocked;
}

async function submitBooking(form) {
  if (!await selectedBookingSlotIsAvailable()) {
    state.bookingStep = 1;
    state.selectedTime = "";
    notify("Esse horário não está mais disponível. Escolha outro.");
    return;
  }
  const values = new FormData(form);
  const store = state.selectedStore;
  const service = state.selectedService || { id: null, name: store.service || store.category, price: store.price || 0, duration_minutes: store.duration_minutes || 60 };
  const appointment = {
    store_id: store.id,
    service_id: service.id === store.id ? null : service.id,
    appointment_date: state.selectedDate,
    appointment_time: state.selectedTime,
    customer_name: values.get("name"),
    customer_phone: values.get("phone"),
    note: values.get("note") || "",
    duration_minutes: service.duration_minutes || store.duration_minutes || 60,
    status: "pending",
  };
  if (demoMode) {
    const toMinutes = (time) => {
      const [hours, minutes] = String(time).split(":").map(Number);
      return hours * 60 + minutes;
    };
    const start = toMinutes(appointment.appointment_time);
    const conflict = state.appointments.some((item) => item.store_id === store.id
      && item.appointment_date === appointment.appointment_date
      && !["canceled", "rejected"].includes(item.status)
      && start < toMinutes(item.appointment_time) + Number(item.duration_minutes || store.duration_minutes || 60)
      && start + appointment.duration_minutes > toMinutes(item.appointment_time));
    if (conflict) { notify("Esse horário acabou de ser reservado. Escolha outro."); state.bookingStep = 1; return; }
    const createdAppointment = { ...appointment, customer_id: state.user?.id || null, id: crypto.randomUUID(), service_name: service.name };
    state.appointments = [...state.appointments, createdAppointment];
    localStorage.setItem("vellora-appointments", JSON.stringify(state.appointments));
    recordDemoNotification({
      recipient_id: store.owner_id,
      kind: "new_appointment",
      title: "Novo pedido de agendamento",
      body: `${createdAppointment.customer_name} enviou uma solicitação.`,
      appointment_id: createdAppointment.id,
    });
  } else {
    if (!state.user) {
      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) {
        state.authMode = "signup";
        state.bookingStep = 0;
        notify("Crie sua conta para solicitar um agendamento.");
        return;
      }
      await supabase.auth.getSession().then(({ data }) => { state.user = data.session?.user || null; });
    }
    const { data: createdAppointment, error } = await supabase.from("appointments")
      .insert({ ...appointment, customer_id: state.user.id })
      .select("*, stores(name), services(name, price)")
      .single();
    if (error) {
      if (error.code === "23P01" || error.code === "23505") notify("Esse horário acabou de ser reservado. Escolha outro.");
      else { console.error("Falha ao criar agendamento:", error); notify("Não foi possível solicitar o agendamento. Tente novamente."); }
      state.bookingStep = 1;
      return;
    }
    state.appointments = [...state.appointments, createdAppointment];
  }
  state.bookingStep = 0;
  state.selectedStore = null;
  state.page = "appointments";
  notify("Solicitação enviada! A profissional confirmará em breve.");
}

async function submitAuth(form) {
  const values = new FormData(form);
  const email = values.get("email");
  const password = values.get("password");
  const signingUp = state.authMode === "signup";
  const professionalAccess = state.authRole === "professional";
  if (demoMode) {
    const accounts = JSON.parse(localStorage.getItem("vellora-demo-accounts") || "[]")
      .map((account) => ({ ...account, profile: { ...account.profile, role: account.profile.role || "customer" } }));
    const storedLegacyAccount = JSON.parse(localStorage.getItem("vellora-demo-account") || "null");
    const legacyAccount = storedLegacyAccount ? {
      ...storedLegacyAccount,
      profile: { ...storedLegacyAccount.profile, role: storedLegacyAccount.profile.role || "customer" },
    } : null;
    if (legacyAccount && !accounts.some((account) => account.user.email === legacyAccount.user.email)) accounts.push(legacyAccount);
    if (signingUp) {
      state.user = { id: crypto.randomUUID(), email };
      state.profile = { full_name: values.get("name"), email, role: state.authRole };
      const account = { user: state.user, profile: state.profile };
      localStorage.setItem("vellora-demo-accounts", JSON.stringify([...accounts.filter((item) => item.user.email !== email), account]));
      notify(professionalAccess ? "Acesso profissional criado. Agora configure sua loja." : "Conta de cliente criada. Bem-vinda à Vellora.");
    } else {
      const account = accounts.find((item) => item.user.email === email);
      if (account && account.profile.role !== state.authRole) {
        notify(account.profile.role === "professional" ? "Esta conta é profissional. Escolha “Sou profissional” para entrar." : "Esta conta é de cliente. Escolha “Sou cliente” para entrar.");
        return;
      }
      if (account) {
        state.user = account.user;
        state.profile = account.profile;
        notify(isProfessionalRole(state.profile) ? "Acesso profissional liberado." : "Que bom ter você de volta!");
      } else if (legacyAccount && legacyAccount.user.email === email && (legacyAccount.profile.role || "customer") === state.authRole) {
        state.user = legacyAccount.user;
        state.profile = legacyAccount.profile;
        notify("Que bom ter você de volta!");
      } else {
        notify("Não encontramos essa conta para este tipo de acesso. Confira os dados ou crie uma conta.");
        return;
      }
    }
  } else if (signingUp) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: values.get("name") } } });
    if (error) { notify(error.message); return; }
    if (!data.session) { state.authMode = ""; notify("Conta criada! Confirme seu e-mail para entrar. Depois escolha seu tipo de acesso."); render(); return; }
    state.user = data.user;
    await loadUser(data.user);
    if (professionalAccess) notify("Conta criada! Agora configure sua loja.");
    else notify("Conta de cliente criada. Bem-vinda à Vellora.");
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { notify(error.message); return; }
    await loadUser(data.user);
    const hasStore = state.ownedStores.length > 0;
    if (!professionalAccess && isProfessionalRole(state.profile)) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Falha ao encerrar sessão após selecionar tipo de acesso incorreto:", signOutError);
        notify("Não foi possível trocar o acesso. Saia da conta e tente novamente.");
        return;
      }
      state.user = null;
      state.profile = null;
      notify("Esta conta é profissional. Selecione “Sou profissional” para entrar.");
      return;
    }
    if (professionalAccess && !isProfessionalRole(state.profile) && hasStore) {
      notify("Seu perfil já tem uma loja. Continue pelo acesso profissional.");
    } else if (professionalAccess && !isProfessionalRole(state.profile)) {
      notify("Entre para começar a configurar seu acesso profissional.");
    } else {
      notify("Que bom ter você de volta!");
    }
  }
  state.authMode = "";
  state.accountMenu = false;
  state.page = "profile";
  if (professionalAccess && !(state.ownedStores.length || state.stores.some((store) => store.owner_id === state.user?.id))) {
    state.professionalModal = true;
  }
}

function isProfessionalRole(profile) {
  return profile?.role === "professional" || profile?.role === "admin";
}

async function createStore(form) {
  const values = new FormData(form);
  const rawLatitude = String(values.get("latitude") || "");
  const rawLongitude = String(values.get("longitude") || "");
  const latitude = rawLatitude ? Number(rawLatitude) : null;
  const longitude = rawLongitude ? Number(rawLongitude) : null;
  if ((latitude === null) !== (longitude === null)
    || (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90))
    || (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))) {
    notify("A localização da loja não é válida. Capture novamente ou remova a localização.");
    return;
  }
  if (!demoMode && !state.user) {
    state.professionalModal = false;
    state.viewingService = null;
    state.authMode = "signup";
    notify("Crie sua conta para publicar sua loja.");
    return;
  }
  const serviceName = values.get("service");
  const servicePrice = Number(values.get("price"));
  const [imageUrl, serviceImageUrl] = await Promise.all([
    savePortfolioImage(values.get("image"), "store"),
    savePortfolioImage(values.get("service_image"), "service"),
  ]);
  if ((values.get("image")?.size && !imageUrl) || (values.get("service_image")?.size && !serviceImageUrl)) return;
  const payload = {
    name: String(values.get("name")).trim(),
    owner_name: String(values.get("owner")).trim(),
    category: String(values.get("category")).trim(),
    city: String(values.get("city")).trim(),
    address: String(values.get("address") || "").trim() || null,
    latitude,
    longitude,
    description: String(values.get("description") || `${serviceName} com cuidado e atenção, em ${values.get("city")}.`).trim(),
    email: String(values.get("email") || "").trim() || null,
    phone: String(values.get("phone") || "").trim() || null,
    whatsapp: String(values.get("whatsapp") || "").trim() || null,
    image_url: imageUrl,
    is_active: true,
    featured: false,
  };
  if (demoMode) {
    const created = { ...payload, owner_id: state.user?.id, service: serviceName, price: servicePrice, duration_minutes: 60, rating: 5, review_count: 0, id: crypto.randomUUID() };
    state.stores.unshift(created);
    const firstService = { id: crypto.randomUUID(), store_id: created.id, name: serviceName, price: servicePrice, duration_minutes: 60, description: "", image_url: serviceImageUrl || null };
    state.services.push(firstService);
    created.services = [firstService];
    state.ownedStores = [created];
    state.profile = { ...state.profile, full_name: payload.owner_name, role: "professional" };
    const account = JSON.parse(localStorage.getItem("vellora-demo-account") || "null");
    if (account) {
      account.profile = state.profile;
      localStorage.setItem("vellora-demo-account", JSON.stringify(account));
    }
    localStorage.setItem("vellora-demo-stores", JSON.stringify(state.stores.filter((store) => !seedStores.some((seed) => seed.id === store.id))));
    localStorage.setItem("vellora-demo-services", JSON.stringify(state.services));
  } else {
    if (!state.user) { state.professionalModal = false; state.authMode = "signup"; notify("Crie sua conta para publicar sua loja."); return; }
    const { data: storeId, error } = await supabase.rpc("create_store_with_first_service", {
      p_name: payload.name,
      p_owner_name: payload.owner_name,
      p_category: payload.category,
      p_city: payload.city,
      p_description: payload.description,
      p_image_url: payload.image_url,
      p_service_name: serviceName,
      p_service_price: servicePrice,
      p_service_duration: 60,
      p_email: payload.email,
      p_phone: payload.phone,
      p_whatsapp: payload.whatsapp,
      p_address: payload.address,
      p_latitude: payload.latitude,
      p_longitude: payload.longitude,
      });
      if (error) {
        console.error("Falha ao criar loja:", error);
        notify(["PGRST202", "42883"].includes(error.code)
          ? "Aplique supabase/store-profile-and-review-stats.sql para habilitar contatos, endereço e localização da loja."
          : "Não foi possível criar sua loja. Verifique os dados e tente novamente.");
        return;
      }
    const { data, error: loadError } = await supabase.from("stores").select("*, services(*)").eq("id", storeId).single();
    if (loadError) { console.error("Falha ao carregar loja criada:", loadError); notify("A loja foi criada, mas não foi possível carregá-la."); return; }
    if (serviceImageUrl && data.services?.[0]) {
      const { error: imageError } = await supabase.from("services").update({ image_url: serviceImageUrl }).eq("id", data.services[0].id);
      if (imageError) {
        console.error("Falha ao salvar imagem do serviço inicial:", imageError);
        notify("A loja foi criada, mas não foi possível salvar a foto do serviço.");
        return;
      }
      data.services[0].image_url = serviceImageUrl;
    }
    const created = { ...data, service: data.services?.[0]?.name || serviceName, price: data.services?.[0]?.price || servicePrice, duration_minutes: data.services?.[0]?.duration_minutes || 60 };
    state.stores.unshift(created);
    state.services.push(...(data.services || []));
    state.ownedStores = [data, ...state.ownedStores];
    state.profile = { ...state.profile, role: "professional", full_name: payload.owner_name };
  }
  state.professionalModal = false;
  state.pendingStoreCoordinates = null;
  state.page = "store";
  state.selectedStore = state.stores[0];
  notify("Sua loja foi criada! Bem-vinda à Vellora.");
}

async function updateStoreDetails(form) {
  const storeId = form.dataset.storeId;
  const store = state.ownedStores.find((item) => item.id === storeId)
    || state.stores.find((item) => item.id === storeId && item.owner_id === state.user?.id);
  if (!store) {
    notify("Não encontramos sua loja para atualizar. Atualize o painel e tente novamente.");
    return;
  }
  const values = new FormData(form);
  const rawLatitude = String(values.get("latitude") || "");
  const rawLongitude = String(values.get("longitude") || "");
  const latitude = rawLatitude ? Number(rawLatitude) : null;
  const longitude = rawLongitude ? Number(rawLongitude) : null;
  if ((latitude === null) !== (longitude === null)
    || (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90))
    || (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))) {
    notify("A localização da loja não é válida. Capture novamente ou remova a localização.");
    return;
  }
  const updates = {
    name: String(values.get("name") || "").trim(),
    category: String(values.get("category") || "").trim(),
    city: String(values.get("city") || "").trim(),
    address: String(values.get("address") || "").trim() || null,
    latitude,
    longitude,
    description: String(values.get("description") || "").trim(),
    email: String(values.get("email") || "").trim() || null,
    phone: String(values.get("phone") || "").trim() || null,
    whatsapp: String(values.get("whatsapp") || "").trim() || null,
  };
  if (demoMode) {
    Object.assign(store, updates);
    state.stores = state.stores.map((item) => item.id === storeId ? { ...item, ...updates } : item);
    state.ownedStores = state.ownedStores.map((item) => item.id === storeId ? { ...item, ...updates } : item);
    try {
      localStorage.setItem("vellora-demo-stores", JSON.stringify(state.stores.filter((item) => !seedStores.some((seed) => seed.id === item.id))));
    } catch (error) {
      console.error("Falha ao salvar os dados da loja localmente:", error);
      notify("Não foi possível salvar os dados neste navegador.");
      return;
    }
  } else {
    const { data, error } = await supabase.from("stores").update(updates)
      .eq("id", storeId).eq("owner_id", state.user.id).select().single();
    if (error) {
      console.error("Falha ao atualizar os dados da loja:", error);
      notify(error.code === "42703" || error.code === "PGRST204"
        ? "Aplique supabase/store-profile-and-review-stats.sql para habilitar contatos, endereço e localização da loja."
        : "Não foi possível salvar os dados da loja. Tente novamente.");
      return;
    }
    Object.assign(store, data);
    state.stores = state.stores.map((item) => item.id === storeId ? { ...item, ...data } : item);
    state.ownedStores = state.ownedStores.map((item) => item.id === storeId ? { ...item, ...data } : item);
  }
  if (state.selectedStore?.id === storeId) {
    state.selectedStore = state.stores.find((item) => item.id === storeId) || store;
  }
  state.pendingStoreCoordinates = null;
  notify("Informações e contatos da loja atualizados.");
}

async function optimizeImage(file, kind) {
  const bitmap = await createImageBitmap(file);
  const isServiceImage = kind === "service";
  const outputSize = isServiceImage ? 800 : 1200;
  const scale = isServiceImage
    ? outputSize / Math.min(bitmap.width, bitmap.height)
    : Math.min(1, outputSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = isServiceImage ? outputSize : Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = isServiceImage ? outputSize : Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível processar a imagem.");
  if (isServiceImage) {
    const cropWidth = Math.min(bitmap.width, bitmap.height);
    const cropHeight = cropWidth;
    const cropX = (bitmap.width - cropWidth) / 2;
    const cropY = (bitmap.height - cropHeight) / 2;
    context.drawImage(bitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, outputSize, outputSize);
  } else {
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Não foi possível compactar a imagem.")), "image/webp", 0.78));
}

async function savePortfolioImage(file, kind) {
  if (!file?.size) return null;
  if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
    notify("Escolha uma imagem válida de até 10 MB.");
    return null;
  }
  try {
    const optimizedImage = await optimizeImage(file, kind);
    if (demoMode) {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(optimizedImage);
      });
    }
    const bucket = kind === "review" ? "review-images" : "store-images";
    const path = `${state.user.id}/${kind}-${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from(bucket).upload(path, optimizedImage, { contentType: "image/webp", upsert: false });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  } catch (error) {
    console.error(`Falha ao processar ou enviar imagem (${kind}):`, error);
    notify("Não foi possível enviar a imagem. Tente uma foto menor ou outro formato.");
    return null;
  }
}

async function addService(form) {
  const store = state.ownedStores[0] || state.stores.find((item) => item.owner_id === state.user?.id);
  if (!store) { notify("Crie uma loja antes de cadastrar serviços."); return; }
  const values = new FormData(form);
  const imageUrl = await savePortfolioImage(values.get("image"), "service");
  if (values.get("image")?.size && !imageUrl) return;
  const service = { store_id: store.id, name: values.get("name"), price: Number(values.get("price")), duration_minutes: Number(values.get("duration")), description: values.get("description") || "" };
  if (imageUrl) service.image_url = imageUrl;
  if (!demoMode) {
    const { data, error } = await supabase.from("services").insert(service).select().single();
    if (error) { console.error("Falha ao cadastrar serviço:", error); notify("Não foi possível cadastrar o serviço."); return; }
    state.services.push(data);
    store.services = [...(store.services || []), data];
  } else {
    const created = { ...service, id: crypto.randomUUID() };
    state.services.push(created);
    store.services = [...(store.services || []), created];
    store.service = created.name;
    store.price = created.price;
    localStorage.setItem("vellora-demo-services", JSON.stringify(state.services));
    try {
      localStorage.setItem("vellora-demo-stores", JSON.stringify(state.stores.filter((item) => !seedStores.some((seed) => seed.id === item.id))));
    } catch (error) {
      console.error("Falha ao salvar prévia da loja localmente:", error);
      notify("Serviço adicionado, mas não foi possível salvar a loja neste navegador.");
      return;
    }
  }
  notify("Serviço adicionado à sua loja.");
}

async function updateService(form) {
  const values = new FormData(form);
  const serviceId = String(values.get("id"));
  const service = state.services.find((item) => item.id === serviceId)
    || state.ownedStores.flatMap((store) => store.services || []).find((item) => item.id === serviceId)
    || state.stores.flatMap((store) => store.services || []).find((item) => item.id === serviceId)
    || (state.editingService?.id === serviceId ? state.editingService : null);
  if (!service) { notify("Não encontramos esse serviço. Atualize o painel e tente novamente."); return; }
  if (!state.services.some((item) => item.id === service.id)) state.services.push(service);
  const image = values.get("image")?.size ? values.get("image") : service.pendingImage;
  const imageUrl = image?.size ? await savePortfolioImage(image, "service") : service.image_url;
  if (image?.size && !imageUrl) {
    notify("A foto não foi salva. A imagem selecionada foi mantida; tente novamente ou escolha outra.");
    return;
  }
  const updates = {
    name: String(values.get("name")).trim(),
    description: String(values.get("description") || "").trim(),
    price: Number(values.get("price")),
    duration_minutes: Number(values.get("duration")),
  };
  if (image?.size) updates.image_url = imageUrl;
  if (!demoMode) {
    const { data, error } = await supabase.from("services").update(updates).eq("id", service.id).eq("store_id", service.store_id).select().single();
    if (error) { console.error("Falha ao editar serviço:", error); notify("Não foi possível salvar as alterações do serviço."); return; }
    Object.assign(service, data);
  } else {
    Object.assign(service, updates);
    syncStoreService(service);
    try {
      localStorage.setItem("vellora-demo-services", JSON.stringify(state.services));
      localStorage.setItem("vellora-demo-stores", JSON.stringify(state.stores.filter((item) => !seedStores.some((seed) => seed.id === item.id))));
    }
    catch (error) {
      console.error("Falha ao salvar serviços localmente:", error);
      notify("Não foi possível salvar as alterações neste navegador. Libere espaço e tente novamente.");
      return;
    }
  }
  if (service.pendingImagePreview) URL.revokeObjectURL(service.pendingImagePreview);
  delete service.pendingImage;
  delete service.pendingImageName;
  delete service.pendingImagePreview;
  syncStoreService(service);
  state.editingService = null;
  notify("Serviço atualizado na sua loja.");
}

function syncStoreService(service) {
  for (const store of [...state.stores, ...state.ownedStores]) {
    if (store.id !== service.store_id) continue;
    store.services = (store.services || []).map((item) => item.id === service.id ? service : item);
    const firstActive = store.services.find((item) => item.is_active !== false);
    if (firstActive) {
      store.service = firstActive.name;
      store.price = firstActive.price;
      store.duration_minutes = firstActive.duration_minutes;
    }
  }
}

async function setServiceActive(serviceId, isActive) {
  const service = state.services.find((item) => item.id === serviceId);
  if (!service) { notify("Não encontramos esse serviço. Atualize o painel e tente novamente."); return; }
  if (!isActive && !window.confirm(`Ocultar “${service.name}” da loja? O histórico de agendamentos será preservado.`)) return;
  if (!demoMode) {
    const { data, error } = await supabase.from("services").update({ is_active: isActive }).eq("id", serviceId).eq("store_id", service.store_id).select().single();
    if (error) { console.error("Falha ao atualizar publicação do serviço:", error); notify("Não foi possível atualizar o serviço."); return; }
    Object.assign(service, data);
  } else {
    service.is_active = isActive;
    try { localStorage.setItem("vellora-demo-services", JSON.stringify(state.services)); }
    catch (error) { console.error("Falha ao salvar situação do serviço:", error); notify("Não foi possível salvar a alteração neste navegador."); return; }
  }
  syncStoreService(service);
  if (demoMode) {
    try {
      localStorage.setItem("vellora-demo-stores", JSON.stringify(state.stores.filter((item) => !seedStores.some((seed) => seed.id === item.id))));
    } catch (error) {
      console.error("Falha ao salvar a prévia atualizada:", error);
      notify("Serviço atualizado, mas não foi possível salvar a loja neste navegador.");
      return;
    }
  }
  notify(isActive ? "Serviço publicado novamente na sua loja." : "Serviço ocultado da loja. Os agendamentos anteriores foram preservados.");
}

async function updateBookingStatus(id, status) {
  const appointment = state.appointments.find((item) => item.id === id);
  if (!appointment) { notify("Não encontramos esse agendamento."); return; }
  if (status === "completed" && appointment.status !== "confirmed") {
    notify("Somente um agendamento confirmado pode ser marcado como concluído.");
    return;
  }
  if (!demoMode) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) { console.error("Falha ao atualizar agendamento:", error); notify("Não foi possível atualizar o agendamento."); return; }
  }
  state.appointments = state.appointments.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment);
  if (demoMode) {
    localStorage.setItem("vellora-appointments", JSON.stringify(state.appointments));
    const label = ({ confirmed: "Agendamento confirmado", completed: "Serviço concluído", rejected: "Agendamento recusado" })[status] || "Agendamento atualizado";
    recordDemoNotification({
      recipient_id: appointment.customer_id,
      kind: "appointment_status",
      title: label,
      body: `${appointment.appointment_date} às ${String(appointment.appointment_time).slice(0, 5)}`,
      appointment_id: id,
    });
  }
  else await refreshAppointments();
  notify(({ confirmed: "Agendamento confirmado.", completed: "Serviço marcado como concluído.", rejected: "Agendamento recusado." })[status] || "Agendamento atualizado.");
}

app.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) {
    if (state.accountMenu) { state.accountMenu = false; render(); }
    return;
  }
  if (target.classList.contains("modal-backdrop") && event.target !== target) return;
  const { action, id, category, date, time, service } = target.dataset;
  if (state.accountMenu && action !== "account-menu" && !["profile", "appointments", "logout"].includes(action)) state.accountMenu = false;
  if (action === "home") { state.page = "home"; state.category = ""; }
  if (action === "explore") { state.page = "explore"; state.category = ""; }
  if (action === "favorites") state.page = "favorites";
  if (action === "appointments") state.page = "appointments";
  if (action === "notifications") await markAllNotificationsRead();
  if (action === "profile") state.page = "profile";
  if (action === "profile" || action === "appointments") state.accountMenu = false;
  if (action === "how") { state.page = "home"; setTimeout(() => document.querySelector("#como-funciona")?.scrollIntoView({ behavior: "smooth" }), 50); }
  if (action === "location") state.locationModal = true;
  if (action === "use-location") captureCurrentLocation();
  if (action === "use-store-location") captureCurrentLocation({ store: true });
  if (action === "login" || action === "login-professional") {
    state.authRole = action === "login-professional" ? "professional" : "customer";
    state.authMode = "login";
    state.bookingStep = 0;
  }
  if (action === "signup") { state.authRole = "customer"; state.authMode = "signup"; state.bookingStep = 0; }
  if (action === "auth-role") state.authRole = target.dataset.role === "professional" ? "professional" : "customer";
  if (action === "auth-mode") state.authMode = target.dataset.mode === "signup" ? "signup" : "login";
  if (action === "account-menu") state.accountMenu = !state.accountMenu;
  if (action === "professional") {
    state.authRole = "professional";
    state.bookingStep = 0;
    state.authMode = state.user ? "" : "signup";
    state.professionalModal = Boolean(state.user);
  }
  if (action === "close-modal") { state.bookingStep = 0; state.authMode = ""; state.authRole = "customer"; state.locationModal = false; state.professionalModal = false; state.viewingService = null; discardPendingServiceImage(); clearReviewDraft(); }
  if (action === "close-service-details") state.viewingService = null;
  if (action === "edit-service") {
    state.editingService = state.services.find((item) => item.id === id) || null;
  }
  if (action === "delete-service") await setServiceActive(id, false);
  if (action === "restore-service") await setServiceActive(id, true);
  if (action === "store") {
    openStore(id);
    if (state.selectedStore) {
      await loadServiceEngagement(state.selectedStore);
      updateStoreReviewStats(state.selectedStore.id, state.serviceReviews);
    }
  }
  if (action === "service-details") {
    const storeDetails = state.selectedStore || state.stores.find((item) => (item.services || []).some((serviceItem) => serviceItem.id === id));
    const serviceDetails = state.services.find((item) => item.id === id)
      || state.stores.flatMap((store) => store.services || []).find((item) => item.id === id);
    const fallbackService = storeDetails && id === storeDetails.id
      ? { id, store_id: storeDetails.id, name: storeDetails.service || storeDetails.category, description: "", price: storeDetails.price || 0, duration_minutes: storeDetails.duration_minutes || 60 }
      : null;
    const resolvedService = serviceDetails || fallbackService;
    if (resolvedService && storeDetails) state.viewingService = { service: resolvedService, store: storeDetails };
  }
  if (action === "review-appointment") {
    const appointment = state.appointments.find((item) => item.id === id);
    if (!appointment || appointment.status !== "completed" || appointment.customer_id !== state.user?.id) {
      notify("Não encontramos um serviço concluído disponível para avaliar.");
    } else if (state.reviewedAppointmentIds.includes(appointment.id)) {
      notify("Este agendamento já foi avaliado. Você pode editar sua avaliação na página da loja.");
    } else {
      clearReviewDraft();
      state.reviewAppointmentId = appointment.id;
    }
  }
  if (action === "review-service") {
    const appointment = state.appointments.find((item) =>
      item.service_id === id && item.status === "completed" && item.customer_id === state.user?.id
      && !state.reviewedAppointmentIds.includes(item.id));
    if (appointment) {
      clearReviewDraft();
      state.reviewAppointmentId = appointment.id;
    }
  }
  if (action === "edit-review") {
    const review = state.serviceReviews.find((item) => item.appointment_id === id);
    const appointment = state.appointments.find((item) => item.id === id);
    if (!review || !appointment || appointment.customer_id !== state.user?.id || appointment.status !== "completed") {
      notify("Não encontramos uma avaliação sua que possa ser editada.");
    } else {
      clearReviewDraft();
      state.editingReviewId = review.id;
      state.reviewAppointmentId = review.appointment_id;
    }
  }
  if (action === "close-review" || action === "cancel-review-edit") {
    clearReviewDraft();
  }
  if (action === "remove-review-photo") {
    if (target.dataset.kind === "existing") {
      const url = target.dataset.url;
      if (url && !state.reviewRemovedImageUrls.includes(url)) state.reviewRemovedImageUrls.push(url);
    } else if (target.dataset.kind === "new") {
      const index = Number(target.dataset.index);
      const preview = state.reviewDraftPreviews[index];
      if (preview) URL.revokeObjectURL(preview);
      state.reviewDraftFiles.splice(index, 1);
      state.reviewDraftPreviews.splice(index, 1);
    }
  }
  if (action === "like-service") await toggleServiceLike(id);
  if (action === "book") { state.viewingService = null; beginBooking(id, service); }
  if (action === "date") {
    state.selectedDate = date;
    state.selectedTime = "";
    state.bookedSlots = [];
    await loadBookedSlots(state.selectedStore.id, date);
  }
  if (action === "time") state.selectedTime = time;
  if (action === "change-service") { state.bookingStep = 0; state.selectedStore && (state.page = "store"); }
  if (action === "category") { state.page = "explore"; state.category = category; state.query = ""; }
  if (action === "search") { state.page = "explore"; state.query = document.querySelector("#hero-search")?.value.trim() || ""; state.category = ""; }
  if (action === "favorite") {
    const removing = state.favorites.includes(id);
    if (removing) state.favorites = state.favorites.filter((item) => item !== id);
    else state.favorites.push(id);
    localStorage.setItem("vellora-favorites", JSON.stringify(state.favorites));
    if (!demoMode && state.user) {
      const request = removing
        ? supabase.from("favorites").delete().eq("customer_id", state.user.id).eq("store_id", id)
        : supabase.from("favorites").upsert({ customer_id: state.user.id, store_id: id }, { onConflict: "customer_id,store_id" });
      const { error } = await request;
      if (error) { console.error("Falha ao atualizar favorito:", error); notify("Não foi possível atualizar seus favoritos."); }
    }
  }
  if (action === "cancel-booking") {
    if (demoMode) {
      const appointment = state.appointments.find((item) => item.id === id);
      state.appointments = state.appointments.map((appointment) => appointment.id === id ? { ...appointment, status: "canceled" } : appointment);
      localStorage.setItem("vellora-appointments", JSON.stringify(state.appointments));
      if (appointment) {
        const ownerId = state.stores.find((store) => store.id === appointment.store_id)?.owner_id;
        recordDemoNotification({
          recipient_id: ownerId,
          kind: "appointment_status",
          title: "Agendamento cancelado",
          body: appointment.customer_name || "Sua cliente",
          appointment_id: id,
        });
      }
    } else {
      const { error } = await supabase.from("appointments").update({ status: "canceled" }).eq("id", id).eq("customer_id", state.user.id);
      if (error) { console.error("Falha ao cancelar agendamento:", error); notify("Não foi possível cancelar seu agendamento."); return; }
      state.appointments = state.appointments.map((appointment) => appointment.id === id ? { ...appointment, status: "canceled" } : appointment);
    }
    notify("Agendamento cancelado.");
  }
  if (action === "logout") {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Falha ao sair da conta:", error);
        notify("Não foi possível sair da conta. Verifique sua conexão e tente novamente.");
        return;
      }
    }
    state.user = null;
    state.profile = null;
    state.reviewAppointmentId = "";
    state.editingReviewId = "";
    state.reviewPromptedAppointmentIds = [];
    state.ownedStores = [];
    state.storeHours = [];
    state.blockedTimes = [];
    state.accountMenu = false;
    state.authRole = "customer";
    state.authMode = "";
    state.professionalModal = false;
    state.page = "home";
    notify("Você saiu da sua conta.");
  }
  if (action === "contact") notify("Fale com a gente: oi@vellora.com.br");
  if (action === "booking-status") await updateBookingStatus(id, target.dataset.status);
  if (action === "propose-time") state.proposingAppointmentId = id;
  if (action === "remove-block") await removeBlockedTime(id);
  if (action === "respond-proposal") await respondToAppointmentProposal(id, target.dataset.response);
  if (action === "read-notification") await markNotificationRead(id);
  if (action === "booking-next") {
    if (await selectedBookingSlotIsAvailable()) state.bookingStep = 2;
    else {
      state.selectedTime = "";
      notify("Esse horário não está mais disponível. Escolha outro.");
    }
  }
  if (action === "install") {
    if (state.installPrompt) {
      await state.installPrompt.prompt();
      state.installPrompt = null;
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      notify("No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.");
    } else {
      notify("Use o menu do navegador e escolha “Instalar app” ou “Adicionar à tela inicial”.");
    }
  }
  if (action === "use-location" || action === "use-store-location") return;
  render();
});

app.addEventListener("input", (event) => {
  if (event.target.id === "explore-search") {
    state.query = event.target.value;
    const cursor = event.target.selectionStart;
    render();
    const input = document.querySelector("#explore-search");
    input?.focus();
    input?.setSelectionRange(cursor, cursor);
  }
});

app.addEventListener("change", (event) => {
  if (event.target.id === "sort-select") { state.sort = event.target.value; render(); }
  if (event.target instanceof HTMLSelectElement && event.target.matches('.service-review-form select[name="appointment_id"]')) {
    state.reviewAppointmentId = event.target.value;
    render();
  }
  if (event.target instanceof HTMLInputElement && event.target.matches('.service-review-form input[name="images"]')) {
    const appointment = state.appointments.find((item) =>
      item.id === state.reviewAppointmentId || item.id === state.serviceReviews.find((review) => review.id === state.editingReviewId)?.appointment_id);
    const review = state.serviceReviews.find((item) =>
      item.id === state.editingReviewId || item.appointment_id === appointment?.id);
    const existingCount = (review?.image_urls || [])
      .filter((url) => url && !state.reviewRemovedImageUrls.includes(url)).length;
    const remaining = Math.max(0, 5 - existingCount - state.reviewDraftFiles.length);
    const selectedFiles = Array.from(event.target.files || []);
    const imageFiles = selectedFiles.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    const filesToAdd = imageFiles.slice(0, remaining);
    state.reviewDraftFiles.push(...filesToAdd);
    state.reviewDraftPreviews.push(...filesToAdd.map((file) => URL.createObjectURL(file)));
    if (filesToAdd.length !== selectedFiles.length) {
      notify(imageFiles.length !== selectedFiles.length
        ? "Use imagens JPG, PNG ou WEBP. Cada avaliação aceita até 5 fotos."
        : "Cada avaliação aceita até 5 fotos.");
    } else {
      render();
    }
  }
  if (event.target.matches('#edit-service-form input[name="image"]') && state.editingService) {
    const file = event.target.files?.[0];
    if (file) {
      if (state.editingService.pendingImagePreview) URL.revokeObjectURL(state.editingService.pendingImagePreview);
      state.editingService.pendingImage = file;
      state.editingService.pendingImageName = file.name;
      state.editingService.pendingImagePreview = URL.createObjectURL(file);
      render();
    }
  }
});

app.addEventListener("change", (event) => {
  const checkbox = event.target;
  if (!(checkbox instanceof HTMLInputElement) || !checkbox.matches('.availability-closed input[type="checkbox"]')) return;
  const row = checkbox.closest(".availability-day-row");
  row?.querySelectorAll('input[type="time"]').forEach((input) => { input.disabled = checkbox.checked; });
});

app.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const formId = form.getAttribute("id");
  if (formId === "auth-form") {
    try {
      await submitAuth(form);
    } catch (error) {
      console.error("Falha ao autenticar conta:", error);
      notify("Não foi possível concluir o acesso. Verifique sua conexão e tente novamente.");
    }
  }
  if (formId === "booking-form") await submitBooking(form);
  if (formId === "location-form") {
    const location = String(new FormData(form).get("location") || "").trim();
    if (!location) {
      notify("Informe sua cidade ou bairro para priorizar lojas próximas.");
      return;
    }
    state.location = location;
    state.customerCoordinates = null;
    localStorage.setItem("vellora-location", state.location);
    localStorage.removeItem("vellora-location-coordinates");
    state.locationModal = false;
    notify("Localização atualizada. Lojas da região aparecem primeiro.");
  }
  if (formId === "store-form") await createStore(form);
  if (formId === "store-settings-form") {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton?.disabled) return;
    if (submitButton) submitButton.disabled = true;
    try {
      await updateStoreDetails(form);
    } catch (error) {
      console.error("Falha inesperada ao salvar informações da loja:", error);
      notify("Não foi possível salvar as informações da loja. Tente novamente.");
    }
  }
  if (formId === "service-form") await addService(form);
  if (formId === "edit-service-form") {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton?.disabled) return;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Salvando alterações...";
    }
    try {
      await updateService(form);
    } catch (error) {
      console.error("Falha inesperada ao salvar alterações do serviço:", error);
      notify("Não foi possível salvar as alterações. Verifique sua conexão e tente novamente.");
    }
  }
  if (form.classList.contains("service-review-form")) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton?.disabled) return;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = form.dataset.reviewId ? "Salvando avaliação..." : "Publicando avaliação...";
    }
    try {
      await submitServiceReview(form);
    } catch (error) {
      console.error("Falha inesperada ao publicar avaliação:", error);
      notify("Não foi possível publicar sua avaliação. Tente novamente.");
    }
  }
  if (formId === "store-hours-form" || formId === "blocked-time-form" || form.classList.contains("appointment-proposal-form")) {
    try {
      if (formId === "store-hours-form") await saveStoreHours(form);
      if (formId === "blocked-time-form") {
        await addBlockedTime(form);
        form.reset();
      }
      if (form.classList.contains("appointment-proposal-form")) await proposeAppointmentTime(form);
    } catch (error) {
      console.error("Falha ao atualizar a agenda:", error);
      notify(error instanceof Error ? error.message : "Não foi possível atualizar a agenda. Tente novamente.");
    }
  }
  if (formId === "newsletter-form") notify("Prontinho! Você receberá novidades da Vellora.");
  render();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.installPrompt = event;
  render();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    state.bookingStep = 0; state.authMode = ""; state.locationModal = false; state.professionalModal = false; state.viewingService = null; state.accountMenu = false; discardPendingServiceImage(); clearReviewDraft(); render();
  }
  if (event.key === "Enter" && event.target.id === "hero-search") {
    state.query = event.target.value.trim(); state.page = "explore"; render();
  }
});

window.setInterval(() => {
  if (!document.hidden) void checkCompletedAppointmentsForReview();
}, 10000);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void checkCompletedAppointmentsForReview();
});

try {
  const user = JSON.parse(localStorage.getItem("vellora-demo-account") || "null");
  if (demoMode && user) { state.user = user.user; state.profile = user.profile; }
  const savedStores = JSON.parse(localStorage.getItem("vellora-demo-stores") || "[]");
  const savedServices = JSON.parse(localStorage.getItem("vellora-demo-services") || "[]");
  const savedHours = JSON.parse(localStorage.getItem("vellora-demo-store-hours") || "[]");
  const savedBlockedTimes = JSON.parse(localStorage.getItem("vellora-demo-blocked-times") || "[]");
  const savedNotifications = JSON.parse(localStorage.getItem("vellora-demo-notifications") || "[]");
  const savedLikes = JSON.parse(localStorage.getItem("vellora-service-likes") || "[]");
  const savedReviews = JSON.parse(localStorage.getItem("vellora-service-reviews") || "[]");
  if (demoMode) {
    state.storeHours = savedHours;
    state.blockedTimes = savedBlockedTimes;
    state.notifications = savedNotifications;
    state.serviceLikes = savedLikes;
    state.serviceReviews = savedReviews;
    state.reviewedAppointmentIds = savedReviews.map((review) => review.appointment_id);
  }
  if (demoMode && savedStores.length) {
    state.stores = [...savedStores, ...seedStores];
    state.ownedStores = savedStores;
    state.services = savedServices.length ? savedServices : savedStores.map((store) => ({ id: store.id, store_id: store.id, name: store.service, price: store.price, duration_minutes: store.duration_minutes }));
  }
} catch (error) {
  console.error("Falha ao restaurar dados locais:", error);
}

render();
if (demoMode) void loadStoreReviewStats().then(render);
loadBackend();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then(() => caches.keys())
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("vellora-")).map((key) => caches.delete(key))))
      .catch((error) => console.error("Falha ao limpar o cache PWA durante o desenvolvimento:", error));
  } else {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch((error) => console.error("Falha ao registrar o service worker:", error));
  }
}
