/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
(function (funcName, baseObj) {
  funcName = funcName || "docReady";
  baseObj = baseObj || window;
  var readyList = [];
  var readyFired = false;
  var readyEventHandlersInstalled = false;

  function ready() {
    if (!readyFired) {
      readyFired = true;
      for (var i = 0; i < readyList.length; i++) {
        readyList[i].fn.call(window, readyList[i].ctx);
      }
      readyList = [];
    }
  }

  function readyStateChange() {
    if (document.readyState === "complete") {
      ready();
    }
  }

  baseObj[funcName] = function (callback, context) {
    if (typeof callback !== "function") {
      throw new TypeError("callback for docReady(fn) must be a function");
    }

    if (readyFired) {
      setTimeout(function () {
        callback(context);
      }, 1);
      return;
    } else {
      readyList.push({
        fn: callback,
        ctx: context
      });
    }
    if (document.readyState === "complete") {
      setTimeout(ready, 1);
    } else if (!readyEventHandlersInstalled) {
      if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", ready, false);
        window.addEventListener("load", ready, false);
      } else {
        document.attachEvent("onreadystatechange", readyStateChange);
        window.attachEvent("onload", ready);
      }
      readyEventHandlersInstalled = true;
    }
  };
})("docReady", window);

function getSiteSelector() {
  loadingOverlay(document.querySelector('body'));
  axios.get("/api/server").then(function (response) {
    if (response.data.status !== "success") {
      return toast(response.data.message, "Hmm..", "danger");
    }
    let options = "";
    response.data.data.rows.forEach(function (value, index) {
      if (value.selected == true) {
        document.getElementById("site-current-text").innerHTML =
          value.name + " - " + value.comment;
      }
      options += `<a href="javascript:void(0)" class="dropdown-item" data-id="${value.id}" data-name="${value.name}" data-comment="${value.comment}" onclick="selectSite(this)">${value.name} - ${value.comment}</a>`;
    });
    document.getElementById("site-selector").innerHTML = options;
    loadingOverlay(document.querySelector('body'), 'hide');
  }).catch(function (error) {
    // Handle ajax error
    toast(error, "Request Site List Error!", "danger");
    loadingOverlay(document.querySelector('body'), 'hide');
  });
}

function selectSite(element) {
  loadingOverlay(document.querySelector('body'));
  var serverId = element.getAttribute("data-id");
  var serverName = element.getAttribute("data-name");
  var serverComment = element.getAttribute("data-comment");

  selectServer(serverId).then(function (response) {
    document.getElementById("site-current-text").innerHTML =
      serverName + " - " + serverComment;
    loadingOverlay(document.querySelector('body'), 'hide');
  }).catch(function (error) {
    toast(error, "Select Site Error!", "danger");
    loadingOverlay(document.querySelector('body'), 'hide');
  });
}

function selectServer(serverId) {
  return axios.post("/api/server/selectSite", {
    serverId: serverId,
  }).then(function (response) {
    this.success = response.data.status === 'success';
    if (typeof serverChanged === "function") {
      serverChanged();
    }
    this.response = response;
  });
}

function serializeFormData(element, convertTypingCase = {
  enabled: false
}) {
  var formData = new FormData(element);
  var data = {};
  for (let [key, val] of formData.entries()) {
    let newKey = key;
    if (newKey.includes('[]')) {
      newKey = key.replace('[]', '');
      val = Array();
      formElements = document.getElementsByName(key);
      formElements.forEach(function (element) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          if (element.checked) {
            val.push(element.value);
          }
        } else {
          val.push(element.value);
        }
      });
    }
    if (convertTypingCase.enabled) {
      newKey = changeCase(newKey, convertTypingCase.fromCase, convertTypingCase.toCase);
    }
    Object.assign(data, {
      [newKey]: val,
    });
  }
  return data;
}

