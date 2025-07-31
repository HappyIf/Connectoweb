/* ===========================================================
      Utility / Mock / Placeholder Functions
      =========================================================== */

// Import CryptoJS library for AES encryption/decryption
// Assuming it's included via a <script> tag before this code

async function encryptData(data, password) {
  if (typeof data !== 'string' || data.trim() === '' ||
    typeof password !== 'string' || password.trim() === '') {
    console.error('Invalid data or password provided for encryption.');
    return;
  }

  try {
    // Convert the password string to an array of bytes
    const textEncoder = new TextEncoder();
    const passwordBytes = textEncoder.encode(password);

    // Derive a cryptographic key from the password
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive an AES key
    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: passwordBytes, // Use the password itself as the salt for simplicity
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Generate a random initialization vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const dataBytes = textEncoder.encode(data);
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      dataBytes
    );

    // Concatenate the IV and encrypted data
    const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength);
    encryptedArray.set(iv);
    encryptedArray.set(new Uint8Array(encryptedData), iv.length);

    // Convert to Base64 and log the result
    const encryptedString = btoa(String.fromCharCode(...encryptedArray));
    console.log(encryptedString);
    return encryptedString;
  } catch (error) {
    console.error('Encryption failed:', error);
  }
}

async function encryptSVG(svgContent, password) {
  if (typeof svgContent !== 'string' || svgContent.trim() === '') {
    console.error('Invalid SVG content provided for encryption.');
    return;
  }
  const encryptedSvg = await encryptData(svgContent, password);
  console.log('Encrypted SVG:', encryptedSvg);
  return encryptedSvg;
}

async function decryptData(encryptedData, password) {
  // Check for valid encrypted data and password
  if (typeof encryptedData !== 'string' || encryptedData.trim() === '' ||
    typeof password !== 'string' || password.trim() === '') {
    console.error('Invalid encrypted data or password provided for decryption.');
    return;
  }

  try {
    // Convert the Base64 string back to a Uint8Array
    const encryptedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = encryptedArray.slice(0, 12);
    const encryptedBytes = encryptedArray.slice(12);

    // Convert the password string to an array of bytes
    const textEncoder = new TextEncoder();
    const passwordBytes = textEncoder.encode(password);

    //console.log(passwordBytes);

    // Derive the key
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive an AES key
    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: passwordBytes,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, encryptedBytes);

    // Convert to string and log the result
    const decryptedString = new TextDecoder().decode(decryptedData);
    //console.log(decryptedString);
    return decryptedString;
  } catch (error) {
    passwordModal.style.display = 'flex';
    console.error('Decryption failed:', error);
  }
}

async function decryptAndPlaceSVG(encryptedSvg, password, elementId) {
  const decryptedSvg = await decryptData(encryptedSvg, password);
  if (decryptedSvg) {
    const svgElement = document.getElementById(elementId);
    if (svgElement) {
      svgElement.innerHTML = decryptedSvg;
    }
  }
}

/**
 * Mock function to decrypt the API URL using the password.
 * Replace with your real decryption method.
 */
function decryptUrl(encryptedUrl, password) {
  // if(decryptData(encryptedUrl, password) == null)
  // return encryptedUrl;
  // else
  // return decryptData(encryptedUrl, password);
  return encryptedUrl;
}

/**
 * Simple helper to get URL params by name
 */
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/* ===========================================================
    Password Check & Modal
    =========================================================== */
const passwordModal = document.getElementById('passwordModal');
const passwordField = document.getElementById('passwordField');
const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');

// Check if password param is in URL
let password = getUrlParam('password');
if (!password) {
  // Show modal
  passwordModal.style.display = 'flex';
  setTimeout(() => {
    passwordField.focus();
    passwordModal.tabIndex = 0;
  }, 50);
} else {
  // We have a password param, proceed
  // decrypt the API URL or do any needed initialization
  initApp();
}

passwordSubmitBtn.addEventListener('click', () => {

  passwordSubmission();
});

function passwordSubmission(e) {
  try {
    e.preventDefault(); // Prevent page reload
  } catch (error) {
    console.log("Error: " + error);
  }
  const enteredPass = passwordField.value.trim();
  if (enteredPass) {

    try {
      window.ReactNativeWebView.postMessage("CONNECTOPASS:" + JSON.stringify(array));
    }
    catch (e) {
      console.log("Not in Connecto APP");
    }

    // Reload the page with the password param
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('password', enteredPass);
    window.location.href = newUrl.toString();
  }
}

