/**
 * ResQGrid AI - SITREP & Export Helpers
 */
window.exportSITREP = function () {
  const date = new Date().toISOString().split('T')[0];
  const sitrepData = [
    ["ResQGrid AI - Situation Report (SITREP)", date],
    ["Operational District", "Begusarai, Bihar"],
    ["Active Emergencies", "12"],
    ["Critical Zones", "3"],
    ["People at Risk", "1,248"],
    ["Total Rescue Resources", "47"],
    [],
    ["Priority", "Zone", "Emergency", "People", "Risk Score", "Status"],
    ["P1", "Zone A", "Flood Inundation", "82", "91", "Dispatched"],
    ["P2", "Zone B", "Industrial Fire", "41", "78", "Monitor"],
    ["P3", "Zone C", "Multi-Vehicle Pileup", "18", "52", "Assigned"],
    ["P4", "Sector 9", "Power Substation Trip", "120", "44", "Assigned"],
    ["P5", "Ward 12", "Clinic Power Failure", "14", "86", "Dispatched"]
  ];

  const csvContent = "data:text/csv;charset=utf-8," 
    + sitrepData.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `ResQGrid_SITREP_${date}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
