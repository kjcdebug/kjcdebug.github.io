/*
 * IMC Site Visit - page-side builder (v1.0.0, 2026-10-14)
 *
 * WHY: ChatGPT can't always run Python (the daily-log pilot showed it failing for some people
 * and maybe in voice mode), so the checks and link building in build_link.py also live here,
 * on the Site Visit page. ChatGPT only has to write the visit as plain JSON; the super copies
 * it, pastes it on the page, and this file turns it into the pre-filled Jotform link.
 *
 * It mirrors build_link.py rule for rule, with three extra kindnesses for pasted text:
 * names and list values match without caring about capital letters, a bare job number like
 * "A24019" finds its full job name, and "yes"/"no" in any case are accepted.
 *
 * Facts checked on the live form 70724957756167 (2026-10-14, prefill tested, nothing submitted):
 *  - Time In / Time Out are hour 1-12, minutes 00/10/20/30/40/50 only, AM/PM
 *  - "Foreman/Lead to copy" is a multi-select (comma-separated) and leaves out Kyle Jolly
 *  - Weather, Temperature Range and Areas of Concern are checkboxes (comma-separated)
 *  - Type of Report is always "Job Site Visit" (the other two types are effectively unused)
 */
(function (root) {
  "use strict";

  var JOTFORM = "https://form.jotform.com/70724957756167?";

  // ---- Exact dropdown and checkbox values (copied from the live form) ----
  var SUPERS = ["Brad Flanigan","Brent Smartt","Carl Nielsen","Justin Hudson","Randall Quinn","Lee Daugherty","Zach Handy"];
  var PMS = ["Brad Self","Brent Smartt","Cade Trusley","Elise Justice","Justin Hudson","Randy Webb","Terry Self",
    "Tracy Moretz","PM Not Listed"];
  var WEATHER = ["Sunny","Hot","Rainy","Cloudy","Cold","Snowy"];
  var AREAS = ["Employees","Equipment","Information","Materials","Schedule","Safety","Production","Testing","Other"];
  var COPY_FOREMEN = ["Aaron Alley","Aaron Ayling","Andrew Marchand","Billy Wolfenbarger","Brad Flanigan","Brady Hickman",
    "Brent Smartt","Carl Nielsen","Chris Davis","Chris Simpson","Daniel Nelson","Derek Smartt","Donnie Armstrong",
    "Eric Parker","Erik Armstrong","Jack Toomire","John Miller","Jon Fierro","Josh Dozier","Justin Hudson","Kevin Quinn",
    "Kieran McAtamney","Marty Booker","Mike McAtamney","Mike Williams","Nick Curton","Noah Norton",
    "Parker Sheddan","Patrick Buckner","Phil Brown","Paul Kuykendall","Randall Quinn","Rhon Hawkins","Ricky Bettis",
    "Ross Kibodeaux","Ryan Yowell","Sam Fritts","Shawn Robinson","Simon Hyde","Tim Smith","Todd Lee","Tom Sears",
    "Travis Bell","Troy Whitehall","Whitney Poore","Zach Handy"];   // no Kyle Jolly on this list
  var JOBS = ["IMU", "Office", "Pipe Fab Shop", "Sheet Metal Shop", "Warehouse", "A23003. Oak Ridge WWTP", "A23005. Neyland Stadium", "A23027. Neyland BP#4", "A23029. Neyland BP#6", "A23046. Neyland BP#7AD", "A23048. Neyland BP#7A", "A24004. Beauford Delaney Building", "A24009. Siemens", "A24014. Lindsey Nelson Renovation", "A24016. Neyland BP#7", "A24019. Flatrock Motorclub", "A24020.A DIDD Building A", "A24020.B DIDD Building B", "A24020.C DIDD Building C", "A24020.D DIDD Building D", "A25005. Neyland BP8", "A25008. LIS Laser Labratory Ventilation System", "A25009. Knoxville Forensic Center", "A25013. TCAT Knoxville Replacement Campus", "A25015.A TCAT Jacksboro Healthcare Building A", "A25015.B TCAT Jacksboro High Bay Building B", "A25019. HERMES", "A25020. AT&T Hartford", "A25021. Maryville High School New Additions", "A25024. Kuwahee WWTP Sodium Hypochlorite Conversion", "A25028. AT&T Chiller Replacement", "A25029. Sweetwater Hospital", "A25031. Sweetwater Boiler Replacement", "A26001. Greene County Track and Field", "A26002. Amaero Atomization Room 129 (PO-0796)", "A26004. UTK Student Union Plaza", "A26005. KOC-PT & Occupational Therapy", "A26006. UTK Presidential Court", "A26007. Eternal Water", "A26008. Knoxville Smiles", "A26009. Vision Knoxville Cooling Tower", "A26010. City of Knoxville Garage Ventilation", "A26011. LeConte Center Addition", "A26012. UTK Presidential Court Building", "A26014. Equipment Share Sewer Line", "A26015. Neyland BP9", "A26016. TCAT Knoxville Phase II", "A26018. Legacy Park", "A26019. Amaero Air and Argon Line (PO-1042)", "A26020. National Fitness Center Pool Deck Replacement", "A26021. KOC Building 6", "A26024. Amaero Fire Damage", "A26025. Knoxville P&DC Project", "A26026. Carbon Fiber", "A26027. Hardy Corp. BIM", "A26028. National Fitness Rework Sauna Duct", "A26029. Neyland Sound Upgrades", "A26030. Innovation South Pt. 2", "A26031. Kia Morristown", "A26032. UT Pratt Basketball Practice Facility", "A26033. Rocky Top North Phase 3", "A26034. Triso-X", "A26035. USPS PILS", "A26036. Hardy Corp. BIM 2", "A26037. HPER Building", "A26038. Amaero ICT Fan", "A26039. Pigeon Forge City Hall", "A26040. Crystal Building", "A26041. LIS Building Technologies 2", "B24126. FUD Clearwell", "B24168. RSCC Multi Building HVAC Correction 2", "B25112. KUB Miller Building", "B25118. Waldens Creek Intake", "B25127. Gatlinburg WWTP Bypas", "B25128. Walker Springs Pump", "B25129. Everett Rd. Tank and Boost", "B25130. Collegedale Improvements", "B25135. Frozen Head State Park", "B25136. Crossville Booster Station", "B25137. 1st Baptist Newport", "B25141. Blount County Health Dept.", "B25142. Dragon X Minigolf", "B25147. Hiawassee Effluent Reuse", "B25153. Maryville Preschool Reno", "B25156. Delaney Museam", "B25159. Creative Foam Fans", "B25160. CUD Intake and Fan", "B25163. Morristown Landing", "B25166. RSCC Boiler", "B26101. RSCC Boiler Drawings", "B26102. Benchmark Offices", "B26109. Bradley County Fire Station", "B26110. McClung Elevator Upgrades", "B26111. Oak Ridge Preservation", "B26112. KUB Control Room Upgrades", "B26113. Slick City", "B26119. Truss Vet Clinic", "B26123. Tamko ABCDE Jobs", "B26124. NGK Butterfly Addition", "B26125. Redline Athletics", "B26126. TCAT Polk County", "B26127. Tellico Village Bard Unit", "B26128. HUD PRV and BFP Upgrades", "B26131. Van Hicks Fire Line", "B26132. BAM 3", "B26133. Sweetwater Community Center", "B26134. Southern Constructors Water Heater", "B26135. Sweetwater Hospital Boiler Fans", "B26136. NGK Nitrogen Spool", "B26137. Corporate Square", "B26138. ORUD Building", "B26139. Vision Expansion Tank", "B26140. Truss Vet Water Leak Repair", "B26141. Holiday Inn Storage Tank", "B26142. ORSA HVAC", "B26143. Powell Dealer Warehouse", "B26144. Redline Duct Detectors", "B26145. New Market Pavilion", "B26146. Anderson County EMS", "OH6000. Overhead Indirect", "OH7000. Overhead", "S09728. 9728", "S22002. PSCC Boiler", "S23004. PVC Prototype Carts", "S23005. Horner Building Company Work", "S23007. Horner Drinking Fountain (Hampton Inn)", "S23008. Cross training IMC Employees", "S23009. Summit Medical Lab Sewer Repair", "S23012. New Hire Training", "S23014. ETNBH Welding Latch", "S23015. Horner Extra Work", "S23016. Innovate Louvers", "S23017. Innovate Printer Exhaust Fans Ph. 2", "S23018. Parkside Owner Taps", "S23019. Heritage Chiller Valves", "S23020. Air Compressor", "S23021. Heritage High Hydronic System Repair", "S23022. IMC Roofing", "S23023. IMC Concrete", "S23024. Dan Carlson Project", "S23025. Mountain Hope", "S23026. Averitt Express", "S23027. Amaero Gas for Temp Heaters", "S23028. Restroom Remodel Design Add", "S23029. Boiler Canopy Project Add", "S24001. TIS Mechanical Room", "S24002. Christian Brothers Auto Duct Fab", "S24003. RW Project", "S24004. BitDeer", "S24005. Foust Carney Sewage Clog", "S24006. IMS Work (John Miller)", "S25001. Parts Relocation", "S25002. Unit in Sevierville for BurWil", "S25003. PHCC Classroom Ductwork", "S25004. IMS Backlot Storm Drain", "S25005. Steve Lucas (Denark) Project", "S25006. Volunteer Welding Bottle Rent", "S25007. Facility Systems Camera Scoping", "S25008. GI For Kids", "S26001. B Self Job", "S26002. MSD BIM Hours on Main", "S26003. Renfrow Break Room", "S26004. Aspire Condenser Water Retrofit", "S26005. Tiny Home Project", "S26006. MSD Meals on Wheels (BIM)", "S26007. MSD CDC Office (BIM)", "S26008. Randy Webb Project", "S26009. Randy Webb Project (CT)", "S26010. S2A Integration", "S26011. IMC/IMS Building Improvements 2026", "S26012. BS Work", "S26013. TSelf Work", "S26014. RWebb Personal Work", "W18380. Lawrence County Schools Warranty", "W19170. Kingston Corners Warranty", "W19251. CSCC Campus Revitalization Warranty", "W20002. Church & Henley Warranty", "W20023. Dowell Springs (Acadia) Warranty", "W20028. Jefferson Memorial Warranty", "W21008. Covenant South Knox MOB Warranty", "W21012. Patricia Neal Warranty", "W21019. UT Fire Safety Warranty", "W22006. Big G Express Warranty", "W22012. Summit Warranty", "W22016. Dealers Warehouse Warranty", "W22017. TN National Warranty", "W22019. Fairview Elementary Warranty", "W22032. Timkin Steel Warranty", "W22033. Titanic Museum Custard Warranty", "W22034. Summit Medical Oak Ridge Warranty", "W22114. UTIA Warranty", "W22115. Roane County Sheriff Warranty", "W22154. Seymour Ambulance Warranty", "W22167. Roane County Sheriff Boiler Warranty", "W22170. TTE Sidewall Warranty", "W23002. Alcoa Retail Warranty", "W23020. Franklin County Esser Warranty", "W23025. MHC Kenworth Warranty", "W23026. Sandvik Warranty", "W23027. Neyland BP4 Warranty", "W23031. Lifestance Warranty", "W23038. Sewanee Ph 3 Warranty", "W23154. Westgate Resorts II Warranty", "W23172. McMinn HS Tennis Pavilion Warranty", "W23179. Black Bear Inn Reno Warranty", "W24002. Amaero Phase 1 Warranty", "W24003. Project Orchard Warranty", "W24004. Beauford Delaney Building Warranty", "W24008. South Doyle Warranty", "W24024. Amaero Phase 2 Warranty", "W24127. Dominos Pigeon Forge Warranty", "W24143. Nisus Bathrooms Warranty", "W24158. Cleveland Filter Plant", "CONTRACT WORK", "MY JOB IS NOT LISTED HERE"];   // the form's Job list on 2026-10-14 (same list as the Daily Job Log)

  // ---- Yes/No questions that need a real answer (silence is not No) ----
  var MUST_ANSWER = [
    ["concerns", "Any concerns - people, equipment, info, materials, schedule, safety, production, testing?"],
    ["doYou", "Got any photos or documents to attach?"],
    ["copy_foreman", "Want to copy a foreman or lead on this report?"],
    ["wouldYou", "Want to copy anybody else by email?"]
  ];

  var TEMPS = [[null, 10, "(-) 0-10°"], [10, 20, "10-20°"], [20, 30, "20-30°"], [30, 40, "30-40°"], [40, 50, "40-50°"],
    [50, 60, "50-60°"], [60, 70, "60-70°"], [70, 80, "70-80°"], [80, 90, "80-90°"], [90, 100, "90-100°"], [100, null, "(+) 100°"]];

  // ---------- small helpers ----------
  function truthy(v) { return !(v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0)); }
  function asList(v) { return v === undefined || v === null || v === "" ? [] : (Array.isArray(v) ? v : [v]); }

  // Find the exact list value, ignoring capital letters and extra spaces (pasted text is often a bit off)
  function exact(v, list) {
    if (v === undefined || v === null) return null;
    var k = String(v).trim().replace(/\s+/g, " ").toLowerCase();
    for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === k) return list[i];
    return null;
  }
  function yn(v) { return exact(v, ["Yes", "No"]); }

  // A job: exact name, or a bare job number like "A24019" / "A25015.B"
  function findJob(v) {
    var e = exact(v, JOBS);
    if (e) return e;
    var k = String(v || "").trim().toUpperCase().replace(/\.$/, "");
    if (!k) return null;
    var hits = JOBS.filter(function (j) { return j.split(" ")[0].replace(/\.$/, "").toUpperCase() === k; });
    if (hits.length === 1) return hits[0];
    // ...or just the name without its number, like "Corporate Square", when only one job has that name
    hits = JOBS.filter(function (j) { return j.replace(/^[A-Z]{1,2}\d{4,5}\.[A-Z]?\s+/, "").toUpperCase() === k; });
    return hits.length === 1 ? hits[0] : null;
  }

  function tempRange(f) {
    for (var i = 0; i < TEMPS.length; i++) {
      var lo = TEMPS[i][0], hi = TEMPS[i][1];
      if ((lo === null || f >= lo) && (hi === null || f < hi)) return TEMPS[i][2];
    }
  }

  // Any common clock time -> minutes after midnight, or null ("9", "9:35 am", "9.35pm", "13:20", "noon")
  function minutes(t) {
    var s = String(t == null ? "" : t).trim().toLowerCase();
    if (s === "noon") return 720;
    if (s === "midnight") return 0;
    var m = s.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*([ap])?\.?\s*m?\.?$/);
    if (!m) return null;
    var h = parseInt(m[1], 10), mi = parseInt(m[2] || "0", 10), ap = m[3];
    if (mi > 59) return null;
    if (ap) { if (h < 1 || h > 12) return null; h = (h % 12) + (ap === "p" ? 12 : 0); }
    else if (h > 23) return null;
    return h * 60 + mi;
  }

  // Minutes -> the form's three dropdowns, rounded half-up to its 10-minute steps
  function formTime(total) {
    total = (Math.floor((total + 5) / 10) * 10) % 1440;
    var h = Math.floor(total / 60), mi = total % 60;
    return [String((h % 12) || 12), (mi < 10 ? "0" : "") + mi, h >= 12 ? "PM" : "AM"];
  }

  /**
   * log = one visit's answers as plain values (the same keys the plugin uses).
   * Returns { fields, problems }. Only build a link when problems is empty.
   */
  function build(input) {
    var p = [], out = { typeOf: "Job Site Visit" };
    var log = JSON.parse(JSON.stringify(input || {}));     // never change the caller's copy
    function need(ok, msg) { if (!ok) p.push(msg); }

    MUST_ANSWER.forEach(function (q) { if (yn(log[q[0]])) log[q[0]] = yn(log[q[0]]); });

    function pick(key, list, label) {
      var v = log[key], e = exact(v, list);
      need(e, v ? label + ": \"" + v + "\" isn't on the form's list" : label + " is missing");
      if (e) out[key] = e;
    }
    pick("superintendent", SUPERS, "Superintendent");
    pick("projectManager", PMS, "Project Manager");
    var job = findJob(log.job);
    need(job, log.job ? "Job: \"" + log.job + "\" isn't on the form's job list" : "Job is missing");
    if (job) out.job = job;
    if (job === "CONTRACT WORK" || job === "MY JOB IS NOT LISTED HERE") {
      need(truthy(log.jobName), "What's the job name?");
      out.jobName = log.jobName || ""; out.jobNumber = log.jobNumber || "";
    }
    var d = String(log.date || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    need(d, "Date is missing (YYYY-MM-DD)");
    if (d) { out["dateOf5[month]"] = String(+d[2]); out["dateOf5[day]"] = String(+d[3]); out["dateOf5[year]"] = d[1]; }

    // Time in / out (required by the form)
    var tin = minutes(log.time_in), tout = minutes(log.time_out);
    need(tin !== null, truthy(log.time_in) ? "Time in \"" + log.time_in + "\" isn't a clock time" : "What time did you get there?");
    need(tout !== null, truthy(log.time_out) ? "Time out \"" + log.time_out + "\" isn't a clock time" : "What time did you leave?");
    if (tin !== null) { var a = formTime(tin); out["timeIn[hourSelect]"] = a[0]; out["timeIn[minuteSelect]"] = a[1]; out["timeIn[ampm]"] = a[2]; }
    if (tout !== null) { var b = formTime(tout); out["timeOut[hourSelect]"] = b[0]; out["timeOut[minuteSelect]"] = b[1]; out["timeOut[ampm]"] = b[2]; }
    if (tin !== null && tout !== null) need(tout > tin, "Time out isn't after time in - check AM/PM");

    // Weather and temperature
    var w = asList(log.weather).map(function (x) { return exact(x, WEATHER); });
    need(w.length && w.every(Boolean), "Weather must be one or more of: " + WEATHER.join(", "));
    if (w.some(Boolean)) out.weather = w.filter(Boolean).join(",");
    var t = typeof log.temp_f === "string" && /^\s*-?\d+(\.\d+)?\s*$/.test(log.temp_f) ? parseFloat(log.temp_f) : log.temp_f;
    need(typeof t === "number" && isFinite(t), "Temperature is missing (a number in °F)");
    if (typeof t === "number" && isFinite(t)) { out.temperaturedegrees = String(Math.round(t)); out.temperatureRange67 = tempRange(t); }

    // The report itself
    var stage = String(log.stageOf77 || "").trim();
    need(stage, "What stage is the job at?");
    if (stage) out.stageOf77 = stage;
    var obs = String(log.observations || "").trim();
    need(obs, "Observations are missing");
    if (obs) out.observations = obs;

    // Always-ask Yes/Nos
    MUST_ANSWER.forEach(function (q) { need(log[q[0]] === "Yes" || log[q[0]] === "No", "Still need: " + q[1]); });
    ["doYou", "wouldYou"].forEach(function (k) { if (log[k] === "Yes" || log[k] === "No") out[k] = log[k]; });

    // Concerns: a Yes needs areas AND an explanation; a No can't carry them
    var areas = asList(log.areasOf75), explain = String(log.explain || "").trim();
    if (log.concerns === "Yes") {
      need(areas.length, "Concerns is Yes but no area picked (" + AREAS.join(", ") + ")");
      need(explain, "Concerns is Yes but there's no explanation");
    } else if (log.concerns === "No" && (areas.length || explain)) p.push("Concern details are filled in but concerns is not Yes");
    if (areas.length) {
      var ga = areas.map(function (x) { return exact(x, AREAS); });
      need(ga.every(Boolean), "Areas of concern must come from: " + AREAS.join(", "));
      out.areasOf75 = AREAS.filter(function (x) { return ga.indexOf(x) >= 0; }).join(",");   // in the form's order
    }
    if (explain) out.explain = explain;

    // Copy a foreman (multi-select) and copy anybody else (one email)
    var cf = asList(log.foremanleadTo);
    if (log.copy_foreman === "Yes") need(cf.length, "Which foreman or lead should get a copy?");
    else if (cf.length) p.push("Foremen to copy are filled in but copy_foreman is not Yes");
    if (cf.length) {
      var gf = cf.map(function (x) { return exact(x, COPY_FOREMEN); });
      need(gf.every(Boolean), "Foreman to copy isn't on the form's copy list (Kyle Jolly is not on it)");
      out.foremanleadTo = gf.filter(Boolean).join(",");
    }
    var em = String(log.emailAddress || "").trim();
    if (log.wouldYou === "Yes") need(em, "What email address should get a copy?");
    else if (em) p.push("An email address is filled in but wouldYou is not Yes");
    if (em) {
      need(/^[^@\s,;]+@[^@\s,;]+\.[A-Za-z]{2,}$/.test(em), "Email \"" + em + "\" doesn't look like one email address");
      out.emailAddress = em;
    }

    var fields = {};
    Object.keys(out).forEach(function (k) { if (out[k] !== "") fields[k] = out[k]; });
    return { fields: fields, problems: p };
  }

  // Every value encoded exactly once, by the browser
  function jotformUrl(fields) {
    return JOTFORM + Object.keys(fields).map(function (k) { return k + "=" + encodeURIComponent(String(fields[k])); }).join("&");
  }

  // Pull the visit(s) out of whatever got pasted: a ```json fence, extra words, curly quotes...
  function parsePasted(text) {
    var s = String(text || "").replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    var start = s.search(/[\[{]/);
    if (start < 0) throw new Error("no report found");
    var open = s[start], close = open === "{" ? "}" : "]", end = s.lastIndexOf(close);
    if (end < start) throw new Error("report is cut off");
    var data = JSON.parse(s.slice(start, end + 1));
    if (data && data.visits) data = data.visits;              // {"visits":[...]} for several jobs
    return Array.isArray(data) ? data : [data];
  }

  var api = { build: build, jotformUrl: jotformUrl, parsePasted: parsePasted, minutes: minutes, formTime: formTime,
              tempRange: tempRange, findJob: findJob, JOBS: JOBS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SiteVisit = api;
})(this);