/* ===========================================================
    Tabs Switching
    =========================================================== */
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('focus', () => {
    // Deactivate all tabs
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));

    // Activate the clicked tab
    btn.classList.add('active');
    const tabName = btn.getAttribute('data-tab');
    document.getElementById(tabName + 'Tab').classList.add('active');
  });
});

/* ===========================================================
    DPAD / Key Handling (fast-forward key = 90)
    =========================================================== */
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 228) {
    // Keycode 90 pressed (Android fast-forward)
    // We can run a special function if an element is focused
    const focused = document.activeElement;
    if (focused && focused.dataset && focused.dataset.link && !editMode) {
      // If the item has a data-link, handle fast-forward action
      handleItemSelect('fastForward', focused.dataset.link, focused);
    }
  }
});

/* ===========================================================
    App Initialization after password is found
    =========================================================== */
var baseURL;
var params = new URLSearchParams(document.location.search)
var pass = params.get("password");
var array = [];

async function initApp() {
  /*this file will not work unless published to GitHub as we are using it as a raw link*/
  const response = await fetch(`https://raw.githubusercontent.com/HappyIf/Connectoweb/refs/heads/main/secrets.json?t=${Date.now()}`, {
    cache: "no-store"
  });



  const result = await response.json();
  //const array = JSON.parse(result);

  baseURL = result[0]["api"];
  baseURL = await decryptData(baseURL, pass);

  //console.log(result[0]["logo"]);
  let encryptedSVG = result[0]["logo"];
  await decryptAndPlaceSVG(encryptedSVG, pass, "savedLogo");
  // In real usage, decrypt the actual API endpoint with the password:
  let urlObj = new URL(baseURL);

  array = [
    {
      "url": urlObj.origin + urlObj.pathname,
      "password": pass
    }
  ];
  try {
    window.ReactNativeWebView.postMessage("CONNECTOPASS:" + JSON.stringify(array));
  }
  catch (e) {
    console.log("Not in Connecto APP");
  }
  console.log(baseURL.slice(-10));
  document.getElementById("apiID").innerText = baseURL.slice(-10);
  baseURL = baseURL + "?password=" + pass;
  // Start building out the skeletons, then fetch data
  buildSkeletons();

  if (!navigator.userAgent.includes("AFT")) {
    document.getElementById("customiseBtn").style.opacity = 1;
  } else {
    document.querySelector(".shine").remove();

    var style = document.createElement('style');
    style.textContent = `
       main::after {
       animation: none!important;
       }
    `;
    document.head.appendChild(style);

  }

  // Load quick links for Saved tab
  loadQuickLinks();

  // Load Live tab data
  //loadLiveLinks(baseURL + "&filename=live.json");

  document.getElementById("savedbtn").addEventListener("focusin", function () {
    buildSkeletons();
    loadQuickLinks();
  });
  document.getElementById("livebtn").addEventListener("focusin", function () {
    buildSkeletons();
    loadLiveLinks(baseURL + "&filename=live.json");
  });
  // document.getElementById("notesbtn").addEventListener("focus", function () {
  //   loadQuickLinks();
  // });
}

/* ===========================================================
    Skeleton Builders
    =========================================================== */
function buildSkeletons() {
  // Saved Tab skeleton (quick links)
  const quickLinksContainer = document.getElementById('quickLinks');
  quickLinksContainer.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const skel = document.createElement('div');
    skel.classList.add('quick-link', 'skeleton');
    quickLinksContainer.appendChild(skel);
  }

  // Live tab skeleton
  const liveGrid = document.getElementById('liveGrid');
  liveGrid.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const tile = document.createElement('div');
    tile.classList.add('live-tile', 'skeleton');

    const imgDiv = document.createElement('div');
    imgDiv.classList.add('live-tile-img');
    tile.appendChild(imgDiv);

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('live-tile-title');
    titleDiv.style.height = '1rem';
    tile.appendChild(titleDiv);

    const metaDiv = document.createElement('div');
    metaDiv.classList.add('live-tile-meta');
    metaDiv.style.height = '0.8rem';
    tile.appendChild(metaDiv);

    liveGrid.appendChild(tile);
  }
}

