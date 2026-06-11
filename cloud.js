(function () {
  const config = window.TEMPO_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  const authScreen = () => document.getElementById("authScreen");
  const message = text => { const el=document.getElementById("authMessage"); if(el) el.textContent=text || ""; };
  let client = null;
  let profile = null;
  let organizationId = null;
  let syncTimer = null;
  let cloudReady = false;

  function showApp() { authScreen()?.classList.add("hidden"); }
  function showAuth() { authScreen()?.classList.remove("hidden"); }
  function status(text) {
    let el=document.getElementById("cloudStatus");
    if(!el){el=document.createElement("div");el.id="cloudStatus";el.className="cloud-status";document.body.appendChild(el)}
    el.textContent=text;
  }
  async function resolveAccess(user) {
    const { data, error } = await client.from("profiles").select("id,full_name,role,organization_id,organizations(name,slug)").eq("id",user.id).single();
    if(error) throw error;
    profile=data; organizationId=data.organization_id;
    window.TEMPO_CLOUD_USER=data;
    localStorage.setItem("tempoRole",["hr","admin","manager"].includes(data.role)?"hr":"employee");
    window.dispatchEvent(new CustomEvent("tempo:user",{detail:data}));
  }
  async function loadSnapshot() {
    if(!organizationId) return;
    const { data, error } = await client.from("app_snapshots").select("payload,updated_at").eq("organization_id",organizationId).maybeSingle();
    if(error) throw error;
    if(data?.payload && window.tempoImportState) window.tempoImportState(data.payload);
    status("Cloud synchronisé");
  }
  async function saveSnapshot() {
    if(!organizationId || !window.tempoExportState) return;
    status("Synchronisation…");
    const payload=window.tempoExportState();
    const { error }=await client.from("app_snapshots").upsert({organization_id:organizationId,payload,updated_by:profile.id,updated_at:new Date().toISOString()},{onConflict:"organization_id"});
    status(error?"Synchronisation échouée":"Cloud synchronisé");
  }
  function scheduleSave() { clearTimeout(syncTimer); syncTimer=setTimeout(saveSnapshot,700); }
  window.tempoCloudSave=scheduleSave;
  window.tempoCloudLogout=()=>client?.auth.signOut();

  async function initialize() {
    if("serviceWorker" in navigator) {
      const registrations=await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration=>registration.unregister()));
    }
    if("caches" in window) {
      const keys=await caches.keys();
      await Promise.all(keys.map(key=>caches.delete(key)));
    }
    if(!configured){showApp();status("Mode local · configuration cloud requise");return;}
    client=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}});
    cloudReady=true;
    const { data:{ session } }=await client.auth.getSession();
    if(session){try{await resolveAccess(session.user);showApp();setTimeout(loadSnapshot,200)}catch(e){message("Votre compte n’est pas encore rattaché à l’entreprise.");showAuth()}}else showAuth();
    client.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_OUT")showAuth();if(event==="TOKEN_REFRESHED"&&session)status("Session sécurisée")});
  }
  document.addEventListener("DOMContentLoaded",()=>{
    window.TEMPO_AUTH_ATTACHED=true;
    document.getElementById("authForm")?.addEventListener("submit",async e=>{e.preventDefault();const button=document.querySelector('#authForm button[type="submit"]');message("Vérification en cours…");if(!configured)return message("La connexion cloud n’est pas encore configurée.");if(!cloudReady||!client)return message("Le service de connexion démarre. Réessayez dans quelques secondes.");if(button){button.disabled=true;button.textContent="Connexion…"}const email=document.getElementById("authEmail").value.trim(),password=document.getElementById("authPassword").value;try{const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;if(!data?.user)throw new Error("Utilisateur introuvable");message("Compte reconnu, ouverture…");await resolveAccess(data.user);showApp();setTimeout(loadSnapshot,200)}catch(error){await client.auth.signOut({scope:"local"}).catch(()=>{});const detail=String(error?.message||"");message(detail.includes("Invalid login")?"Adresse e-mail ou mot de passe incorrect.":detail.includes("JSON object requested")||detail.includes("0 rows")?"Ce compte existe mais son profil Fire Romandie est manquant.":`Connexion impossible: ${detail||"erreur inconnue"}`)}finally{if(button){button.disabled=false;button.textContent="Se connecter"}}});
    document.getElementById("resetPasswordBtn")?.addEventListener("click",async()=>{const email=document.getElementById("authEmail").value;if(!email)return message("Indiquez d’abord votre adresse e-mail.");const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});message(error?"Envoi impossible.":"Un e-mail de réinitialisation a été envoyé.")});
    initialize().catch(()=>{showAuth();message("Impossible de joindre le service de connexion.")});
  });
})();
