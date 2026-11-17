const revealItems = document.querySelectorAll("[data-reveal]");
const checklistToggle = document.querySelector("#checklist-toggle");
const footprintChecklist = document.querySelector("#footprint-checklist");

if (checklistToggle && footprintChecklist) {
  checklistToggle.addEventListener("click", () => {
    footprintChecklist.hidden = !footprintChecklist.hidden;
    const isExpanded = !footprintChecklist.hidden;
    checklistToggle.textContent = isExpanded ? "Hide checklist" : "Show checklist";
    checklistToggle.setAttribute("aria-expanded", String(isExpanded));
    console.log("Five-minute checklist expanded:", isExpanded);
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// --- "See what your IP reveals" demo (home page) ---
// Results and the visitor's answer are only shown on screen; nothing is stored.
const ipLookupButton = document.querySelector("#ip-lookup-button");

if (ipLookupButton) {
  const ipStatus = document.querySelector("#ip-status");
  const ipError = document.querySelector("#ip-error");
  const ipResults = document.querySelector("#ip-results");
  const ipConfirmYes = document.querySelector("#ip-confirm-yes");
  const ipConfirmNo = document.querySelector("#ip-confirm-no");
  const ipConfirmResponse = document.querySelector("#ip-confirm-response");
  const resultFields = {
    ip: document.querySelector("#ip-result-ip"),
    city: document.querySelector("#ip-result-city"),
    region: document.querySelector("#ip-result-region"),
    postal: document.querySelector("#ip-result-postal"),
    country: document.querySelector("#ip-result-country"),
    coords: document.querySelector("#ip-result-coords"),
    timezone: document.querySelector("#ip-result-timezone"),
    network: document.querySelector("#ip-result-network"),
    asn: document.querySelector("#ip-result-asn"),
    deviceType: document.querySelector("#ip-result-device-type"),
    os: document.querySelector("#ip-result-os"),
    browser: document.querySelector("#ip-result-browser"),
  };

  // Read locally from the visitor's own browser; never sent anywhere by this site.
  const getDeviceDetails = () => {
    const ua = navigator.userAgent || "";
    const uaData = navigator.userAgentData;

    let deviceType = "Computer (desktop or laptop)";
    const isTablet =
      /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
    if (isTablet) {
      deviceType = "Tablet";
    } else if ((uaData && uaData.mobile) || /Mobi|iPhone|Android/i.test(ua)) {
      deviceType = "Mobile phone";
    }

    let os = "";
    if (/Windows/i.test(ua)) os = "Windows";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS / iPadOS";
    else if (/Mac/i.test(ua)) os = "macOS";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/CrOS/i.test(ua)) os = "ChromeOS";
    else if (/Linux/i.test(ua)) os = "Linux";

    let browser = "";
    if (/Edg\//.test(ua)) browser = "Microsoft Edge";
    else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
    else if (/Firefox\//.test(ua)) browser = "Firefox";
    else if (/Chrome\//.test(ua)) browser = "Chrome";
    else if (/Safari\//.test(ua)) browser = "Safari";

    return { deviceType, os, browser };
  };

  const formatCoords = (lat, lon) =>
    typeof lat === "number" && typeof lon === "number"
      ? lat.toFixed(4) + ", " + lon.toFixed(4)
      : "";

  const fetchFromIpapi = async () => {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error("ipapi.co responded with status " + response.status);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error("ipapi.co error: " + (data.reason || "unknown"));
    }
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      postal: data.postal,
      country: data.country_name,
      coords: formatCoords(data.latitude, data.longitude),
      timezone: data.timezone,
      network: data.org,
      asn: data.asn,
    };
  };

  const fetchFromIpwhois = async () => {
    const response = await fetch("https://ipwho.is/");
    if (!response.ok) {
      throw new Error("ipwho.is responded with status " + response.status);
    }
    const data = await response.json();
    if (data.success === false) {
      throw new Error("ipwho.is error: " + (data.message || "unknown"));
    }
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      postal: data.postal,
      country: data.country,
      coords: formatCoords(data.latitude, data.longitude),
      timezone: data.timezone && data.timezone.id,
      network: data.connection && (data.connection.isp || data.connection.org),
      asn: data.connection && data.connection.asn ? "AS" + data.connection.asn : "",
    };
  };

  ipLookupButton.addEventListener("click", async () => {
    ipLookupButton.disabled = true;
    ipError.hidden = true;
    ipResults.hidden = true;
    ipConfirmResponse.hidden = true;
    ipStatus.textContent = "Looking up your public IP address\u2026";
    ipStatus.hidden = false;

    let details;
    try {
      details = await fetchFromIpapi();
    } catch (primaryError) {
      console.warn("Primary IP lookup failed, trying fallback:", primaryError);
      try {
        details = await fetchFromIpwhois();
      } catch (fallbackError) {
        console.warn("Fallback IP lookup failed:", fallbackError);
      }
    }

    ipStatus.hidden = true;
    ipLookupButton.disabled = false;

    if (!details || !details.ip) {
      ipError.textContent =
        "Sorry, the IP lookup did not work right now. The service may be busy or blocked by your browser \u2014 please try again later.";
      ipError.hidden = false;
      return;
    }

    Object.assign(details, getDeviceDetails());
    Object.keys(resultFields).forEach((key) => {
      resultFields[key].textContent = details[key] || "Not available";
    });
    ipResults.hidden = false;
    ipLookupButton.textContent = "Check again";
  });

  const showConfirmResponse = (message) => {
    ipConfirmResponse.textContent = message;
    ipConfirmResponse.hidden = false;
  };

  ipConfirmYes.addEventListener("click", () => {
    showConfirmResponse(
      "Thanks for confirming. This shows how much a single website visit can suggest about you \u2014 but remember, nothing you saw here was saved."
    );
  });

  ipConfirmNo.addEventListener("click", () => {
    showConfirmResponse(
      "Good to know \u2014 IP-based location is only an estimate and is often wrong. Nothing you saw here was saved."
    );
  });
}

// --- Optional name search (home page) ---
// Submits natively to Google in a new tab; we only block empty/whitespace names.
const nameSearchForm = document.querySelector("#name-search-form");

if (nameSearchForm) {
  const nameSearchInput = document.querySelector("#name-search-input");

  nameSearchForm.addEventListener("submit", (event) => {
    const name = nameSearchInput.value.trim();
    if (!name) {
      event.preventDefault();
      nameSearchInput.focus();
      return;
    }
    nameSearchInput.value = name;
  });
}