/* ===========================================================
    Loading & Rendering: Saved Tab
    =========================================================== */
function loadQuickLinks(apiUrl) {
  // Simulate a fetch from your real endpoint
  // setTimeout to simulate network
  setTimeout(() => {
    // Remove skeleton
    const quickLinksContainer = document.getElementById('quickLinks');
    quickLinksContainer.innerHTML = '';

    // Mock data
    const data = [
      {
        "name": "Google",
        "link": "https://google.com"
      },
      {
        "name": "Youtube",
        "link": "https://youtube.com"
      },
      {
        "name": "PW",
        "link": "https://www.pw.live/study-v2/batches/65dc6fbabb55350018d555b7/batch-overview#Subjects_2"
      }
    ];

    data.forEach((item, index) => {
      renderQuickLink(item, index);
    });
  }, 1000);
}

function renderQuickLink(item, index) {
  const quickLinksContainer = document.getElementById('quickLinks');
  const ql = document.createElement('div');
  ql.classList.add('quick-link');
  ql.tabIndex = 0;//5 + index; // set tab index (just an example)
  ql.draggable = false; // will enable in edit mode
  ql.dataset.link = item.link; // store the link for DPAD / fastForward usage

  // Icon container
  const iconCont = document.createElement('div');
  iconCont.classList.add('icon-container');
  const iconImg = document.createElement('img');
  let urlObj = new URL(item.link);
  iconImg.src = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${urlObj.hostname}&size=128`;
  iconCont.appendChild(iconImg);

  // Text
  const textDiv = document.createElement('div');
  textDiv.classList.add('ql-text');
  textDiv.textContent = item.name;

  // Remove icon (visible in edit mode)
  const removeIcon = document.createElement('div');
  removeIcon.classList.add('remove-icon');
  removeIcon.innerHTML = '×';
  removeIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    ql.remove();
  });

  // Build structure
  ql.appendChild(iconCont);
  ql.appendChild(textDiv);
  ql.appendChild(removeIcon);

  // Handle normal click
  ql.addEventListener('click', () => {
    if (!editMode) {
      window.location.href = ql.getAttribute('data-link');
      //handleItemSelect('click', item.link);
    }
  });

  quickLinksContainer.appendChild(ql);
}

/* ===========================================================
    Loading & Rendering: Live Tab
    =========================================================== */
/* function loadLiveLinks(apiUrl) {
 
   // Remove skeleton
   const liveGrid = document.getElementById('liveGrid');
   liveGrid.innerHTML = '';
     // get user agent info
 
     // Mock data
     const data = [
       {
         title: 'Cool Article',
         link: 'https://youtube.com',
         device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
         time: '2025-03-28 10:00',
       },
       {
         title: 'Another Link',
         link: 'https://www.instagram.com/p/DHvn5tyyfCnqa_fD5qXxzz0cOAq6GwtNCqc01E0/',
         device: 'Mozilla/5.0 (Linux; Android 12; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36',
         time: '2025-03-28 09:55',
       },
       {
         title: 'Firetv Link',
         link: 'https://amazon.com/',
         device: 'Mozilla/5.0 (Linux; Android 9; FTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36',
         time: '2025-03-28 07:55',
       },
       {
         title: 'Windows Link',
         link: 'https://windows.com/',
         device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
         time: '2025-03-28 09:55',
       },
       {
         title: 'Android Link',
         link: 'https://android.com/',
         device: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
         time: '2025-03-28 09:55',
       },
     ];
 
     data.forEach((item, index) => {
       const tile = document.createElement('div');
       tile.classList.add('live-tile');
       tile.tabIndex = 10 + index;
       tile.dataset.link = item.link;
 
       // Image
       const imgDiv = document.createElement('div');
       imgDiv.classList.add('live-tile-img');
       const ogImg = document.createElement('img');
       let urlObj = new URL(item.link);
       ogImg.src = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${urlObj.hostname}&size=128`;
 
       const os = item.device;
 
 
       const deviceInfoDiv = document.createElement("div");
       deviceInfoDiv.classList.add("device-info");
 
       let deviceIcon = "question_mark"; // Default icon
       var str = "";
       if (os.toLowerCase().includes("android") && item.device.includes("FT") && item.device.includes("TV")) {
         str = "TV";
         deviceIcon = "tv"; // Fire TV
       } else if (os.toLowerCase().includes("android")) {
         str = "Android";
         deviceIcon = "smartphone"; // Android
       } else if (os.toLowerCase().includes("windows")) {
         str = "Windows";
         deviceIcon = "desktop_windows";
       }
       deviceInfoDiv.innerHTML = `<span class="material-symbols-outlined">${deviceIcon}</span>
       ${str}`;
       //console.log(str);
       imgDiv.appendChild(ogImg);
       imgDiv.appendChild(deviceInfoDiv);
 
       // Title
       const deviceLinkDiv = document.createElement("div");
       deviceLinkDiv.classList.add("device-link");
       deviceLinkDiv.textContent = item.link;
       imgDiv.appendChild(deviceLinkDiv);
       const titleDiv = document.createElement('div');
       titleDiv.classList.add('live-tile-title');
       titleDiv.textContent = item.title;
 
       // Meta
       const metaDiv = document.createElement('div');
       metaDiv.classList.add('live-tile-meta');
       metaDiv.textContent = `Time: ${item.time}`;
 
       // Build structure
       tile.appendChild(imgDiv);
       tile.appendChild(titleDiv);
       tile.appendChild(metaDiv);
 
       // Handle normal click
       tile.addEventListener('click', () => {
         handleItemSelect('click', item.link);
       });
 
       liveGrid.appendChild(tile);
     });
   
 }*/

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const options = { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true };

  if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  } else if (diffDays < 7) {
    return `${date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  } else {
    return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  }
}



async function loadLiveLinks(apiUrl) {
  try {
    const response = await fetch(apiUrl);

    const result = await response.text();

    // Parse message field as JSON
    let data;
    try {
      data = JSON.parse(result);//.message.replace(/\r?\n/g, ''));
    } catch (error) {
      console.error("Error parsing message JSON:", error);
      return;
    }

    // Remove skeleton
    const liveGrid = document.getElementById('liveGrid');
    liveGrid.innerHTML = '';

    data = data.reverse();

    data.forEach((item, index) => {
      const tile = document.createElement('div');
      tile.classList.add('live-tile');
      tile.tabIndex = 0;//10 + index;
      tile.dataset.link = item.link;

      // Image
      const imgDiv = document.createElement('div');
      imgDiv.classList.add('live-tile-img');
      const ogImg = document.createElement('img');
      let urlObj = new URL(item.link.trim());
      ogImg.src = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${urlObj.hostname}&size=128`;

      // Determine device type
      const os = item.device;
      const deviceInfoDiv = document.createElement("div");
      deviceInfoDiv.classList.add("device-info");
      let deviceIcon = "output";
      let str = "";

      if (os.toLowerCase().includes("android") && os.includes("FT") && os.includes("TV")) {
        str = "TV";
        deviceIcon = "tv";
      } else if (os.toLowerCase().includes("android")) {
        str = "Android";
        deviceIcon = "smartphone";
      } else if (os.toLowerCase().includes("windows")) {
        str = "Windows";
        deviceIcon = "desktop_windows";
      }
      deviceInfoDiv.innerHTML = `<span class="material-symbols-outlined">${deviceIcon}</span> ${str}`;
      imgDiv.appendChild(ogImg);
      imgDiv.appendChild(deviceInfoDiv);

      // Link Display
      const deviceLinkDiv = document.createElement("div");
      deviceLinkDiv.classList.add("device-link");
      deviceLinkDiv.textContent = item.link.trim();
      imgDiv.appendChild(deviceLinkDiv);

      // Title
      const titleDiv = document.createElement('div');
      titleDiv.classList.add('live-tile-title');
      titleDiv.textContent = item.title;

      // Meta Info
      const metaDiv = document.createElement('div');
      metaDiv.classList.add('live-tile-meta');
      var relTime = formatRelativeTime(item.time);
      metaDiv.textContent = `${relTime}`;

      // Build structure
      tile.appendChild(imgDiv);
      tile.appendChild(titleDiv);
      tile.appendChild(metaDiv);

      // Handle Click
      tile.addEventListener('click', () => {
        handleItemSelect('click', item.link.trim());
      });

      liveGrid.appendChild(tile);
    });
  } catch (error) {
    console.error("Error loading live links:", error);
  }
}