function bytesToSize(bytes, unit = "bps") {
  var sizes = Array();
  switch (unit) {
    case "bit":
      sizes = ["Bit", "Kb", "Mb", "Gb", "Tb"];
      break;
    case "byte":
      sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      break;
    case "bps":
      sizes = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
      break;
    case "Bps":
      sizes = ["Bps", "KBps", "MBps", "GBps", "TBps"];
      break;
  }
  if (bytes == 0) return "0 " + sizes[0];
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function changeCase(string, fromCase, toCase) {
  let words = [];
  let result = "";
  switch (fromCase) {
    case "camel":
    case "pascal":
      words = string.split(/(?=[A-Z])/);
      break;
    case "snake":
      words = string.split("_");
      break;
    case "kebab":
      words = string.split("-");
      break;
    default:
      return false;
  }

  String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  switch (toCase) {
    case "camel":
      words.forEach(function (value, index) {
        if (index == 0) {
          result += value.toLowerCase();
        } else {
          result += value.toTitleCase();
        }
      });
      break;
    case "pascal":
      words.forEach(function (value, index) {
        result += value.toTitleCase();
      });
      break;
    case "snake":
      var resultTmp = words.join("_");
      result = resultTmp.toLowerCase();
      break;
    case "kebab":
      var resultTmp = words.join("-");
      result = resultTmp.toLowerCase();
      break;
    default:
      return false;
      break;
  }
  return result;
}

function toast(message, title = "", state = "default") {
  let headerClass = "";
  let icon = "";
  switch (state) {
    case "primary":
      title = title === "" ? "Hola!" : title;
      headerClass = "bg-primary text-white";
      icon = "👋";
      break;
    case "success":
      title = title === "" ? "Success!" : title;
      headerClass = "bg-success text-white";
      icon = "✅";
      break;
    case "info":
      title = title === "" ? "Info!" : title;
      headerClass = "bg-info text-white";
      icon = "ℹ️";
      break;
    case "warning":
      title = title === "" ? "Warning!" : title;
      headerClass = "bg-warning text-white";
      icon = "⚠️";
      break;
    case "danger":
      title = title === "" ? "Alert!" : title;
      headerClass = "bg-danger text-white";
      icon = "❌";
      break;
  }

  let toast = document.createElement("div");
  toast.classList.add("toast", "show");
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", true);
  toast.setAttribute("data-bs-autohide", false);
  toast.setAttribute("data-bs-toggle", "toast");
  toast.innerHTML = /*html*/ `<div class="toast-header ${headerClass}">
    <span class="me-2">${icon}</span>
    <strong class="me-auto">${title}</strong>
    <button type="button" class="ms-2 btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
  <div class="toast-body">${message}</div>`;

  document.getElementById("toast-container").append(toast);
  var toastElList = [].slice.call(document.querySelectorAll(".toast"));
  var toastList = toastElList.map(function (toastEl) {
    return new bootstrap.Toast(toastEl);
  });
}

function loadingOverlay(element, action = "show") {
  if (action == "show") {
    var overlay = document.createElement("div");
    overlay.classList.add("overlay-container");
    overlay.innerHTML = `<div style="position: absolute; top: 50%; left: 50%"><div class="spinner-border text-white" role="status"></div></div>`;

    element.setAttribute('data-prev-pos', element.style.position);
    element.style.position = 'relative';
    element.appendChild(overlay);
  } else {
    var overlays = element.querySelectorAll('.overlay-container');
    element.style.position = element.getAttribute('data-prev-pos');
    overlays.forEach(function (overlay) {
      overlay.remove();
    });
  }
}

function findGetParameter(parameterName) {
  var result = null,
    tmp = [];
  location.search.substr(1).split("&").forEach(function (item) {
    tmp = item.split("=");
    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
  });
  return result;
}

function formatDuration(second) {
  if (second < 0) second = -second;
  const time = {
      D: Math.floor(second / 86400),
      H: Math.floor(second / 3600) % 24,
      M: Math.floor(second / 60) % 60
  };
  return Object.entries(time)
      .filter(val => val[1] !== 0)
      .map(([key, val]) => `${val}${key}`)
      .join(' ');
};