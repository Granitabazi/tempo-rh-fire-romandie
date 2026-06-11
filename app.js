<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#17352d">
  <meta name="description" content="Gestion RH, timbrage et suivi de chantier Fire Romandie">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" href="icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="icon.svg">
  <title>Tempo RH</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="auth-screen" id="authScreen">
    <div class="auth-card">
      <div class="brand auth-brand"><span class="brand-mark">T</span><span>Tempo<span>RH</span></span></div>
      <p class="eyebrow">FIRE ROMANDIE SA</p><h1>Bienvenue</h1><p>Connectez-vous à votre espace de travail.</p>
      <form id="authForm"><label>Adresse e-mail<input type="email" id="authEmail" autocomplete="email" required placeholder="prenom@fireromandie.ch"></label><label>Mot de passe<input type="password" id="authPassword" autocomplete="current-password" required minlength="8"></label><button class="primary-btn" type="submit">Se connecter</button></form>
      <button class="auth-link" id="resetPasswordBtn">Mot de passe oublié ?</button><div class="auth-message" id="authMessage"></div>
    </div>
  </div>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">T</span><span>Tempo<span>RH</span></span></div>
      <nav id="mainNav">
        <button class="nav-item active" data-view="dashboard"><span>⌂</span> Vue d'ensemble</button>
        <button class="nav-item" data-view="clock"><span>◷</span> Mon temps</button>
        <button class="nav-item" data-view="leave"><span>◇</span> Congés & absences</button>
        <button class="nav-item" data-view="planning"><span>▦</span> Planning d'équipe</button>
        <button class="nav-item" data-view="fieldReports"><span>▧</span> Rapports chantier</button>
        <button class="nav-item hr-only" data-view="sites"><span>▤</span> Chantiers & rendement</button>
        <div class="nav-label hr-only">GESTION RH</div>
        <button class="nav-item hr-only" data-view="approvals"><span>✓</span> Validations <b id="approvalBadge">3</b></button>
        <button class="nav-item hr-only" data-view="people"><span>♙</span> Collaborateurs</button>
        <button class="nav-item hr-only" data-view="reports"><span>↗</span> Rapports</button>
      </nav>
      <div class="sidebar-card">
        <div class="mini-icon">?</div>
        <strong>Besoin d'aide ?</strong>
        <p>Consultez le guide d'utilisation de votre espace RH.</p>
        <button id="helpBtn">Ouvrir le guide</button>
      </div>
      <div class="profile-mini">
        <div class="avatar coral">SM</div>
        <div><strong id="currentUserName">Sophie Martin</strong><span id="currentRoleLabel">Administratrice RH</span></div>
        <button id="logoutBtn" title="Se déconnecter">↪</button>
      </div>
      <label class="role-switch">MODE DÉMO<select id="roleSelector"><option value="hr">RH / Administrateur</option><option value="employee">Employé</option></select></label>
    </aside>

    <main class="main">
      <header class="topbar">
        <button class="mobile-menu" id="menuBtn">☰</button>
        <div class="today"><span id="todayLabel"></span><strong id="liveClock"></strong></div>
        <div class="top-actions">
          <button class="icon-btn" id="notifBtn">♢<i></i></button>
          <div class="company"><span class="company-logo">FR</span><div><small>SOCIÉTÉ</small><strong>Fire Romandie SA</strong></div><span>⌄</span></div>
        </div>
      </header>

      <section class="view active" id="dashboard">
        <div class="hero-row">
          <div><p class="eyebrow">ESPACE COLLABORATEUR</p><h1>Bonjour Sophie <span>👋</span></h1><p class="subtitle">Voici l'essentiel de votre journée et de votre équipe.</p></div>
          <button class="primary-btn" data-open-leave>＋ Nouvelle demande</button>
        </div>

        <div class="dashboard-grid">
          <article class="card clock-card">
            <div class="card-head"><div><span class="pill green">TEMPS DE TRAVAIL</span><h2>Votre journée</h2></div><span class="status-dot">● En cours</span></div>
            <div class="clock-display"><strong id="workedTime">03:42</strong><span>/ 08:12 attendues</span></div>
            <div class="active-site" id="activeSiteLabel"><span>CHANTIER ACTUEL</span><strong>Résidence du Lac</strong></div>
            <div class="progress"><i id="dayProgress"></i></div>
            <div class="clock-meta"><span>Arrivée <b id="arrivalTime">08:02</b></span><span>Pause <b id="breakTime">00:31</b></span><span>Départ estimé <b id="estimatedEnd">16:45</b></span></div>
            <button class="clock-button active" id="clockButton"><span class="stop-icon"></span><b>Terminer la journée</b><small id="clockButtonHint">Timbrage en cours depuis 08:02</small></button>
          </article>

          <article class="card balances-card">
            <div class="card-head"><div><span class="pill sand">MES SOLDES</span><h2>Congés & compteurs</h2></div><button class="link-btn" data-view-link="leave">Voir le détail →</button></div>
            <div class="balance-list">
              <div class="balance-item"><div class="balance-icon sun">☀</div><div><span>Vacances 2026</span><strong>18.5 <small>jours disponibles</small></strong><div class="tiny-progress"><i style="width:62%"></i></div><small>11.5 jours pris sur 30</small></div></div>
              <div class="balance-item"><div class="balance-icon mint">◷</div><div><span>Heures supplémentaires</span><strong>+12h 24 <small>de solde</small></strong><div class="tiny-progress"><i style="width:74%"></i></div><small>Mis à jour aujourd'hui</small></div></div>
              <div class="balance-item"><div class="balance-icon blue">✦</div><div><span>Récupération</span><strong>2.0 <small>jours disponibles</small></strong><div class="tiny-progress"><i style="width:40%"></i></div><small>À utiliser avant le 31.12</small></div></div>
            </div>
          </article>

          <article class="card team-card wide">
            <div class="card-head"><div><span class="pill lilac">AUJOURD'HUI</span><h2>Présence de l'équipe</h2></div><button class="link-btn" data-view-link="planning">Planning complet →</button></div>
            <div class="team-summary"><span><b>8</b> présents</span><span><b>2</b> absents</span><span><b>1</b> à distance</span></div>
            <div class="people-strip" id="todayPeople"></div>
          </article>

          <article class="card requests-card">
            <div class="card-head"><div><span class="pill sky">MES DEMANDES</span><h2>Dernières demandes</h2></div></div>
            <div id="myRequests"></div>
            <button class="secondary-btn full" data-open-leave>Faire une demande d'absence</button>
          </article>