/* ===========================================================
    Handling Click vs FastForward
    =========================================================== */

// Call function with API URL
// loadLiveLinks("https://api.com/getrequest");

function handleItemSelect(eventType, link, ele) {
  if (eventType === 'click') {
    // Normal click -> open link
    window.location.href = link;
  } else if (eventType === 'fastForward') {
    document.querySelectorAll(".device-info.active-live-link").forEach(el => el.classList.remove("active-live-link"));
    ele.querySelector(".device-info").classList.add("active-live-link");
    // Fast-forward key pressed -> do something else
    console.log('Fast-forward event on link:', link);
    // e.g. show a context menu, or load preview, etc.
    //alert('Fast-forward key event triggered for ' + link);
    try {
      window.ReactNativeWebView.postMessage("CONNECTOSURL:" + link);
    }
    catch (e) {
      console.log("Not in Connecto APP");
    }
  }
}

// document.addEventListener("keydown", function (event) {
//   //alert(`Key pressed: ${event.key}, KeyCode: ${event.keyCode}`);
//   // MediaFastForward, keyCode: 228
// });

/* ===========================================================
    Edit / Customize Mode for Quick Links
    =========================================================== */
const customiseBtn = document.getElementById('customiseBtn');
const addLinkBtn = document.getElementById('addLinkBtn');
const quickLinksContainer = document.getElementById('quickLinks');
const dropZone = document.getElementById('dropZone');
const editLinkModal = document.getElementById('editLinkModal');
const editLinkText = document.getElementById('editLinkText');
const editLinkUrl = document.getElementById('editLinkUrl');
const editLinkCancelBtn = document.getElementById('editLinkCancelBtn');
const editLinkSaveBtn = document.getElementById('editLinkSaveBtn');

