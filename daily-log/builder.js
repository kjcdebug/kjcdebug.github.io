/*
 * IMC Daily Log - page-side builder (Route 1, v1.3.0, 2026-10-14)
 *
 * WHY: ChatGPT can't always run Python (it failed for Tyler, and voice mode may not run it),
 * so the checks and the link building that used to live in build_link.py now also live here,
 * on the Daily Log page. ChatGPT only has to write the day's log as plain JSON; the foreman
 * copies it, pastes it on the page, and this file turns it into the pre-filled Jotform link.
 *
 * It mirrors build_link.py rule for rule (tested against it), with three extra kindnesses
 * for pasted text: names/dropdowns match without caring about capital letters, a bare job
 * number like "A24019" finds its full job name, and "yes"/"no" in any case are accepted.
 *
 * Facts checked on the live form 70434232431141 (2026-10-14):
 *  - visitor times only stick as "hh:mm AM" with a two-digit hour
 *  - a double quote in a table cell can make the form turn "+" into a space
 *  - a table only shows when its Yes/No question is Yes
 *  - "copy another foreman" is a multi-select (comma-separated) and leaves out Kyle Jolly
 */
(function (root) {
  "use strict";

  var JOTFORM = "https://form.jotform.com/70434232431141?";

  // ---- Exact dropdown and checkbox values (copied from the live form) ----
  var FOREMEN = ["Aaron Alley","Aaron Ayling","Andrew Marchand","Billy Wolfenbarger","Brad Flanigan","Brady Hickman",
    "Brent Smartt","Carl Nielsen","Chris Davis","Chris Simpson","Daniel Nelson","Derek Smartt","Donnie Armstrong",
    "Eric Parker","Erik Armstrong","Jack Toomire","John Miller","Jon Fierro","Josh Dozier","Justin Hudson","Kevin Quinn",
    "Kieran McAtamney","Kyle Jolly","Marty Booker","Mike McAtamney","Mike Williams","Nick Curton","Noah Norton",
    "Parker Sheddan","Patrick Buckner","Phil Brown","Paul Kuykendall","Randall Quinn","Rhon Hawkins","Ricky Bettis",
    "Ross Kibodeaux","Ryan Yowell","Sam Fritts","Shawn Robinson","Simon Hyde","Tim Smith","Todd Lee","Tom Sears",
    "Travis Bell","Troy Whitehall","Whitney Poore","Zach Handy","Not listed here"];
  var PMS = ["Brad Self","Brent Smartt","Cade Trusley","Elise Justice","Justin Hudson","Randy Webb","Terry Self",
    "Tracy Moretz","PM Not Listed"];
  var TRADES = ["Plumbing","Sheet Metal","Special Projects"];
  var SHIFTS = ["8 Hour","10 Hour","Other"];
  var WEATHER = ["Sunny","Hot","Rainy","Cloudy","Cold","Snowy"];
  var DOC_TYPES = ["Schedules/Meeting Minutes","Punch List","Revisions","Submittals","Photos","other"];
  var ABSENCE = ["Out Sick","Late Arrival","Early Departure","Personal","PTO Scheduled","Jury Duty","Transportation",
    "Lack of Work","Weather","No-Call/No-Show"];
  var WARNING = ["Coaching","Verbal Warning","Written Warning","Suspension","Termination"];
  var COPY_FOREMEN = FOREMEN.filter(function (n) { return n !== "Kyle Jolly"; });  // the copy list leaves him out
  var SPECIAL_JOBS = ["IMU","Office","Pipe Fab Shop","Sheet Metal Shop","Warehouse","CONTRACT WORK","MY JOB IS NOT LISTED HERE"];
  var JOBS = ["IMU", "Office", "Pipe Fab Shop", "Sheet Metal Shop", "Warehouse", "A23003. Oak Ridge WWTP", "A23005. Neyland Stadium", "A23027. Neyland BP#4", "A23029. Neyland BP#6", "A23046. Neyland BP#7AD", "A23048. Neyland BP#7A", "A24004. Beauford Delaney Building", "A24009. Siemens", "A24014. Lindsey Nelson Renovation", "A24016. Neyland BP#7", "A24019. Flatrock Motorclub", "A24020.A DIDD Building A", "A24020.B DIDD Building B", "A24020.C DIDD Building C", "A24020.D DIDD Building D", "A25005. Neyland BP8", "A25008. LIS Laser Labratory Ventilation System", "A25009. Knoxville Forensic Center", "A25013. TCAT Knoxville Replacement Campus", "A25015.A TCAT Jacksboro Healthcare Building A", "A25015.B TCAT Jacksboro High Bay Building B", "A25019. HERMES", "A25020. AT&T Hartford", "A25021. Maryville High School New Additions", "A25024. Kuwahee WWTP Sodium Hypochlorite Conversion", "A25028. AT&T Chiller Replacement", "A25029. Sweetwater Hospital", "A25031. Sweetwater Boiler Replacement", "A26001. Greene County Track and Field", "A26002. Amaero Atomization Room 129 (PO-0796)", "A26004. UTK Student Union Plaza", "A26005. KOC-PT & Occupational Therapy", "A26006. UTK Presidential Court", "A26007. Eternal Water", "A26008. Knoxville Smiles", "A26009. Vision Knoxville Cooling Tower", "A26010. City of Knoxville Garage Ventilation", "A26011. LeConte Center Addition", "A26012. UTK Presidential Court Building", "A26014. Equipment Share Sewer Line", "A26015. Neyland BP9", "A26016. TCAT Knoxville Phase II", "A26018. Legacy Park", "A26019. Amaero Air and Argon Line (PO-1042)", "A26020. National Fitness Center Pool Deck Replacement", "A26021. KOC Building 6", "A26024. Amaero Fire Damage", "A26025. Knoxville P&DC Project", "A26026. Carbon Fiber", "A26027. Hardy Corp. BIM", "A26028. National Fitness Rework Sauna Duct", "A26029. Neyland Sound Upgrades", "A26030. Innovation South Pt. 2", "A26031. Kia Morristown", "A26032. UT Pratt Basketball Practice Facility", "A26033. Rocky Top North Phase 3", "A26034. Triso-X", "A26035. USPS PILS", "A26036. Hardy Corp. BIM 2", "A26037. HPER Building", "A26038. Amaero ICT Fan", "A26039. Pigeon Forge City Hall", "A26040. Crystal Building", "A26041. LIS Building Technologies 2", "B24126. FUD Clearwell", "B24168. RSCC Multi Building HVAC Correction 2", "B25112. KUB Miller Building", "B25118. Waldens Creek Intake", "B25127. Gatlinburg WWTP Bypas", "B25128. Walker Springs Pump", "B25129. Everett Rd. Tank and Boost", "B25130. Collegedale Improvements", "B25135. Frozen Head State Park", "B25136. Crossville Booster Station", "B25137. 1st Baptist Newport", "B25141. Blount County Health Dept.", "B25142. Dragon X Minigolf", "B25147. Hiawassee Effluent Reuse", "B25153. Maryville Preschool Reno", "B25156. Delaney Museam", "B25159. Creative Foam Fans", "B25160. CUD Intake and Fan", "B25163. Morristown Landing", "B25166. RSCC Boiler", "B26101. RSCC Boiler Drawings", "B26102. Benchmark Offices", "B26109. Bradley County Fire Station", "B26110. McClung Elevator Upgrades", "B26111. Oak Ridge Preservation", "B26112. KUB Control Room Upgrades", "B26113. Slick City", "B26119. Truss Vet Clinic", "B26123. Tamko ABCDE Jobs", "B26124. NGK Butterfly Addition", "B26125. Redline Athletics", "B26126. TCAT Polk County", "B26127. Tellico Village Bard Unit", "B26128. HUD PRV and BFP Upgrades", "B26131. Van Hicks Fire Line", "B26132. BAM 3", "B26133. Sweetwater Community Center", "B26134. Southern Constructors Water Heater", "B26135. Sweetwater Hospital Boiler Fans", "B26136. NGK Nitrogen Spool", "B26137. Corporate Square", "B26138. ORUD Building", "B26139. Vision Expansion Tank", "B26140. Truss Vet Water Leak Repair", "B26141. Holiday Inn Storage Tank", "B26142. ORSA HVAC", "B26143. Powell Dealer Warehouse", "B26144. Redline Duct Detectors", "B26145. New Market Pavilion", "B26146. Anderson County EMS", "OH6000. Overhead Indirect", "OH7000. Overhead", "S09728. 9728", "S22002. PSCC Boiler", "S23004. PVC Prototype Carts", "S23005. Horner Building Company Work", "S23007. Horner Drinking Fountain (Hampton Inn)", "S23008. Cross training IMC Employees", "S23009. Summit Medical Lab Sewer Repair", "S23012. New Hire Training", "S23014. ETNBH Welding Latch", "S23015. Horner Extra Work", "S23016. Innovate Louvers", "S23017. Innovate Printer Exhaust Fans Ph. 2", "S23018. Parkside Owner Taps", "S23019. Heritage Chiller Valves", "S23020. Air Compressor", "S23021. Heritage High Hydronic System Repair", "S23022. IMC Roofing", "S23023. IMC Concrete", "S23024. Dan Carlson Project", "S23025. Mountain Hope", "S23026. Averitt Express", "S23027. Amaero Gas for Temp Heaters", "S23028. Restroom Remodel Design Add", "S23029. Boiler Canopy Project Add", "S24001. TIS Mechanical Room", "S24002. Christian Brothers Auto Duct Fab", "S24003. RW Project", "S24004. BitDeer", "S24005. Foust Carney Sewage Clog", "S24006. IMS Work (John Miller)", "S25001. Parts Relocation", "S25002. Unit in Sevierville for BurWil", "S25003. PHCC Classroom Ductwork", "S25004. IMS Backlot Storm Drain", "S25005. Steve Lucas (Denark) Project", "S25006. Volunteer Welding Bottle Rent", "S25007. Facility Systems Camera Scoping", "S25008. GI For Kids", "S26001. B Self Job", "S26002. MSD BIM Hours on Main", "S26003. Renfrow Break Room", "S26004. Aspire Condenser Water Retrofit", "S26005. Tiny Home Project", "S26006. MSD Meals on Wheels (BIM)", "S26007. MSD CDC Office (BIM)", "S26008. Randy Webb Project", "S26009. Randy Webb Project (CT)", "S26010. S2A Integration", "S26011. IMC/IMS Building Improvements 2026", "S26012. BS Work", "S26013. TSelf Work", "S26014. RWebb Personal Work", "W18380. Lawrence County Schools Warranty", "W19170. Kingston Corners Warranty", "W19251. CSCC Campus Revitalization Warranty", "W20002. Church & Henley Warranty", "W20023. Dowell Springs (Acadia) Warranty", "W20028. Jefferson Memorial Warranty", "W21008. Covenant South Knox MOB Warranty", "W21012. Patricia Neal Warranty", "W21019. UT Fire Safety Warranty", "W22006. Big G Express Warranty", "W22012. Summit Warranty", "W22016. Dealers Warehouse Warranty", "W22017. TN National Warranty", "W22019. Fairview Elementary Warranty", "W22032. Timkin Steel Warranty", "W22033. Titanic Museum Custard Warranty", "W22034. Summit Medical Oak Ridge Warranty", "W22114. UTIA Warranty", "W22115. Roane County Sheriff Warranty", "W22154. Seymour Ambulance Warranty", "W22167. Roane County Sheriff Boiler Warranty", "W22170. TTE Sidewall Warranty", "W23002. Alcoa Retail Warranty", "W23020. Franklin County Esser Warranty", "W23025. MHC Kenworth Warranty", "W23026. Sandvik Warranty", "W23027. Neyland BP4 Warranty", "W23031. Lifestance Warranty", "W23038. Sewanee Ph 3 Warranty", "W23154. Westgate Resorts II Warranty", "W23172. McMinn HS Tennis Pavilion Warranty", "W23179. Black Bear Inn Reno Warranty", "W24002. Amaero Phase 1 Warranty", "W24003. Project Orchard Warranty", "W24004. Beauford Delaney Building Warranty", "W24008. South Doyle Warranty", "W24024. Amaero Phase 2 Warranty", "W24127. Dominos Pigeon Forge Warranty", "W24143. Nisus Bathrooms Warranty", "W24158. Cleveland Filter Plant", "CONTRACT WORK", "MY JOB IS NOT LISTED HERE"];   // every value in the form's Job list (215 on 2026-10-14)

  // ---- Table fields: link name -> exact column names (note the form's own spelling "Absense") ----
  var TABLES = [
    ["PlumbingManpower", ["Site Manager","Foremen","Plumbers","Operators","Apprentices","Pipe Fitter/Welders","Helpers","Temps"]],
    ["SheetmetalManpower", ["Site Manager","Foremen","Mechanics","Apprentices","Helpers","Temps"]],
    ["employeesAnd", ["Employee","Hours Missed","Reason for Absense"]],
    ["employeesAnd108", ["Employee","Warning Type","Details of Incident"]],
    ["subcontractors", ["Insulation","Control","Sprinklers","Other"]],
    ["deliveriesReceived", ["Suppliers","Carriers","Item(s)","Damages/Shortages"]],
    ["verbalInstructions50", ["Instructions Received","From"]],
    ["visitors", ["Name","Company/Org.","Purpose","Time In","Time Out"]]
  ];

  // ---- Yes/No question -> details that belong to it (first item is the one a Yes requires) ----
  var DETAILS = [
    ["didYou52", ["employeesAnd"]], ["didYou105", ["employeesAnd108"]],
    ["wereThere72", ["subcontractors", "additionalNotes"]], ["didYou84", ["brieflyDescribe"]],
    ["didYou95", ["brieflyDescribe96"]], ["wereThere58", ["deliveriesReceived", "didYou", "additionalNotes71"]],
    ["wasRental92", ["wasThere"]], ["wereThere54", ["delaysdamages"]], ["were", ["delaysdamages98"]],
    ["didYou55", ["verbalInstructions50"]], ["wereThere56", ["accidentInformation"]],
    ["wereThere57", ["visitors"]], ["doYou64", ["name65"]], ["doYou", ["internalImc"]],
    ["wouldYou87", ["foremanTo88"]], ["wouldYou", ["emailAddress"]]
  ];

  // ---- Yes/No questions that need a real answer (first four required by the form; rest = the sweep) ----
  var MUST_ANSWER = [
    ["didYou52", "Anybody out sick, late or leave early?"],
    ["didYou105", "Did you have to coach or write anybody up?"],
    ["wereThere58", "Anything delivered from a supplier?"],
    ["wasRental92", "Any rental equipment dropped off?"],
    ["wereThere54", "Anything slow you down or get damaged?"],
    ["were", "Any areas you couldn't get into?"],
    ["didYou55", "Did the GC, owner or inspector tell you to do anything different?"],
    ["wereThere56", "Any accidents or near misses?"],
    ["wereThere57", "Anybody come by - inspectors, GC, owner?"],
    ["wereThere72", "Any other trades working your area?"],
    ["didImc", "Did our own truck bring anything?"],
    ["didYou84", "Hang any prefab today?"],
    ["didYou95", "Anything not line up with the model or the prefab?"],
    ["doYou64", "Got any photos or paperwork to attach?"],
    ["wouldYou87", "Want to copy another foreman on this log?"],
    ["wouldYou", "Want to copy anybody else on it by email?"]
  ];

  var TEMPS = [[null, 10, "(-) 0-10°"], [10, 20, "10-20°"], [20, 30, "20-30°"], [30, 40, "30-40°"], [40, 50, "40-50°"],
    [50, 60, "50-60°"], [60, 70, "60-70°"], [70, 80, "70-80°"], [80, 90, "80-90°"], [90, 100, "90-100°"], [100, null, "(+) 100°"]];

  var TEXT_KEYS = ["didYou", "ifYou", "wasThere", "delaysdamages", "delaysdamages98", "accidentInformation",
    "brieflyDescribe", "brieflyDescribe96", "additionalNotes", "additionalNotes71", "internalImc", "otherNotesimportant"];

  // ---------- small helpers ----------
  function truthy(v) { return !(v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0)); }
  function str(v) { return typeof v === "number" && Number.isInteger(v) ? String(v) : String(v); }

  // Find the exact list value, ignoring capital letters and extra spaces (pasted text is often a bit off)
  function exact(v, list) {
    if (v === undefined || v === null) return null;
    var k = String(v).trim().replace(/\s+/g, " ").toLowerCase();
    for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === k) return list[i];
    return null;
  }

  // Yes/No in any case
  function yn(v) { var e = exact(v, ["Yes", "No"]); return e; }

  // A job: exact name, or a bare job number like "A24019" / "A25015.B"
  function findJob(v) {
    var e = exact(v, JOBS);
    if (e) return e;
    var k = String(v || "").trim().toUpperCase().replace(/\.$/, "");
    if (!k) return null;
    var hits = JOBS.filter(function (j) { var num = j.split(" ")[0].replace(/\.$/, ""); return num.toUpperCase() === k; });
    return hits.length === 1 ? hits[0] : null;
  }

  function tempRange(f) {
    for (var i = 0; i < TEMPS.length; i++) {
      var lo = TEMPS[i][0], hi = TEMPS[i][1];
      if ((lo === null || f >= lo) && (hi === null || f < hi)) return TEMPS[i][2];
    }
  }

  // Visitor times must be "hh:mm AM" with a two-digit hour; returns null if it isn't a clock time
  function clock(t) {
    if (/^\s*noon\s*$/i.test(String(t))) return "12:00 PM";          // foremen say "noon"
    if (/^\s*midnight\s*$/i.test(String(t))) return "12:00 AM";
    var m = String(t == null ? "" : t).match(/^\s*(\d{1,2})(?::(\d{2}))?\s*([AaPp])?\.?\s*[Mm]?\.?\s*$/);
    if (!m) return null;
    var h = parseInt(m[1], 10), mi = parseInt(m[2] || "0", 10), ap = (m[3] || "").toUpperCase();
    if (!ap) {
      if (h > 23 || mi > 59) return null;
      ap = h >= 12 ? "PM" : "AM"; h = (h % 12) || 12;
    } else {
      if (h < 1 || h > 12 || mi > 59) return null;
      ap += "M";
    }
    return (h < 10 ? "0" : "") + h + ":" + (mi < 10 ? "0" : "") + mi + " " + ap;
  }

  // Table cells: swap double quotes for two apostrophes and "+" for "and" (both break the form's tables)
  function cell(v) { return str(v).replace(/"/g, "''").replace(/\s*\+\s*/g, " and ").trim(); }

  /**
   * log  = the day's answers as plain values (the same keys the plugin uses).
   * Returns { fields, problems }. Only build a link when problems is empty.
   */
  function build(input) {
    var p = [], out = {};
    var log = JSON.parse(JSON.stringify(input || {}));     // never change the caller's copy
    function need(ok, msg) { if (!ok) p.push(msg); }

    // Normalise every Yes/No we know about (any case)
    MUST_ANSWER.concat([["doYou"], ["didYou"], ["wasThere"]]).forEach(function (q) {
      if (log[q[0]] !== undefined && yn(log[q[0]])) log[q[0]] = yn(log[q[0]]);
    });

    // Packing slips: roll per-delivery "slip"/"slip_why" into the form's one slip question
    var rows = (log.deliveriesReceived || []).map(function (r) { return Object.assign({}, r); });
    if (rows.some(function (r) { return "slip" in r; })) {
      var missing = [];
      rows.forEach(function (r) {
        var slip = yn(r.slip), why = r.slip_why || "";
        delete r.slip; delete r.slip_why;
        if (!slip) p.push("Packing slip yes or no for the " + (r.Suppliers || "delivery") + " delivery?");
        else if (slip === "No") missing.push((r.Suppliers || "Delivery") + ": no packing slip" + (why ? " (" + why + ")" : ""));
      });
      log.deliveriesReceived = rows;
      log.didYou = missing.length ? "No" : "Yes";
      if (missing.length) {
        var others = rows.filter(function (r) {
          return r.Suppliers && !missing.some(function (m) { return m.indexOf(r.Suppliers + ":") === 0; });
        }).map(function (r) { return r.Suppliers; });
        log.ifYou = missing.join("; ") + (others.length ? ". Slip received for: " + others.join(", ") + "." : ".");
      }
    }

    // Header fields
    function pick(key, list, label) {
      var v = log[key], e = exact(v, list);
      need(e, v ? label + ": \"" + v + "\" isn't on the form's list" : label + " is missing");
      if (e) out[key] = e;
    }
    pick("foremansiteManager", FOREMEN, "Foreman");
    if (out.foremansiteManager === "Not listed here") {
      out["foremansiteManager100[first]"] = log.foreman_first || "";
      out["foremansiteManager100[last]"] = log.foreman_last || "";
    }
    pick("trade", TRADES, "Trade");
    pick("projectManager", PMS, "Project Manager");
    pick("todaysShift", SHIFTS, "Shift");
    var job = findJob(log.job86);
    need(job, log.job86 ? "Job: \"" + log.job86 + "\" isn't on the form's job list" : "Job is missing");
    if (job) out.job86 = job;
    if (job === "CONTRACT WORK" || job === "MY JOB IS NOT LISTED HERE") {
      out.jobName = log.jobName || ""; out.jobNumber = log.jobNumber || "";
    }
    var d = String(log.date || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    need(d, "Date is missing (YYYY-MM-DD)");
    if (d) { out["date[month]"] = String(+d[2]); out["date[day]"] = String(+d[3]); out["date[year]"] = d[1]; }
    var w = (log.weather || []).map(function (x) { return exact(x, WEATHER); });
    need(w.length && w.every(Boolean), "Weather must be one or more of: " + WEATHER.join(", "));
    if (w.length && w.every(Boolean)) out.name6 = w.join(",");
    var t = typeof log.temp_f === "string" && /^-?\d+(\.\d+)?$/.test(log.temp_f.trim()) ? parseFloat(log.temp_f) : log.temp_f;
    need(typeof t === "number" && isFinite(t), "Temperature is missing (a number in °F)");
    if (typeof t === "number" && isFinite(t)) out.name67 = tempRange(t);
    var wa = String(log.workAccomplished || "").trim();
    need(wa, "Work accomplished is missing");
    out.workAccomplished = wa;
    need(truthy(log.PlumbingManpower) || truthy(log.SheetmetalManpower) || log.crew_unknown,
      "Crew counts are missing");

    // Every required and sweep Yes/No needs a real answer
    MUST_ANSWER.forEach(function (q) {
      var v = log[q[0]];
      need(v === "Yes" || v === "No", "Still need: " + q[1]);
      if (v === "Yes" || v === "No") out[q[0]] = v;
    });
    if (log.doYou === "Yes" || log.doYou === "No") out.doYou = log.doYou;

    // Details only count under a Yes, and a Yes needs its details
    DETAILS.forEach(function (pair) {
      var q = pair[0], keys = pair[1];
      var has = keys.filter(function (k) { return truthy(log[k]); });
      if (has.length && log[q] !== "Yes") p.push(has.join(", ") + " filled in but " + q + " is not Yes");
      if (log[q] === "Yes" && !truthy(log[keys[0]])) p.push(q + " is Yes but its details are missing");
    });
    if (log.wereThere58 === "Yes") {
      need(log.didYou === "Yes" || log.didYou === "No", "Did the delivery come with a packing slip?");
      if (log.didYou === "No") need(truthy(log.ifYou), "No packing slip - why not?");
    }
    if (log.wasRental92 === "Yes") need(log.wasThere === "Yes" || log.wasThere === "No", "Any existing damage on the rental?");
    if (log.wereThere54 === "Yes") need(String(log.delaysdamages || "").indexOf("Hours lost:") === 0,
      "Delays must start with 'Hours lost: <hours> hours x <people> people = <total> crew-hours'");

    // Plain text fields
    TEXT_KEYS.forEach(function (k) { if (truthy(log[k])) out[k] = str(log[k]).trim(); });

    // Copy another foreman (multi-select) and copy anybody else (one email)
    var cf = log.foremanTo88 || [];
    if (typeof cf === "string") cf = [cf];
    if (cf.length) {
      var good = cf.map(function (x) { return exact(x, COPY_FOREMEN); });
      need(good.every(Boolean), "Foreman to copy isn't on the form's copy list (Kyle Jolly is not on it)");
      out.foremanTo88 = good.filter(Boolean).join(",");
    }
    var em = String(log.emailAddress || "").trim();
    if (em) {
      need(/^[^@\s,;]+@[^@\s,;]+\.[A-Za-z]{2,}$/.test(em), "Email \"" + em + "\" doesn't look like one email address");
      out.emailAddress = em;
    }
    var dt = log.name65 || [];
    if (dt.length) {
      var dts = dt.map(function (x) { return exact(x, DOC_TYPES); });
      need(dts.every(Boolean), "Document types must come from: " + DOC_TYPES.join(", "));
      out.name65 = dts.filter(Boolean).join(",");
    }

    // Tables -> one JSON string each, exact column names, empty and zero cells dropped
    TABLES.forEach(function (pair) {
      var tname = pair[0], cols = pair[1], rows = log[tname];
      if (!truthy(rows)) return;
      var clean = [];
      rows.forEach(function (r) {
        var bad = Object.keys(r).filter(function (c) { return cols.indexOf(c) < 0; });
        if (bad.length) p.push(tname + ": unknown column(s) " + bad.join(", "));
        var row = {};
        cols.forEach(function (c) {
          var v = r[c];
          if (v === undefined || v === null || v === "" || v === 0 || v === "0") return;
          row[c] = cell(v);
        });
        if (tname === "visitors") ["Time In", "Time Out"].forEach(function (c) {
          if (c in row) {
            var tt = clock(row[c]);
            if (tt) row[c] = tt;
            else { p.push("Visitor time \"" + row[c] + "\" isn't a clock time"); delete row[c]; }
          }
        });
        if (Object.keys(row).length) clean.push(row);
      });
      if (tname === "employeesAnd") clean.forEach(function (r) {
        var e = exact(r["Reason for Absense"], ABSENCE);
        need(e, "Absence reason \"" + r["Reason for Absense"] + "\" must be one of: " + ABSENCE.join(", "));
        if (e) r["Reason for Absense"] = e;
      });
      if (tname === "employeesAnd108") clean.forEach(function (r) {
        var e = exact(r["Warning Type"], WARNING);
        need(e, "Warning type \"" + r["Warning Type"] + "\" must be one of: " + WARNING.join(", "));
        if (e) r["Warning Type"] = e;
      });
      out[tname] = JSON.stringify(clean);
    });

    var fields = {};
    Object.keys(out).forEach(function (k) { if (out[k] !== "") fields[k] = out[k]; });
    return { fields: fields, problems: p };
  }

  // Every value encoded exactly once, by the browser
  function jotformUrl(fields) {
    return JOTFORM + Object.keys(fields).map(function (k) { return k + "=" + encodeURIComponent(String(fields[k])); }).join("&");
  }

  // Pull the log(s) out of whatever got pasted: a ```json fence, extra words, curly quotes...
  function parsePasted(text) {
    var s = String(text || "").replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    var start = s.search(/[\[{]/);
    if (start < 0) throw new Error("no log found");
    var open = s[start], close = open === "{" ? "}" : "]", end = s.lastIndexOf(close);
    if (end < start) throw new Error("log is cut off");
    var data = JSON.parse(s.slice(start, end + 1));
    if (data && data.logs) data = data.logs;                 // {"logs":[...]} for two jobs
    return Array.isArray(data) ? data : [data];
  }

  var api = { build: build, jotformUrl: jotformUrl, parsePasted: parsePasted, clock: clock, tempRange: tempRange, findJob: findJob };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DailyLog = api;
})(this);
