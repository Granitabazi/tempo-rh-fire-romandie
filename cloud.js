(function () {
  const config = window.TEMPO_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  const authScreen = () => document.getElementById("authScreen");
  const message = text => { const el=document.getElementById("authMessage"); if(el) el.textContent=text || ""; };
  let client = null;
  let profile = null;
  let organizationId = null;
  let syncTimer = null;

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
    if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
    if(!configured){showApp();status("Mode local · configuration cloud requise");return;}
    client=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey);
    const { data:{ session } }=await client.auth.getSession();
    if(session){try{await resolveAccess(session.user);showApp();setTimeout(loadSnapshot,200)}catch(e){message("Votre compte n’est pas encore rattaché à l’entreprise.");showAuth()}}else showAuth();
    client.auth.onAuthStateChange(async(event,session)=>{if(event==="SIGNED_OUT")showAuth();if(event==="SIGNED_IN"&&session){await resolveAccess(session.user);showApp();setTimeout(loadSnapshot,200)}});
  }
  document.addEventListener("DOMContentLoaded",()=>{
    document.getElementById("authForm")?.addEventListener("submit",async e=>{e.preventDefault();message("");if(!configured)return message("La connexion cloud n’est pas encore configurée.");const email=document.getElementById("authEmail").value,password=document.getElementById("authPassword").value;const {error}=await client.auth.signInWithPassword({email,password});if(error)message("Connexion impossible. Vérifiez vos informations.")});
    document.getElementById("resetPasswordBtn")?.addEventListener("click",async()=>{const email=document.getElementById("authEmail").value;if(!email)return message("Indiquez d’abord votre adresse e-mail.");const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});message(error?"Envoi impossible.":"Un e-mail de réinitialisation a été envoyé.")});
    initialize().catch(()=>{showAuth();message("Impossible de joindre le service de connexion.")});
  });
})();