let editMode = false;
let draggedItem = null;
let originalTabIndices = {};
let currentEditingLink = null;

customiseBtn.addEventListener('click', () => {
  editMode = !editMode;
  if (editMode) {
    customiseBtn.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle;">check</span> Done';
    enableEditMode();
  } else {
    customiseBtn.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle;">edit</span> Customise';
    disableEditMode();
    // TODO: POST updated order to API, if needed
  }
});

addLinkBtn.addEventListener('click', () => {
  // Mock adding a new link
  const newLink = {
    name: 'New Link',
    link: 'https://example.com/new',
    icon: 'https://via.placeholder.com/32?text=New'
  };
  renderQuickLink(newLink, document.querySelectorAll('.quick-link').length);

  // Make sure the new link is properly set up for edit mode
  const newElement = quickLinksContainer.lastElementChild;
  newElement.draggable = true;
  newElement.style.cursor = 'grab';
  newElement.classList.add('edit-mode');
  setupDragEvents(newElement);
  setupDoubleClickEdit(newElement); // Add double-click listener for the new element
});

function enableEditMode() {
  // Store original tabindex values
  originalTabIndices = {};
  document.querySelectorAll('[tabindex]').forEach(el => {
    originalTabIndices[el.getAttribute('tabindex')] = el;
    el.setAttribute('tabindex', -1); // Remove tabindex during edit
  });

  // Show dropZone or any instructions
  dropZone.classList.add('edit-mode');
  addLinkBtn.classList.add('edit-mode');

  // Make quick-links draggable and add edit mode styles
  Array.from(quickLinksContainer.children).forEach(linkEl => {
    linkEl.draggable = true;
    linkEl.style.cursor = 'grab';
    linkEl.classList.add('edit-mode');
    setupDragEvents(linkEl);
    setupDoubleClickEdit(linkEl); // Add double-click listener
  });

  // Add dragover listener to the container
  quickLinksContainer.addEventListener('dragover', handleContainerDragOver);
}

function setupDragEvents(linkEl) {
  linkEl.addEventListener('dragstart', onDragStart);
  linkEl.addEventListener('dragend', onDragEnd);
}

