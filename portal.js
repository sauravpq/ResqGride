/**
 * ResQGrid AI - Emergency Intelligence & Resource Optimization Engine
 * Modern Light-Theme GIS & Tactical Command Center Controller
 */

(() => {
  'use strict';

  // --- Core State & Seed Data ---
  const state = {
    district: 'Begusarai District, Bihar',
    officer: {
      name: 'Alex Kumar',
      role: 'District Response Director',
      badge: 'RQ-DIR-48291',
      status: 'ON-DUTY'
    },
    metrics: {
      activeEmergencies: 12,
      criticalZones: 3,
      peopleAtRisk: 1248,
      rescueResources: 47,
      resourcesDeployed: 34,
      resourcesAvailable: 13
    },
    aiAnalysis: {
      riskScore: 91,
      status: 'CRITICAL',
      recommendedZone: 'ZONE A — FLOOD EMERGENCY',
      locationDetail: 'Begusarai Sadar • Ward 4 Inundation Basin',
      reasoning: [
        { icon: '🌊', label: 'Water Level Surge', desc: '+2.4m above danger threshold (Burhi Gandak overflow)' },
        { icon: '👥', label: 'High Population Density', desc: '1,420 residents within 500m perimeter' },
        { icon: '📞', label: '47 Emergency Reports', desc: '14 trapped elderly, 9 urgent medical distress calls' },
        { icon: '🚧', label: '3 Blocked Arterials', desc: 'NH-31 Underpass, Station Road, Bund Access flooded' },
        { icon: '🏥', label: 'Limited Hospital Headroom', desc: 'Sadar ICU at 92% occupancy (18 beds reserved)' }
      ]
    },
    resources: [
      { id: 'amb', name: 'Ambulances', icon: '🚑', available: 6, deployed: 15, required: 20, unit: 'Fleet Units' },
      { id: 'res', name: 'Rescue Teams', icon: '🚒', available: 5, deployed: 12, required: 14, unit: 'Battalions' },
      { id: 'boat', name: 'Rescue Boats', icon: '🚤', available: 4, deployed: 6, required: 10, unit: 'Motorized Crafts' },
      { id: 'bed', name: 'Hospital Beds', icon: '🏥', available: 42, deployed: 78, required: 100, unit: 'Emergency Beds' },
      { id: 'shel', name: 'Emergency Shelters', icon: '🏠', available: 3, deployed: 5, required: 6, unit: 'Active Centers' }
    ],
    incidents: [
      {
        id: 'P1',
        zone: 'Zone A',
        emergency: 'Flood Inundation',
        category: 'flood',
        people: 82,
        risk: 91,
        status: 'Dispatch',
        lat: 25.4320,
        lng: 86.1480,
        subtext: 'Bakhri Ward 4 • Rising Water',
        units: '3 Boats, 4 Ambulances'
      },
      {
        id: 'P2',
        zone: 'Zone B',
        emergency: 'Industrial Fire',
        category: 'fire',
        people: 41,
        risk: 78,
        status: 'Monitor',
        lat: 25.4410,
        lng: 86.0950,
        subtext: 'Barauni Industrial Sector 2',
        units: '2 Fire Units, 1 Hazmat'
      },
      {
        id: 'P3',
        zone: 'Zone C',
        emergency: 'Multi-Vehicle Pileup',
        category: 'accident',
        people: 18,
        risk: 52,
        status: 'Assigned',
        lat: 25.4245,
        lng: 86.1420,
        subtext: 'NH-31 Har Har Mahadev Chowk',
        units: '2 Ambulances, 1 Tow Rig'
      },
      {
        id: 'P4',
        zone: 'Sector 9',
        emergency: 'Power Substation Trip',
        category: 'utility',
        people: 120,
        risk: 44,
        status: 'Assigned',
        lat: 25.4190,
        lng: 86.1265,
        subtext: 'Station Road Grid • Backup Active',
        units: '1 Quick Response Team'
      },
      {
        id: 'P5',
        zone: 'Ward 12',
        emergency: 'Clinic Power Failure',
        category: 'medical',
        people: 14,
        risk: 86,
        status: 'Dispatch',
        lat: 25.4198,
        lng: 86.1345,
        subtext: 'Sadar Hospital Ward 12 Clinic',
        units: '1 Generator Squad, 2 BLS'
      }
    ],
    mapObjects: {
      map: null,
      layers: {
        criticalZones: [],
        highRiskZones: [],
        safeZones: [],
        units: [],
        routes: []
      }
    }
  };

  // Helper selectors
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  // --- Clock & System Telemetry ---
  function initClock() {
    const clockEl = $('#liveClock');
    function updateTime() {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' IST';
      }
    }
    updateTime();
    setInterval(updateTime, 1000);
  }

  // --- Toast Notification Engine ---
  function showToast(title, message, type = 'info') {
    let container = $('#toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'danger') icon = '🚨';
    if (type === 'success') icon = '✅';

    toast.innerHTML = `
      <div style="font-size: 20px;">${icon}</div>
      <div class="toast-content">
        <h6>${title}</h6>
        <p>${message}</p>
      </div>
      <button style="margin-left: auto; border: none; background: transparent; cursor: pointer; color: #94a3b8;" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // --- Notifications Dropdown Toggle ---
  function initNotifications() {
    const bellBtn = $('#notificationBtn');
    const dropdown = $('#notificationsDropdown');
    if (!bellBtn || !dropdown) return;

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== bellBtn) {
        dropdown.classList.remove('active');
      }
    });
  }

  // --- Leaflet Map GIS Engine (Real Geographic OpenStreetMap Implementation) ---
  function initMap() {
    const mapContainer = $('#districtMap');
    if (!mapContainer || !window.L) return;

    // Check & cleanly destroy any existing map instance to prevent "Map container is already initialized"
    if (state.mapObjects.map) {
      try {
        state.mapObjects.map.remove();
      } catch (e) {
        console.warn('Map cleanup notice:', e);
      }
      state.mapObjects.map = null;
    }
    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
    }

    // Default geographic center: Begusarai, Bihar, India
    const defaultCenter = [25.4182, 86.1309];
    const defaultZoom = 13;

    // Real Geographic Interactive Leaflet Map
    const map = L.map('districtMap', {
      center: defaultCenter,
      zoom: defaultZoom,
      minZoom: 6,
      maxZoom: 19,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true
    });

    state.mapObjects.map = map;

    // 1. Base Map Tile Layers (Real Geographic Maps with roads, buildings, rivers)
    const baseMaps = {
      osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri, Earthstar Geographics'
      })
    };

    // OpenStreetMap as Default Base Map
    let currentBase = baseMaps.osm;
    currentBase.addTo(map);

    // 2. Interactive Layer Groups
    const layerGroups = {
      zones: L.layerGroup().addTo(map),
      markers: L.layerGroup().addTo(map),
      resources: L.layerGroup().addTo(map),
      routes: L.layerGroup().addTo(map)
    };

    state.mapObjects.layerGroups = layerGroups;

    // Helper: Build Clean Tactical Leaflet Popup
    function makePopup(opts) {
      return `
        <div class="popup-card">
          <div class="popup-header">
            <div>
              <div class="popup-title">${opts.icon} ${opts.name}</div>
              <div class="popup-type">${opts.type}</div>
            </div>
            <span class="popup-badge ${opts.badgeClass}">${opts.badgeText}</span>
          </div>
          <div class="popup-coords-row">
            <span>GPS Location</span>
            <span class="popup-coords-val">${opts.lat.toFixed(4)}° N, ${opts.lng.toFixed(4)}° E</span>
          </div>
          <div class="popup-action-box ${opts.boxClass || ''}">
            <strong>Recommended Action:</strong> ${opts.action}
          </div>
          ${opts.btnText ? `<button class="popup-action-btn ${opts.btnClass || 'dispatch'}" onclick="${opts.btnOnClick}">${opts.btnText}</button>` : ''}
        </div>
      `;
    }

    // Helper: Add Custom Styled DivIcon Marker
    function addTacticalMarker(opts) {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-parent',
        html: `<div class="custom-leaflet-marker ${opts.markerClass}">${opts.icon}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });
      const marker = L.marker([opts.lat, opts.lng], { icon: customIcon });
      marker.bindPopup(makePopup(opts));
      opts.group.addLayer(marker);
      return marker;
    }

    // --- 12. Real Interactive Marker Categories in Begusarai ---
    // Category 1: Critical Emergency (P1)
    addTacticalMarker({
      lat: 25.4320,
      lng: 86.1480,
      icon: '🌊',
      markerClass: 'marker-critical',
      name: 'Bakhri Ward 4 River Breach',
      type: 'Flash Flood • Water Level +2.4m Surge',
      badgeText: 'CRITICAL (P1)',
      badgeClass: 'critical',
      boxClass: 'critical',
      action: 'Immediate evacuation of 82 trapped citizens; avoid submerged underpasses.',
      btnText: '🚨 Dispatch Rescue Fleet',
      btnClass: 'dispatch',
      btnOnClick: "window.dispatchEmergency('P1')",
      group: layerGroups.markers
    });

    // Category 2: High Risk (P2)
    addTacticalMarker({
      lat: 25.4410,
      lng: 86.0950,
      icon: '🔥',
      markerClass: 'marker-high',
      name: 'Barauni Industrial Sector 2',
      type: 'Chemical Storage & Fire Alert',
      badgeText: 'HIGH RISK (P2)',
      badgeClass: 'high',
      action: 'Maintain 500m safety cordon; deploy hazmat foam tenders and atmospheric gas monitors.',
      btnText: '⚠️ Mobilize Fire Units',
      btnClass: 'dispatch',
      btnOnClick: "window.dispatchEmergency('P2')",
      group: layerGroups.markers
    });

    // Category 3: Medium Risk (P3)
    addTacticalMarker({
      lat: 25.4245,
      lng: 86.1420,
      icon: '🚗',
      markerClass: 'marker-medium',
      name: 'NH-31 Har Har Mahadev Chowk',
      type: 'Multi-Vehicle Pileup & Traffic Gridlock',
      badgeText: 'MEDIUM RISK',
      badgeClass: 'medium',
      action: 'Divert emergency transit vehicles to Sector 4 elevated bypass; activate traffic police escort.',
      btnText: '🚜 Assign Highway Units',
      btnClass: 'navigate',
      btnOnClick: "window.dispatchEmergency('P3')",
      group: layerGroups.markers
    });

    // Category 4: Safe Zone
    addTacticalMarker({
      lat: 25.4140,
      lng: 86.1190,
      icon: '🛡️',
      markerClass: 'marker-safe',
      name: 'BS College Assembly Ground',
      type: 'Designated Safe Evacuation Ground',
      badgeText: 'SAFE REFUGE',
      badgeClass: 'safe',
      boxClass: 'safe',
      action: 'Verified elevated campus grounds equipped with clean drinking water and triage post.',
      btnText: '📍 Set as Evacuation Target',
      btnClass: 'navigate',
      btnOnClick: "showToast('Evacuation Target Set', 'All dispatched teams notified of BS College safe ground.', 'success')",
      group: layerGroups.markers
    });

    // Category 5: Rescue Team
    addTacticalMarker({
      lat: 25.4290,
      lng: 86.1410,
      icon: '🚒',
      markerClass: 'marker-rescueteam',
      name: 'NDRF 9th Battalion (Team Bravo)',
      type: 'Flood & Disaster Response Unit',
      badgeText: 'RESCUE TEAM',
      badgeClass: 'resource',
      action: '32 personnel on standby equipped with 4 motorized inflatable boats and satellite comms.',
      btnText: '📞 Transmit Radio Command',
      btnClass: 'dispatch',
      btnOnClick: "showToast('NDRF Contacted', 'Radio channel 14 secured with Team Bravo Leader.', 'info')",
      group: layerGroups.resources
    });

    // Category 6: Ambulance
    addTacticalMarker({
      lat: 25.4210,
      lng: 86.1330,
      icon: '🚑',
      markerClass: 'marker-ambulance',
      name: 'ALS Mobile Ambulance Unit 04',
      type: 'Advanced Life Support Mobile Unit',
      badgeText: 'AMBULANCE',
      badgeClass: 'resource',
      action: 'Equipped with portable ventilators, cardiac monitors, and trauma stabilization kits.',
      btnText: '⚡ Expedite Green Corridor',
      btnClass: 'navigate',
      btnOnClick: "showToast('Green Corridor Priority', 'Traffic signals overridden on Main Road for Unit 04.', 'success')",
      group: layerGroups.resources
    });

    // Category 7: Hospital
    addTacticalMarker({
      lat: 25.4198,
      lng: 86.1345,
      icon: '🏥',
      markerClass: 'marker-hospital',
      name: 'Begusarai Sadar District Hospital',
      type: 'Government Primary Emergency Hospital',
      badgeText: 'HOSPITAL',
      badgeClass: 'resource',
      boxClass: 'safe',
      action: '18 ICU beds and 4 trauma operating suites reserved for Zone A casualty intake.',
      btnText: '🏥 Hospital Casualty Intake',
      btnClass: 'navigate',
      btnOnClick: "showToast('Sadar Hospital Alerted', 'Trauma ward informed of incoming patient convoy.', 'info')",
      group: layerGroups.resources
    });

    // Category 8: Shelter
    addTacticalMarker({
      lat: 25.4215,
      lng: 86.1380,
      icon: '🏠',
      markerClass: 'marker-shelter',
      name: 'Jubilee Relief Shelter (Town Hall)',
      type: 'District Public Emergency Shelter',
      badgeText: 'SHELTER',
      badgeClass: 'resource',
      action: 'Capacity 600 beds (420 occupied). Community kitchen, clean water, and dry rations verified.',
      btnText: '📦 Verify Supply Stock',
      btnClass: 'navigate',
      btnOnClick: "showToast('Shelter Stock Verified', 'Clean water and rations confirmed for next 48 hours.', 'success')",
      group: layerGroups.resources
    });

    // --- Emergency Zones (Realistic Radius Cordon Perimeters) ---
    // Zone A (Critical Flood)
    const zoneACircle = L.circle([25.4320, 86.1480], {
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.16,
      weight: 2,
      dashArray: '6, 6',
      radius: 1100
    }).bindTooltip('<b>Zone A: Flood Inundation Cordon</b><br>1,100m Perimeter • Water Level +2.4m Surge', { sticky: true });
    layerGroups.zones.addLayer(zoneACircle);

    // Zone B (Industrial High Risk)
    const zoneBCircle = L.circle([25.4410, 86.0950], {
      color: '#f97316',
      fillColor: '#f97316',
      fillOpacity: 0.14,
      weight: 2,
      radius: 850
    }).bindTooltip('<b>Zone B: Industrial Safety Cordon</b><br>850m Perimeter • Hazmat Alert', { sticky: true });
    layerGroups.zones.addLayer(zoneBCircle);

    // Zone C (Highway Medium Risk)
    const zoneCCircle = L.circle([25.4245, 86.1420], {
      color: '#eab308',
      fillColor: '#eab308',
      fillOpacity: 0.12,
      weight: 1.5,
      radius: 650
    }).bindTooltip('<b>Zone C: Traffic Congestion Cordon</b><br>650m Perimeter • NH-31 Junction', { sticky: true });
    layerGroups.zones.addLayer(zoneCCircle);

    // Safe Evacuation Perimeter (BS College)
    const safeZoneCircle = L.circle([25.4140, 86.1190], {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.15,
      weight: 1.5,
      radius: 550
    }).bindTooltip('<b>BS College Safe Evacuation Perimeter</b><br>Verified Elevated Land Area', { sticky: true });
    layerGroups.zones.addLayer(safeZoneCircle);

    // --- 15. AI Recommended Safe Route — Demo Layer ---
    const demoRouteCoords = [
      [25.4215, 86.1380], // Jubilee Town Hall Depot
      [25.4230, 86.1395], // Main Road East
      [25.4245, 86.1420], // Har Har Mahadev Chowk (NH-31)
      [25.4285, 86.1450], // NH-31 Elevated Bypass
      [25.4320, 86.1480]  // Zone A Flood Front
    ];

    const demoRouteLine = L.polyline(demoRouteCoords, {
      color: '#06b6d4',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      dashArray: '8, 8'
    });

    demoRouteLine.bindPopup(`
      <div class="popup-card">
        <div class="popup-header">
          <div>
            <div class="popup-title">🛣️ AI Recommended Route — Demo</div>
            <div class="popup-type">Elevation-Optimized Emergency Corridor</div>
          </div>
          <span class="popup-badge resource">DEMO SIMULATION</span>
        </div>
        <p style="font-size: 11px; color: #334155; margin: 4px 0; line-height: 1.4;">
          <b>Path:</b> Town Hall Depot &rarr; Main Road &rarr; NH-31 Chowk &rarr; Zone A Inundation Core.<br>
          <b>Estimated Transit:</b> ~8 minutes (clears flooded underpasses).
        </p>
        <div class="popup-action-box">
          <strong>Notice:</strong> This route is an AI demo simulation calculated from topographical elevation contours to avoid low-lying waterlogged roads. It is not an active GPS turn-by-turn navigation feed.
        </div>
      </div>
    `);

    demoRouteLine.bindTooltip('<b>AI Recommended Route — Demo</b><br>ETA: 8 min (Elevation-cleared bypass)', { sticky: true });
    layerGroups.routes.addLayer(demoRouteLine);

    // --- Base Map Selector Interactivity (Requirement 17) ---
    $$('.basemap-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        $$('.basemap-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const mapType = pill.dataset.basemap;

        map.removeLayer(currentBase);
        if (mapType === 'satellite') {
          currentBase = baseMaps.satellite;
          showToast('Base Map: Satellite Imagery', 'Activated high-resolution satellite imagery.', 'info');
        } else {
          currentBase = baseMaps.osm;
          showToast('Base Map: OpenStreetMap', 'Activated standard geographic OpenStreetMap roads, buildings & terrain.', 'info');
        }
        currentBase.addTo(map);
        currentBase.bringToBack();
      });
    });

    // --- Layer Control Toggles (Requirement 16) ---
    $$('.layer-toggle-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active');
        const layerKey = pill.dataset.layer;
        const targetGroup = layerGroups[layerKey];
        if (!targetGroup) return;

        if (map.hasLayer(targetGroup)) {
          map.removeLayer(targetGroup);
          showToast('Layer Hidden', pill.textContent.trim(), 'info');
        } else {
          map.addLayer(targetGroup);
          showToast('Layer Visible', pill.textContent.trim(), 'success');
        }
      });
    });

    // --- Locate District / Reset to Begusarai (Requirement 7) ---
    const btnReset = $('#btnLocateDistrict');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        map.flyTo(defaultCenter, defaultZoom, { duration: 1.2 });
        const sel = $('#indianDistrictSelect');
        if (sel) sel.value = 'begusarai';
        showToast('District Re-centered', 'Map centered on Begusarai Command Center, Bihar.', 'info');
      });
    }

    // --- Dynamic District Selector (Requirements 8, 9) ---
    const districtSelect = $('#indianDistrictSelect');
    if (districtSelect) {
      const districts = {
        begusarai: { name: 'Begusarai, Bihar (Command Center)', coords: [25.4182, 86.1309], zoom: 13 },
        patna: { name: 'Patna, Bihar (State Command HQ)', coords: [25.5941, 85.1376], zoom: 13 },
        wayanad: { name: 'Wayanad, Kerala (Highland Landslide Grid)', coords: [11.6854, 76.1320], zoom: 12 },
        puri: { name: 'Puri, Odisha (Coastal Cyclone Grid)', coords: [19.8135, 85.8312], zoom: 13 },
        chamoli: { name: 'Chamoli, Uttarakhand (Himalayan Grid)', coords: [30.4000, 79.3300], zoom: 11 },
        mumbai: { name: 'Mumbai, Maharashtra (Coastal Surge Grid)', coords: [19.0760, 72.8777], zoom: 12 }
      };

      districtSelect.addEventListener('change', (e) => {
        const dest = districts[e.target.value];
        if (!dest) return;
        map.flyTo(dest.coords, dest.zoom, { duration: 1.6 });
        showToast(`District Teleport: ${dest.name}`, `Centered geographic view on ${dest.name}.`, 'info');
      });
    }

    // Multi-interval size invalidations to ensure smooth rendering across browser renders
    setTimeout(() => map.invalidateSize(), 50);
    setTimeout(() => map.invalidateSize(), 250);
    setTimeout(() => map.invalidateSize(), 750);
    window.addEventListener('resize', () => map.invalidateSize());
  }

  // --- Fly to Incident on Map ---
  window.flyToIncident = function (id) {
    const incident = state.incidents.find(i => i.id === id);
    if (!incident || !state.mapObjects.map) return;
    
    // Smoothly pan & zoom
    state.mapObjects.map.flyTo([incident.lat, incident.lng], 15, {
      duration: 1.2
    });

    // Scroll to map if needed
    const mapSection = $('#emergencyMapSection');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showToast(`Tracking ${incident.zone}`, `Focused view on ${incident.emergency}. Risk Score: ${incident.risk}`, 'info');
  };

  // --- Dispatch Emergency Action ---
  window.dispatchEmergency = function (id) {
    const incident = state.incidents.find(i => i.id === id);
    if (!incident) return;

    if (incident.status === 'Dispatched') {
      showToast('Units Already Mobilized', `${incident.zone} is currently receiving priority response assets.`, 'info');
      return;
    }

    incident.status = 'Dispatched';
    state.metrics.resourcesDeployed += 3;
    state.metrics.resourcesAvailable = Math.max(0, state.metrics.resourcesAvailable - 3);

    // Update UI table
    renderIncidentTable();
    renderResourceAllocation();
    updateHeaderMetrics();

    showToast(
      `🚨 Response Dispatched to ${incident.zone}`,
      `Mobilized ${incident.units} via AI Recommended Sector 4 Route. ETA: 8 minutes.`,
      'danger'
    );
  };

  // --- Render Incident Table ---
  function renderIncidentTable() {
    const tbody = $('#incidentTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.incidents.map(inc => {
      let priorityClass = 'p3-badge';
      if (inc.id === 'P1') priorityClass = 'p1-badge';
      if (inc.id === 'P2') priorityClass = 'p2-badge';

      let statusBadgeClass = 'badge-monitor';
      let btnLabel = 'Monitor';
      let btnClass = 'btn-table-monitor';

      if (inc.status === 'Dispatch') {
        statusBadgeClass = 'badge-dispatch';
        btnLabel = 'Dispatch';
        btnClass = 'btn-table-dispatch';
      } else if (inc.status === 'Dispatched') {
        statusBadgeClass = 'badge-assigned';
        btnLabel = 'Dispatched ✓';
        btnClass = 'btn-table-monitor';
      } else if (inc.status === 'Assigned') {
        statusBadgeClass = 'badge-assigned';
        btnLabel = 'Assigned';
        btnClass = 'btn-table-monitor';
      }

      const riskColor = inc.risk >= 85 ? '#ef4444' : inc.risk >= 70 ? '#f97316' : '#eab308';

      return `
        <tr onclick="window.flyToIncident('${inc.id}')" title="Click to view ${inc.zone} on Live Map">
          <td><span class="badge-priority ${priorityClass}">${inc.id}</span></td>
          <td>
            <strong>${inc.zone}</strong>
            <div style="font-size: 10px; color: #64748b;">${inc.subtext}</div>
          </td>
          <td>
            <strong>${inc.emergency}</strong>
            <div style="font-size: 10px; color: #0284c7;">Req: ${inc.units}</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 5px;">
              <span>👤</span>
              <strong style="font-size: 13px;">${inc.people}</strong>
            </div>
          </td>
          <td>
            <div class="table-risk-meter">
              <span class="risk-val" style="color: ${riskColor};">${inc.risk}</span>
              <div class="risk-bar-track">
                <div class="risk-bar-fill" style="width: ${inc.risk}%; background-color: ${riskColor};"></div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge-status ${statusBadgeClass}">${inc.status}</span>
          </td>
          <td onclick="event.stopPropagation();">
            <button class="btn-table-action ${btnClass}" onclick="window.dispatchEmergency('${inc.id}')">
              ${btnLabel}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- Render Resource Allocation Cards ---
  function renderResourceAllocation() {
    const container = $('#resourceAllocationList');
    if (!container) return;

    container.innerHTML = state.resources.map(res => {
      const percent = Math.min(100, Math.round((res.deployed / res.required) * 100));
      return `
        <div class="resource-item-row">
          <div class="resource-header">
            <div class="resource-title">
              <span class="resource-title-icon">${res.icon}</span>
              <div>
                <strong>${res.name}</strong>
                <div style="font-size: 10px; color: #64748b;">${res.unit}</div>
              </div>
            </div>
            <div class="resource-metrics-breakdown">
              <span class="metric-tag available">Available: <span class="val">${res.available}</span></span>
              <span class="metric-tag deployed">Deployed: <span class="val">${res.deployed}</span></span>
              <span class="metric-tag required">Required: <span class="val">${res.required}</span></span>
            </div>
          </div>
          <div class="resource-progress-rail">
            <div class="resource-fill-bar" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Header Metrics Sync ---
  function updateHeaderMetrics() {
    const elActive = $('[data-stat="activeEmergencies"]');
    const elCritical = $('[data-stat="criticalZones"]');
    const elPeople = $('[data-stat="peopleAtRisk"]');
    const elResources = $('[data-stat="rescueResources"]');

    if (elActive) elActive.textContent = state.metrics.activeEmergencies;
    if (elCritical) elCritical.textContent = state.metrics.criticalZones;
    if (elPeople) elPeople.textContent = state.metrics.peopleAtRisk.toLocaleString();
    if (elResources) elResources.textContent = state.metrics.rescueResources;
  }

  // --- Interactive AI Analysis Trigger ---
  function initAIAnalysis() {
    const runBtn = $('#runAiAnalysisBtn');
    const heroBtn = $('#heroRunAiBtn');

    function triggerAnalysis() {
      const btn = runBtn || heroBtn;
      if (!btn) return;

      btn.classList.add('running');
      btn.innerHTML = `<span>⏳</span> Ingesting Satellite Telemetry...`;

      showToast('🤖 Neural Triage Active', 'Ingesting real-time Doppler radar and flood contour elevation maps...', 'info');

      setTimeout(() => {
        btn.innerHTML = `<span>⚡</span> Calculating Optimal Routes...`;
      }, 1000);

      setTimeout(() => {
        btn.classList.remove('running');
        btn.innerHTML = `<span>✨</span> Run AI Analysis`;

        // Update score slightly to indicate real-time computation
        const scoreEl = $('#aiRiskScoreVal');
        if (scoreEl) {
          scoreEl.textContent = '93';
          scoreEl.style.color = '#dc2626';
        }

        const updateTimeEl = $('#aiLastUpdated');
        if (updateTimeEl) {
          updateTimeEl.textContent = 'Just now (Recalculated with Live River Level +2.45m)';
        }

        showToast(
          'AI Optimization Complete',
          'Updated Zone A risk score to 93/100. Confirmed Sector 4 Bypass route saves 16 minutes.',
          'success'
        );
      }, 2200);
    }

    if (runBtn) runBtn.addEventListener('click', triggerAnalysis);
    if (heroBtn) heroBtn.addEventListener('click', triggerAnalysis);
  }

  // --- Modals Setup ---
  function initModals() {
    const emergencyBtn = $('#headerEmergencyBtn');
    const modal = $('#emergencyModal');
    const closeBtn = $('#closeEmergencyModal');
    const cancelBtn = $('#cancelEmergencyModal');
    const form = $('#emergencyForm');

    function openModal() {
      if (modal) modal.classList.add('active');
    }

    function closeModal() {
      if (modal) modal.classList.remove('active');
    }

    if (emergencyBtn) emergencyBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = $('#emergencyTypeSelect')?.value || 'General Incident';
        const zone = $('#emergencyZoneInput')?.value || 'Sector 7';
        const people = parseInt($('#emergencyVictimsInput')?.value || '25', 10);

        // Add to incidents list
        const newInc = {
          id: `P${state.incidents.length + 1}`,
          zone: zone,
          emergency: type,
          category: 'alert',
          people: people,
          risk: 88,
          status: 'Dispatch',
          lat: 25.422 + (Math.random() - 0.5) * 0.02,
          lng: 86.155 + (Math.random() - 0.5) * 0.02,
          subtext: 'Incoming Field Distress Report',
          units: '2 Units Requested'
        };

        state.incidents.unshift(newInc);
        state.metrics.activeEmergencies += 1;
        state.metrics.peopleAtRisk += people;

        closeModal();
        renderIncidentTable();
        updateHeaderMetrics();

        // Add marker to map if available
        if (state.mapObjects.map && window.L) {
          const m = L.marker([newInc.lat, newInc.lng]).addTo(state.mapObjects.map);
          m.bindPopup(`<b>${newInc.zone}: ${newInc.emergency}</b><br>${newInc.people} Citizens in danger`);
          state.mapObjects.map.flyTo([newInc.lat, newInc.lng], 14);
        }

        showToast(
          '🚨 EMERGENCY PROTOCOL ACTIVATED',
          `New high-priority SOS logged in ${zone}. AI route corridor opened.`,
          'danger'
        );
      });
    }
  }

  // --- Smooth Scroll Buttons ---
  function initSmoothScroll() {
    const viewMapBtn = $('#viewEmergencyMapBtn');
    if (viewMapBtn) {
      viewMapBtn.addEventListener('click', () => {
        const target = $('#emergencyMapSection');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // --- Initialization ---
  function init() {
    initClock();
    initNotifications();
    renderIncidentTable();
    renderResourceAllocation();
    updateHeaderMetrics();
    initMap();
    initAIAnalysis();
    initModals();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