function disableEditMode() {
  dropZone.classList.remove('edit-mode');
  addLinkBtn.classList.remove('edit-mode');

  // Remove edit mode from links
  Array.from(quickLinksContainer.children).forEach(linkEl => {
    linkEl.draggable = false;
    linkEl.style.cursor = 'pointer';
    linkEl.classList.remove('edit-mode');
    linkEl.removeEventListener('dragstart', onDragStart);
    linkEl.removeEventListener('dragend', onDragEnd);
    linkEl.removeEventListener('dblclick', openEditLinkModal); // Remove double-click listener
  });

  // Remove container listeners
  quickLinksContainer.removeEventListener('dragover', handleContainerDragOver);

  // Reassign tabindex
  Object.keys(originalTabIndices).forEach(index => {
    originalTabIndices[index].setAttribute('tabindex', index);
  });
  originalTabIndices = {}; // Clear stored indices

  //log data array
  const data = Array.from(quickLinksContainer.children).map(linkEl => {
    return {
      name: linkEl.querySelector('.ql-text').textContent,
      link: linkEl.dataset.link
    };
  });

  console.log(JSON.stringify(data, null, 2));


  // Call the function to apply tabindex
  setTabIndexForQuickLinks();
}

function setTabIndexForQuickLinks() {
  const quickLinks = document.querySelectorAll('.quick-link');

  quickLinks.forEach((element, index) => {
    element.tabIndex = 4 + index;
  });
}


function onDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', null); // Required for Firefox

  draggedItem = this;
  this.classList.add('dragging');

  // Small delay so the dragging visual effect works
  setTimeout(() => {
    this.style.opacity = '0.5';
  }, 0);
}

function onDragEnd(e) {
  this.style.opacity = '1';
  this.classList.remove('dragging');
  draggedItem = null;

  // Remove any temporary placeholders
  const placeholders = document.querySelectorAll('.placeholder');
  placeholders.forEach(el => el.remove());
}

function handleContainerDragOver(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!draggedItem) return;

  // Get the element under the cursor
  const afterElement = getDragAfterElement(quickLinksContainer, e.clientX, e.clientY);

  if (afterElement === null) {
    quickLinksContainer.appendChild(draggedItem);
  } else if (afterElement !== draggedItem) {
    quickLinksContainer.insertBefore(draggedItem, afterElement);
  }
}

/**
 * Helper to figure out the correct place to drop the dragged item.
 * Fixed to work with any element position, not just start/end.
 */
function getDragAfterElement(container, x, y) {
  // Get all the draggable elements that aren't currently being dragged
  const draggableElements = [...container.querySelectorAll('.quick-link:not(.dragging)')];

  // Find the closest element based on mouse position
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;

    // Calculate distance from mouse to center of element
    const offsetX = x - centerX;
    const offsetY = y - centerY;
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    // Return the closest element
    return (distance < closest.distance) ?
      { distance: distance, element: child } :
      closest;
  }, { distance: Number.POSITIVE_INFINITY }).element;
}

/* ===========================================================
    Edit Link Modal Functionality
    =========================================================== */
function setupDoubleClickEdit(linkElement) {
  linkElement.addEventListener('dblclick', openEditLinkModal);
}

function openEditLinkModal(e) {
  if (!editMode) return;

  currentEditingLink = e.currentTarget;
  const textElement = currentEditingLink.querySelector('.ql-text');
  const linkUrl = currentEditingLink.dataset.link;

  editLinkText.value = textElement ? textElement.textContent : '';
  editLinkUrl.value = linkUrl;

  editLinkModal.style.display = 'flex';
}

editLinkCancelBtn.addEventListener('click', () => {
  editLinkModal.style.display = 'none';
  currentEditingLink = null;
});

editLinkSaveBtn.addEventListener('click', () => {
  if (!currentEditingLink) return;

  const newText = editLinkText.value.trim();
  const newUrl = editLinkUrl.value.trim();

  const textElement = currentEditingLink.querySelector('.ql-text');
  if (textElement) {
    textElement.textContent = newText;
  }
  currentEditingLink.dataset.link = newUrl;

  // Update the favicon (basic implementation, might need refinement)
  const iconImg = currentEditingLink.querySelector('.icon-container img');
  if (iconImg) {
    try {
      let urlObj = new URL(newUrl);
      iconImg.src = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${urlObj.hostname}&size=128`;
    } catch (error) {
      console.error("Invalid URL:", newUrl);
      // Optionally set a default icon or handle the error
    }
  }

  editLinkModal.style.display = 'none';
  currentEditingLink = null;
});

// Close modal if clicked outside
window.addEventListener('click', (event) => {
  if (event.target === editLinkModal) {
    editLinkModal.style.display = 'none';
    currentEditingLink = null;
  }
});
